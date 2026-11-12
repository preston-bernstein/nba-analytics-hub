import { vi } from 'vitest';
import {
  startConsumer,
  type EachMessagePayloadLike,
  type KafkaLike,
} from './consumer.js';
import { PoisonMessageError } from './handler.js';

function fakeKafka() {
  const state = {
    eachMessage: undefined as undefined | ((p: EachMessagePayloadLike) => Promise<void>),
    subscribed: undefined as undefined | { topic: string; fromBeginning: boolean },
    groupId: undefined as undefined | string,
    sent: [] as Array<{ topic: string; messages: Array<Record<string, unknown>> }>,
    consumerDisconnected: false,
    producerDisconnected: false,
    sendError: undefined as undefined | Error,
  };
  const kafka: KafkaLike = {
    consumer: ({ groupId }) => {
      state.groupId = groupId;
      return {
        connect: async () => undefined,
        subscribe: async (args) => {
          state.subscribed = args;
        },
        run: async ({ eachMessage }) => {
          state.eachMessage = eachMessage;
        },
        disconnect: async () => {
          state.consumerDisconnected = true;
        },
      };
    },
    producer: () => ({
      connect: async () => undefined,
      send: async (record) => {
        if (state.sendError) throw state.sendError;
        state.sent.push(record as never);
      },
      disconnect: async () => {
        state.producerDisconnected = true;
      },
    }),
  };
  return { kafka, state };
}

function payload(overrides: Partial<EachMessagePayloadLike['message']> = {}): EachMessagePayloadLike {
  return {
    topic: 'game.updated',
    partition: 2,
    message: {
      key: Buffer.from('game-1'),
      value: Buffer.from('{"a":1}'),
      offset: '41',
      headers: { trace: Buffer.from('t1') },
      ...overrides,
    },
  };
}

const text = (v: Buffer | string) => v.toString();
const noSleep = async () => undefined;
const topics = { topic: 'game.updated', dlqTopic: 'game.updated.dlq' };
const quiet = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

describe('startConsumer', () => {
  it('subscribes from the beginning with the given group', async () => {
    const { kafka, state } = fakeKafka();
    await startConsumer({ kafka, groupId: 'bff', ...topics, handler: vi.fn(), logger: quiet });
    expect(state.groupId).toBe('bff');
    expect(state.subscribed).toEqual({ topic: 'game.updated', fromBeginning: true });
  });

  it('passes the message value to the handler and resolves', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn().mockReturnValue('applied');
    await startConsumer({ kafka, groupId: 'bff', ...topics, handler, logger: quiet });
    await state.eachMessage!(payload());
    expect(handler).toHaveBeenCalledWith('{"a":1}');
    expect(state.sent).toHaveLength(0);
  });

  it('retries a transient failure with exponential backoff, then succeeds', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('t1');
      })
      .mockImplementationOnce(() => {
        throw new Error('t2');
      })
      .mockReturnValue('applied');
    const sleep = vi.fn(noSleep);
    await startConsumer({
      kafka,
      groupId: 'bff', ...topics,
      handler,
      sleep,
      retry: { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 1000 },
      logger: quiet,
    });
    await state.eachMessage!(payload());
    expect(handler).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200]);
    expect(state.sent).toHaveLength(0);
  });

  it('caps the backoff delay', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn(() => {
      throw new Error('down');
    });
    const sleep = vi.fn(noSleep);
    await startConsumer({
      kafka,
      groupId: 'bff', ...topics,
      handler,
      sleep,
      retry: { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 250 },
      logger: quiet,
    });
    await expect(state.eachMessage!(payload())).rejects.toThrow('down');
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200, 250, 250]);
  });

  it('rejects after bounded retries so the offset is not committed, and sends nothing to the DLQ', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn(() => {
      throw new Error('still down');
    });
    await startConsumer({
      kafka,
      groupId: 'bff', ...topics,
      handler,
      sleep: noSleep,
      retry: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 },
      logger: quiet,
    });
    await expect(state.eachMessage!(payload())).rejects.toThrow('still down');
    expect(handler).toHaveBeenCalledTimes(3);
    expect(state.sent).toHaveLength(0);
  });

  it('sends a poison message to the DLQ with headers, without retrying', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn(() => {
      throw new PoisonMessageError('bad json');
    });
    const sleep = vi.fn(noSleep);
    await startConsumer({ kafka, groupId: 'bff', ...topics, handler, sleep, logger: quiet });
    await state.eachMessage!(payload());
    expect(handler).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
    expect(state.sent).toHaveLength(1);
    const sent = state.sent[0]!;
    expect(sent.topic).toBe('game.updated.dlq');
    const msg = sent.messages[0] as {
      key: Buffer;
      value: Buffer;
      headers: Record<string, Buffer | string>;
    };
    expect(msg.key.toString()).toBe('game-1');
    expect(msg.value.toString()).toBe('{"a":1}');
    expect(text(msg.headers['dlq-reason']!)).toBe('bad json');
    expect(text(msg.headers['dlq-source-topic']!)).toBe('game.updated');
    expect(text(msg.headers['dlq-source-partition']!)).toBe('2');
    expect(text(msg.headers['dlq-source-offset']!)).toBe('41');
    expect(text(msg.headers['dlq-consumer-group']!)).toBe('bff');
    expect(text(msg.headers['trace']!)).toBe('t1');
  });

  it('treats an empty value as poison', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn();
    await startConsumer({ kafka, groupId: 'bff', ...topics, handler, logger: quiet });
    await state.eachMessage!(payload({ value: null }));
    expect(handler).not.toHaveBeenCalled();
    expect(state.sent).toHaveLength(1);
  });

  it('rejects (no commit) when the DLQ publish fails', async () => {
    const { kafka, state } = fakeKafka();
    state.sendError = new Error('dlq down');
    const handler = vi.fn(() => {
      throw new PoisonMessageError('bad');
    });
    await startConsumer({ kafka, groupId: 'bff', ...topics, handler, logger: quiet });
    await expect(state.eachMessage!(payload())).rejects.toThrow('dlq down');
  });

  it('uses topic names from options', async () => {
    const { kafka, state } = fakeKafka();
    const handler = vi.fn(() => {
      throw new PoisonMessageError('bad');
    });
    await startConsumer({
      kafka,
      groupId: 'bff',
      handler,
      topic: 'it.game.updated.x',
      dlqTopic: 'it.game.updated.x.dlq',
      logger: quiet,
    });
    expect(state.subscribed?.topic).toBe('it.game.updated.x');
    await state.eachMessage!(payload());
    expect(state.sent[0]!.topic).toBe('it.game.updated.x.dlq');
  });

  it('stop disconnects consumer and producer', async () => {
    const { kafka, state } = fakeKafka();
    const consumer = await startConsumer({
      kafka,
      groupId: 'bff', ...topics,
      handler: vi.fn(),
      logger: quiet,
    });
    await consumer.stop();
    expect(state.consumerDisconnected).toBe(true);
    expect(state.producerDisconnected).toBe(true);
  });
});
