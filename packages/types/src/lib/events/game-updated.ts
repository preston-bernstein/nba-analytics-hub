import type { Game } from '../games/types.js';

// Envelope for the `game.updated` Kafka topic (schema `game.updated.v1`).
// The JSON schema lives in the nba-infra repo: kafka/schemas/game.updated.v1.json.
export type GameUpdatedChangeKind = 'created' | 'status' | 'score';

export interface GameUpdatedEvent {
  eventId: string;
  eventType: 'game.updated';
  schemaVersion: 1;
  occurredAt: string;
  changeKind: GameUpdatedChangeKind;
  game: Game;
}

// One row of the live-games read model: the latest game plus the time of the
// event that set it. The time is used to ignore older events.
export interface LiveGameEntry {
  game: Game;
  occurredAt: string;
}
