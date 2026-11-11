import type { GameUpdatedEvent } from '../types/game-updated.js';
import { mockGames } from '@nba-analytics-hub/testing';
import {
  applyGameUpdated,
  parseGameUpdatedEvent,
} from './game-updated.js';

const baseGame = mockGames[0]!;

function makeEvent(overrides: Partial<GameUpdatedEvent> = {}): GameUpdatedEvent {
  return {
    eventId: '11111111-1111-4111-8111-111111111111',
    eventType: 'game.updated',
    schemaVersion: 1,
    occurredAt: '2025-01-01T01:00:00Z',
    changeKind: 'created',
    game: baseGame,
    ...overrides,
  };
}

describe('parseGameUpdatedEvent', () => {
  it('accepts a valid event', () => {
    const event = makeEvent();
    const result = parseGameUpdatedEvent(JSON.stringify(event));
    expect(result).toEqual({ ok: true, event });
  });

  it('accepts a game without meta', () => {
    const { meta: _meta, ...noMeta } = baseGame;
    const event = makeEvent({ game: noMeta });
    expect(parseGameUpdatedEvent(JSON.stringify(event)).ok).toBe(true);
  });

  it('rejects bad JSON', () => {
    expect(parseGameUpdatedEvent('{not json')).toEqual({ ok: false, reason: 'invalid JSON' });
  });

  it('rejects non-object payloads', () => {
    expect(parseGameUpdatedEvent('[]').ok).toBe(false);
    expect(parseGameUpdatedEvent('null').ok).toBe(false);
    expect(parseGameUpdatedEvent('42').ok).toBe(false);
  });

  it.each([
    ['eventId', { eventId: '' }],
    ['eventType', { eventType: 'game.deleted' }],
    ['schemaVersion', { schemaVersion: 2 }],
    ['occurredAt', { occurredAt: 'yesterday' }],
    ['changeKind', { changeKind: 'other' }],
  ])('rejects a bad %s', (field, patch) => {
    const result = parseGameUpdatedEvent(JSON.stringify({ ...makeEvent(), ...patch }));
    expect(result).toMatchObject({ ok: false, reason: expect.stringContaining(field) });
  });

  it('rejects extra top-level fields', () => {
    const result = parseGameUpdatedEvent(JSON.stringify({ ...makeEvent(), extra: 1 }));
    expect(result.ok).toBe(false);
  });

  it('rejects a bad game', () => {
    const bad = { ...makeEvent(), game: { ...baseGame, statusKind: 'LIVE' } };
    expect(parseGameUpdatedEvent(JSON.stringify(bad)).ok).toBe(false);
    const noScore = { ...makeEvent(), game: { ...baseGame, score: { home: 1.5, away: 0 } } };
    expect(parseGameUpdatedEvent(JSON.stringify(noScore)).ok).toBe(false);
    const noTeam = { ...makeEvent(), game: { ...baseGame, homeTeam: { id: 'ATL' } } };
    expect(parseGameUpdatedEvent(JSON.stringify(noTeam)).ok).toBe(false);
    const noId = { ...makeEvent(), game: { ...baseGame, id: '' } };
    expect(parseGameUpdatedEvent(JSON.stringify(noId)).ok).toBe(false);
  });
});

describe('applyGameUpdated', () => {
  it('stores the first event for a game', () => {
    const event = makeEvent();
    expect(applyGameUpdated(undefined, event)).toEqual({
      game: event.game,
      occurredAt: event.occurredAt,
    });
  });

  it('replaces the game with a newer event', () => {
    const first = makeEvent();
    const entry = applyGameUpdated(undefined, first)!;
    const next = makeEvent({
      occurredAt: '2025-01-01T02:00:00Z',
      changeKind: 'score',
      game: { ...baseGame, statusKind: 'IN_PROGRESS', score: { home: 10, away: 8 } },
    });
    expect(applyGameUpdated(entry, next)?.game.score).toEqual({ home: 10, away: 8 });
  });

  it('ignores an older event for the same game', () => {
    const entry = applyGameUpdated(
      undefined,
      makeEvent({ occurredAt: '2025-01-01T03:00:00Z' }),
    )!;
    const older = makeEvent({
      occurredAt: '2025-01-01T02:00:00Z',
      game: { ...baseGame, score: { home: 1, away: 1 } },
    });
    expect(applyGameUpdated(entry, older)).toBeUndefined();
  });

  it('does not regress a FINAL game, even with a newer timestamp', () => {
    const final = applyGameUpdated(
      undefined,
      makeEvent({
        occurredAt: '2025-01-01T04:00:00Z',
        game: { ...baseGame, statusKind: 'FINAL', score: { home: 100, away: 90 } },
      }),
    )!;
    const late = makeEvent({
      occurredAt: '2025-01-01T05:00:00Z',
      game: { ...baseGame, statusKind: 'IN_PROGRESS', score: { home: 99, away: 90 } },
    });
    expect(applyGameUpdated(final, late)).toBeUndefined();
  });

  it('lets a newer FINAL event replace a FINAL game', () => {
    const final = applyGameUpdated(
      undefined,
      makeEvent({ game: { ...baseGame, statusKind: 'FINAL' } }),
    )!;
    const corrected = makeEvent({
      occurredAt: '2025-01-01T09:00:00Z',
      game: { ...baseGame, statusKind: 'FINAL', score: { home: 101, away: 90 } },
    });
    expect(applyGameUpdated(final, corrected)?.game.score.home).toBe(101);
  });
});
