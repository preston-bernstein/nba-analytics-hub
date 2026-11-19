/** The message can never succeed (bad JSON, schema mismatch). Do not retry it. */
export class PoisonMessageError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'PoisonMessageError';
  }
}

type HeaderValue = Buffer | string | Array<Buffer | string> | undefined;
type Headers = Record<string, HeaderValue>;

export interface EachMessagePayloadLike {
  topic: string;
  partition: number;
  message: {
    key: Buffer | null;
    value: Buffer | null;
    offset: string;
    headers?: Headers;
  };
}

// The small part of kafkajs that this file uses. A kafkajs `Kafka` fits it,
// and tests pass a fake.
export interface KafkaLike {
  consumer(config: { groupId: string }): {
    connect(): Promise<void>;
    subscribe(args: { topic: string; fromBeginning: boolean }): Promise<void>;
    run(config: { eachMessage: (p: EachMessagePayloadLike) => Promise<void> }): Promise<void>;
    disconnect(): Promise<void>;
  };
  producer(): {
    connect(): Promise<void>;
    send(record: {
      topic: string;
      messages: Array<{ key: Buffer | null; value: Buffer | null; headers: Headers }>;
    }): Promise<unknown>;
    disconnect(): Promise<void>;
  };
}

interface RetryOptions {
  /** Total tries per message, including the first. */
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 5,
  baseDelayMs: 200,
  maxDelayMs: 5000,
};

type Logger = Pick<Console, 'info' | 'warn' | 'error'>;

export interface ConsumerOptions {
  kafka: KafkaLike;
  groupId: string;
  /** Source topic. */
  topic: string;
  /** Dead-letter topic for poison messages. */
  dlqTopic: string;
  handler: (value: string) => unknown | Promise<unknown>;
  fromBeginning?: boolean;
  retry?: RetryOptions;
  sleep?: (ms: number) => Promise<void>;
  logger?: Logger;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Producer = ReturnType<KafkaLike['producer']>;

/** What the per-message functions need. Built once by `startConsumer`. */
interface Pipeline {
  producer: Producer;
  groupId: string;
  topic: string;
  dlqTopic: string;
  handler: ConsumerOptions['handler'];
  retry: RetryOptions;
  sleep: (ms: number) => Promise<void>;
  logger: Logger;
}

async function sendToDlq(p: Pipeline, payload: EachMessagePayloadLike, reason: string) {
  const { message, topic: sourceTopic, partition } = payload;
  await p.producer.send({
    topic: p.dlqTopic,
    messages: [
      {
        key: message.key,
        value: message.value,
        headers: {
          ...message.headers,
          'dlq-reason': reason,
          'dlq-source-topic': sourceTopic,
          'dlq-source-partition': String(partition),
          'dlq-source-offset': message.offset,
          'dlq-consumer-group': p.groupId,
        },
      },
    ],
  });
}

async function handleWithRetry(p: Pipeline, value: string) {
  const { retry } = p;
  for (let attempt = 1; ; attempt += 1) {
    try {
      await p.handler(value);
      return;
    } catch (err) {
      if (err instanceof PoisonMessageError || attempt >= retry.maxAttempts) throw err;
      const delay = Math.min(retry.maxDelayMs, retry.baseDelayMs * 2 ** (attempt - 1));
      p.logger.warn(`${p.topic} attempt ${attempt} failed, retrying in ${delay}ms`, err);
      await p.sleep(delay);
    }
  }
}

async function eachMessage(p: Pipeline, payload: EachMessagePayloadLike) {
  const value = payload.message.value;
  try {
    if (value === null) throw new PoisonMessageError('empty message value');
    await handleWithRetry(p, value.toString('utf8'));
  } catch (err) {
    if (!(err instanceof PoisonMessageError)) {
      p.logger.error(`${p.topic} failed after retries; offset not committed`, err);
      throw err;
    }
    p.logger.warn(`${p.topic} poison message sent to DLQ: ${err.message}`);
    await sendToDlq(p, payload, err.message);
  }
}

/**
 * Starts the consumer. Each message is handled inside `eachMessage`, and
 * kafkajs commits the offset only after that promise resolves.
 *
 * - Poison message: copy to the DLQ topic, then resolve (offset is committed).
 * - Other error: retry with exponential backoff up to `maxAttempts`, then
 *   reject. The offset is not committed, so the message is delivered again.
 */
export async function startConsumer(options: ConsumerOptions) {
  const { kafka, groupId, topic, fromBeginning = true } = options;
  const consumer = kafka.consumer({ groupId });
  const producer = kafka.producer();
  const pipeline: Pipeline = {
    producer,
    groupId,
    topic,
    dlqTopic: options.dlqTopic,
    handler: options.handler,
    retry: options.retry ?? DEFAULT_RETRY,
    sleep: options.sleep ?? defaultSleep,
    logger: options.logger ?? console,
  };

  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning });
  await consumer.run({ eachMessage: (payload) => eachMessage(pipeline, payload) });
  pipeline.logger.info(`kafka consumer started (group ${groupId}, topic ${topic})`);

  return {
    async stop() {
      await consumer.disconnect();
      await producer.disconnect();
    },
  };
}
