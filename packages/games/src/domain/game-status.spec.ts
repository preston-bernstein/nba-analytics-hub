import { describe, expect, it } from 'vitest';
import type { Game } from '../types/game.js';
import { resolveGameStatus } from './game-status.js';

type Input = Pick<Game, 'status' | 'statusKind' | 'score'>;
const game = (o: Partial<Input> = {}): Input => ({
  status: '',
  statusKind: 'SCHEDULED',
  score: { home: 0, away: 0 },
  ...o,
});

describe('resolveGameStatus', () => {
  it('keeps a non-scheduled kind as is', () => {
    expect(resolveGameStatus(game({ statusKind: 'FINAL', status: 'Final' }))).toEqual({
      kind: 'FINAL',
      text: 'Final',
    });
  });

  it('stays scheduled with empty text and no score', () => {
    expect(resolveGameStatus(game()).kind).toBe('SCHEDULED');
  });

  it('treats a timestamp as empty text', () => {
    expect(resolveGameStatus(game({ status: '2025-01-01T00:00:00Z' }))).toEqual({
      kind: 'SCHEDULED',
      text: '',
    });
  });

  it('is live when a timestamp status comes with a score', () => {
    expect(
      resolveGameStatus(game({ status: '2025-01-01T00:00:00Z', score: { home: 2, away: 0 } })).kind,
    ).toBe('IN_PROGRESS');
  });

  it.each([
    ['Final', 'FINAL'],
    ['Game ended', 'FINAL'],
    ['Postponed', 'POSTPONED'],
    ['Canceled', 'CANCELED'],
    ['Cancelled', 'CANCELED'],
    ['Q3 4:12', 'IN_PROGRESS'],
    ['Halftime', 'IN_PROGRESS'],
  ] as const)('reads %s as %s', (status, kind) => {
    expect(resolveGameStatus(game({ status })).kind).toBe(kind);
  });

  it('is live when the text is generic but a score exists', () => {
    expect(resolveGameStatus(game({ status: 'TBD', score: { home: 0, away: 3 } })).kind).toBe(
      'IN_PROGRESS',
    );
  });
});
