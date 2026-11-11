import type { Game } from '@nba-analytics-hub/games';
import type { GameUpdatedChangeKind, GameUpdatedEvent, LiveGameEntry } from '../types/game-updated.js';

export type ParseGameUpdatedResult =
  | { ok: true; event: GameUpdatedEvent }
  | { ok: false; reason: string };

const CHANGE_KINDS: readonly GameUpdatedChangeKind[] = ['created', 'status', 'score'];
const STATUS_KINDS: readonly string[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'FINAL',
  'POSTPONED',
  'CANCELED',
];
const TOP_LEVEL_KEYS = new Set([
  'eventId',
  'eventType',
  'schemaVersion',
  'occurredAt',
  'changeKind',
  'game',
]);

type Fields = Record<string, unknown>;

function isRecord(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isTeam(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function gameProblem(game: unknown): string | undefined {
  if (!isRecord(game)) return 'game must be an object';
  if (!isNonEmptyString(game.id)) return 'game.id must be a non-empty string';
  if (typeof game.provider !== 'string') return 'game.provider must be a string';
  if (!isTeam(game.homeTeam)) return 'game.homeTeam is invalid';
  if (!isTeam(game.awayTeam)) return 'game.awayTeam is invalid';
  if (typeof game.startTime !== 'string') return 'game.startTime must be a string';
  if (typeof game.status !== 'string') return 'game.status must be a string';
  if (typeof game.statusKind !== 'string' || !STATUS_KINDS.includes(game.statusKind)) {
    return 'game.statusKind is invalid';
  }
  const score = game.score;
  if (!isRecord(score) || !Number.isInteger(score.home) || !Number.isInteger(score.away)) {
    return 'game.score must have integer home and away';
  }
  if (game.meta !== undefined && !isRecord(game.meta)) return 'game.meta must be an object';
  return undefined;
}

function eventProblem(value: Fields): string | undefined {
  for (const key of Object.keys(value)) {
    if (!TOP_LEVEL_KEYS.has(key)) return `unexpected field ${key}`;
  }
  if (!isNonEmptyString(value.eventId)) return 'eventId must be a non-empty string';
  if (value.eventType !== 'game.updated') return 'eventType must be game.updated';
  if (value.schemaVersion !== 1) return 'schemaVersion must be 1';
  if (typeof value.occurredAt !== 'string' || Number.isNaN(Date.parse(value.occurredAt))) {
    return 'occurredAt must be a date-time string';
  }
  if (!CHANGE_KINDS.includes(value.changeKind as GameUpdatedChangeKind)) {
    return 'changeKind must be created, status or score';
  }
  return gameProblem(value.game);
}

/** Parses and checks a `game.updated` message body against schema v1. */
export function parseGameUpdatedEvent(raw: string): ParseGameUpdatedResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid JSON' };
  }
  if (!isRecord(value)) return { ok: false, reason: 'event must be a JSON object' };
  const problem = eventProblem(value);
  if (problem) return { ok: false, reason: problem };
  return { ok: true, event: value as unknown as GameUpdatedEvent };
}

/**
 * Returns the entry to store for this event, or undefined when the event
 * should be ignored. Ignored: an event older than the stored one, and any
 * non-FINAL event for a game that is already FINAL.
 */
export function applyGameUpdated(
  current: LiveGameEntry | undefined,
  event: GameUpdatedEvent,
): LiveGameEntry | undefined {
  if (current) {
    if (Date.parse(event.occurredAt) < Date.parse(current.occurredAt)) return undefined;
    const incoming: Game['statusKind'] = event.game.statusKind;
    if (current.game.statusKind === 'FINAL' && incoming !== 'FINAL') return undefined;
  }
  return { game: event.game, occurredAt: event.occurredAt };
}
