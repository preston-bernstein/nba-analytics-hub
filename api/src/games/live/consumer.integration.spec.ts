// Needs a running broker. Skipped unless KAFKA_TEST_BROKERS is set,
// for example KAFKA_TEST_BROKERS=localhost:29092. Each run creates its own
// topics (it.game.updated.<id> and .dlq) and deletes them at the end.
import { randomUUID } from 'node:crypto';
import { Kafka, logLevel, type Admin, type Consumer, type Producer } from 'kafkajs';
import { mockGames } from '@nba-analytics-hub/games';
import type { GameUpdatedEvent } from '@nba-analytics-hub/events';
import { BoundedIdSet } from './boundedIdSet.js';
import { startConsumer, type KafkaLike } from '../../platform/kafka/consumer.js';
import { createGameUpdatedHandler } from './handler.js';
import { LiveGamesReadModel } from './liveGamesReadModel.js';

const brokers = process.env.KAFKA_TEST_BROKERS?.split(',').map((b) => b.trim());
const quiet = { info: () => undefined, warn: () => undefined, error: () => undefined };

function makeEvent(gameId: string, offsetSeconds = 0): GameUpdatedEvent {
  return {
    eventId: randomUUID(),
    eventType: 'game.updated',
    schemaVersion: 1,
    occurredAt: new Date(Date.UTC(2025, 0, 1, 0, 0, offsetSeconds)).toISOString(),
    changeKind: 'score',
    game: { ...mockGames[0]!, id: gameId },
  };
}

async function waitUntil(check: () => boolean, ms = 30_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (check()) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('timed out waiting');
}

interface Broker {
  run: string;
  kafka: Kafka;
  producer: Producer;
  admin: Admin;
  topic: string;
  dlqTopic: string;
  extraConsumers: Consumer[];
  stops: Array<() => Promise<void>>;
}

// Connects a producer and admin and creates this describe's own topics, then
// cleans up after each test and at the end. Call it inside a describe.
function useBroker(label: string): Broker {
  const run = `${randomUUID().slice(0, 8)}-${label}`;
  const topic = `it.game.updated.${run}`;
  const dlqTopic = `${topic}.dlq`;
  const b = { run, topic, dlqTopic, extraConsumers: [], stops: [] } as unknown as Broker;

  beforeAll(async () => {
    b.kafka = new Kafka({ clientId: `it-${run}`, brokers: brokers!, logLevel: logLevel.NOTHING });
    b.producer = b.kafka.producer();
    b.admin = b.kafka.admin();
    await b.producer.connect();
    await b.admin.connect();
    await b.admin.createTopics({
      topics: [
        { topic, numPartitions: 3 },
        { topic: dlqTopic, numPartitions: 1 },
      ],
    });
  });

  // Stop every consumer after each test so one test's consumer cannot see
  // another test's messages.
  afterEach(async () => {
    for (const stop of b.stops.splice(0)) await stop().catch(() => undefined);
    for (const c of b.extraConsumers.splice(0)) await c.disconnect().catch(() => undefined);
  });

  afterAll(async () => {
    await b.producer?.disconnect();
    await b.admin?.deleteTopics({ topics: [topic, dlqTopic] }).catch(() => undefined);
    await b.admin?.disconnect();
  });

  return b;
}

async function startWith(b: Broker, groupId: string, onValue: (v: string) => void) {
  const { kafka, topic, dlqTopic } = b;
  const model = new LiveGamesReadModel();
  // Wait for the group join so the "start at the end" position is fixed
  // before the test publishes anything.
  let joined!: () => void;
  const joinedPromise = new Promise<void>((resolve) => (joined = resolve));
  const spyKafka: KafkaLike = {
    producer: () => kafka.producer() as unknown as ReturnType<KafkaLike['producer']>,
    consumer: (config) => {
      const real = kafka.consumer(config);
      real.on(real.events.GROUP_JOIN, () => joined());
      return real as unknown as ReturnType<KafkaLike['consumer']>;
    },
  };
  const inner = createGameUpdatedHandler({ model, seen: new BoundedIdSet(1000) });
  const consumer = await startConsumer({
    kafka: spyKafka,
    groupId,
    topic,
    dlqTopic,
    // Tests start at the end of the topic so old data is not replayed.
    fromBeginning: false,
    handler: (value) => {
      const result = inner(value);
      onValue(value);
      return result;
    },
    logger: quiet,
  });
  b.stops.push(consumer.stop);
  await joinedPromise;
  await new Promise((r) => setTimeout(r, 1000));
  return { model, consumer };
}

