import { PoisonMessageError } from './handler.js';

const GAME_UPDATED_TOPIC = 'game.updated';
const GAME_UPDATED_DLQ_TOPIC = 'game.updated.dlq';

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

export interface GameUpdatedConsumerOptions {
  kafka: KafkaLike;
  groupId: string;
  /** Source topic. Defaults to game.updated. */
  topic?: string;
  /** Dead-letter topic. Defaults to game.updated.dlq. */
  dlqTopic?: string;
  handler: (value: string) => unknown | Promise<unknown>;
  fromBeginning?: boolean;
  retry?: RetryOptions;
  sleep?: (ms: number) => Promise<void>;
  logger?: Logger;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Starts the consumer. Each message is handled inside `eachMessage`, and
 * kafkajs commits the offset only after that promise resolves.
 *
 * - Poison message: copy to the DLQ topic, then resolve (offset is committed).
 * - Other error: retry with exponential backoff up to `maxAttempts`, then
 *   reject. The offset is not committed, so the message is delivered again.
 */
export async function startGameUpdatedConsumer(options: GameUpdatedConsumerOptions) {
  const {
    kafka,
    groupId,
    topic = GAME_UPDATED_TOPIC,
    dlqTopic = GAME_UPDATED_DLQ_TOPIC,
    handler,
    fromBeginning = true,
    retry = DEFAULT_RETRY,
    sleep = defaultSleep,
    logger = console,
  } = options;

  const consumer = kafka.consumer({ groupId });
  const producer = kafka.producer();

  async function sendToDlq(payload: EachMessagePayloadLike, reason: string) {
    const { message, topic: sourceTopic, partition } = payload;
    await producer.send({
      topic: dlqTopic,
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
            'dlq-consumer-group': groupId,
          },
        },
      ],
    });
  }

  async function handleWithRetry(value: string) {
    for (let attempt = 1; ; attempt += 1) {
      try {
        await handler(value);
        return;
      } catch (err) {
        if (err instanceof PoisonMessageError || attempt >= retry.maxAttempts) throw err;
        const delay = Math.min(retry.maxDelayMs, retry.baseDelayMs * 2 ** (attempt - 1));
        logger.warn(`game.updated attempt ${attempt} failed, retrying in ${delay}ms`, err);
        await sleep(delay);
      }
    }
  }

  async function eachMessage(payload: EachMessagePayloadLike) {
    const value = payload.message.value;
    try {
      if (value === null) throw new PoisonMessageError('empty message value');
      await handleWithRetry(value.toString('utf8'));
    } catch (err) {
      if (!(err instanceof PoisonMessageError)) {
        logger.error('game.updated failed after retries; offset not committed', err);
        throw err;
      }
      logger.warn(`game.updated poison message sent to DLQ: ${err.message}`);
      await sendToDlq(payload, err.message);
    }
  }

  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning });
  await consumer.run({ eachMessage });
  logger.info(`kafka consumer started (group ${groupId}, topic ${topic})`);

  return {
    async stop() {
      await consumer.disconnect();
      await producer.disconnect();
    },
  };
}
