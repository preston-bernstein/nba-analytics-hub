import { Kafka, logLevel } from 'kafkajs';
import { loadEnv } from '@nba-analytics-hub/config';
import { BoundedIdSet } from './boundedIdSet.js';
import { startConsumer, type KafkaLike } from './consumer.js';
import { createGameUpdatedHandler } from './handler.js';
import { LiveGamesReadModel } from './liveGamesReadModel.js';

const CONSUMER_GROUP_ID = 'bff';
const GAME_UPDATED_TOPIC = 'game.updated';
const GAME_UPDATED_DLQ_TOPIC = 'game.updated.dlq';
/** How many recent eventIds are remembered. Older ids are forgotten. */
const SEEN_EVENT_IDS_MAX = 10_000;

/** The one read model shared by the SSE route and the consumer. */
export const liveGames = new LiveGamesReadModel();

/**
 * Starts the Kafka consumer when KAFKA_BROKERS is set. Returns undefined
 * (and does nothing) when it is not.
 */
export async function startLiveGamesConsumer(
  env: Record<string, string | undefined> = process.env,
) {
  const { KAFKA_BROKERS } = loadEnv(env);
  if (KAFKA_BROKERS.length === 0) return undefined;

  const kafka = new Kafka({
    clientId: 'nba-bff',
    brokers: KAFKA_BROKERS,
    logLevel: logLevel.WARN,
  });
  const handler = createGameUpdatedHandler({
    model: liveGames,
    seen: new BoundedIdSet(SEEN_EVENT_IDS_MAX),
  });
  return startConsumer({
    kafka: kafka as unknown as KafkaLike,
    groupId: CONSUMER_GROUP_ID,
    topic: GAME_UPDATED_TOPIC,
    dlqTopic: GAME_UPDATED_DLQ_TOPIC,
    handler,
  });
}