describe.skipIf(!brokers)('game.updated consumer against a real broker (dup)', () => {
  const b = useBroker('dup');
  it('applies a duplicate event once', async () => {
    const gameId = `dup-${b.run}`;
    const applied: string[] = [];
    const { model } = await startWith(b, `it-dup-${b.run}`, (v) => applied.push(v));
    const evt = makeEvent(gameId);
    const value = JSON.stringify(evt);
    const listener = vi.fn();
    model.subscribe(listener);
    await b.producer.send({
      topic: b.topic,
      messages: [
        { key: gameId, value },
        { key: gameId, value },
      ],
    });
    await waitUntil(() => applied.filter((v) => v === value).length >= 2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(model.get(gameId)?.id).toBe(gameId);
  }, 60_000);
});

describe.skipIf(!brokers)('game.updated consumer against a real broker (dlq)', () => {
  const b = useBroker('dlq');
  it('puts a bad message on game.updated.dlq with headers', async () => {
    const key = `bad-${b.run}`;
    const groupId = `it-dlq-${b.run}`;
    await startWith(b, groupId, () => undefined);
    const dlq = b.kafka.consumer({ groupId: `it-dlq-reader-${b.run}` });
    b.extraConsumers.push(dlq);
    await dlq.connect();
    await dlq.subscribe({ topic: b.dlqTopic, fromBeginning: false });
    const found: Array<{ key?: string; value?: string; headers: Record<string, string> }> = [];
    await dlq.run({
      eachMessage: async ({ message }) => {
        if (message.key?.toString() !== key) return;
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(message.headers ?? {})) headers[k] = String(v);
        found.push({ key: message.key?.toString(), value: message.value?.toString(), headers });
      },
    });
    await b.producer.send({
      topic: b.topic,
      messages: [{ key, value: '{ this is not json' }],
    });
    await waitUntil(() => found.length > 0);
    const m = found[0]!;
    expect(m.value).toBe('{ this is not json');
    expect(m.headers['dlq-source-topic']).toBe(b.topic);
    expect(m.headers['dlq-consumer-group']).toBe(groupId);
    expect(m.headers['dlq-reason']).toBeTruthy();
    expect(m.headers['dlq-source-partition']).toMatch(/^\d+$/);
    expect(m.headers['dlq-source-offset']).toMatch(/^\d+$/);
  }, 60_000);
});

describe.skipIf(!brokers)('game.updated consumer against a real broker (resume)', () => {
  const b = useBroker('resume');
  it('resumes from the committed offset after a restart', async () => {
    const gameId = `resume-${b.run}`;
    const groupId = `it-resume-${b.run}`;
    const first = makeEvent(gameId, 1);
    const second = makeEvent(gameId, 2);
    const third = makeEvent(gameId, 3);
    const seen1: string[] = [];
    const c1 = await startWith(b, groupId, (v) => seen1.push(v));
    await b.producer.send({
      topic: b.topic,
      messages: [
        { key: gameId, value: JSON.stringify(first) },
        { key: gameId, value: JSON.stringify(second) },
      ],
    });
    await waitUntil(() => seen1.length >= 2);
    await c1.consumer.stop();

    const seen2: string[] = [];
    await startWith(b, groupId, (v) => seen2.push(v));
    await b.producer.send({
      topic: b.topic,
      messages: [{ key: gameId, value: JSON.stringify(third) }],
    });
    await waitUntil(() => seen2.some((v) => v.includes(third.eventId)));
    // Give any replay time to show up before asserting.
    await new Promise((r) => setTimeout(r, 2000));
    expect(seen2.some((v) => v.includes(first.eventId))).toBe(false);
    expect(seen2.some((v) => v.includes(second.eventId))).toBe(false);
  }, 90_000);
});
