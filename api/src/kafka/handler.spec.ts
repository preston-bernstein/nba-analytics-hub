import type { GameUpdatedEvent } from '@nba-analytics-hub/events';
import { mockGames } from '@nba-analytics-hub/games';
import { BoundedIdSet } from './boundedIdSet.js';
import { createGameUpdatedHandler, PoisonMessageError } from './handler.js';
import { LiveGamesReadModel } from './liveGamesReadModel.js';

const game = mockGames[0]!;

function event(overrides: Partial<GameUpdatedEvent> = {}): GameUpdatedEvent {
  return {
    eventId: 'e-1',
    eventType: 'game.updated',
    schemaVersion: 1,
    occurredAt: '2025-01-01T01:00:00Z',
    changeKind: 'created',
    game,
    ...overrides,
  };
}

function setup() {
  const model = new LiveGamesReadModel();
  const handle = createGameUpdatedHandler({ model, seen: new BoundedIdSet(100) });
  return { model, handle };
}

describe('LiveGamesReadModel', () => {
  it('keeps the latest game per id and notifies subscribers', () => {
    const model = new LiveGamesReadModel();
    const seen: string[] = [];
    const off = model.subscribe((g) => seen.push(g.id));
    expect(model.apply(event())).toBe('applied');
    expect(model.list()).toEqual([game]);
    expect(model.get(game.id)).toEqual(game);
    off();
    model.apply(event({ eventId: 'e-2', occurredAt: '2025-01-01T02:00:00Z' }));
    expect(seen).toEqual([game.id]);
  });

  it('reports stale events and does not notify', () => {
    const model = new LiveGamesReadModel();
    model.apply(event({ occurredAt: '2025-01-01T03:00:00Z' }));
    const listener = vi.fn();
    model.subscribe(listener);
    expect(model.apply(event({ eventId: 'e-2' }))).toBe('stale');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('game.updated handler', () => {
  it('applies a valid event', () => {
    const { model, handle } = setup();
    expect(handle(JSON.stringify(event()))).toBe('applied');
    expect(model.list()).toHaveLength(1);
  });

  it('applies a duplicate eventId once', () => {
    const { model, handle } = setup();
    const listener = vi.fn();
    model.subscribe(listener);
    const raw = JSON.stringify(event());
    expect(handle(raw)).toBe('applied');
    expect(handle(raw)).toBe('duplicate');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not let an older event regress a FINAL game', () => {
    const { model, handle } = setup();
    handle(
      JSON.stringify(
        event({
          eventId: 'e-final',
          occurredAt: '2025-01-01T05:00:00Z',
          game: { ...game, statusKind: 'FINAL', score: { home: 100, away: 90 } },
        }),
      ),
    );
    const result = handle(
      JSON.stringify(
        event({
          eventId: 'e-old',
          occurredAt: '2025-01-01T02:00:00Z',
          game: { ...game, statusKind: 'IN_PROGRESS', score: { home: 50, away: 40 } },
        }),
      ),
    );
    expect(result).toBe('stale');
    expect(model.get(game.id)?.statusKind).toBe('FINAL');
  });

  it('throws PoisonMessageError for bad JSON', () => {
    const { handle } = setup();
    expect(() => handle('{nope')).toThrow(PoisonMessageError);
  });

  it('throws PoisonMessageError for a schema mismatch', () => {
    const { handle } = setup();
    expect(() => handle(JSON.stringify({ hello: 'world' }))).toThrow(PoisonMessageError);
  });

  it('does not mark an event seen when applying throws', () => {
    const { model, handle } = setup();
    const boom = vi.spyOn(model, 'apply').mockImplementationOnce(() => {
      throw new Error('transient');
    });
    const raw = JSON.stringify(event());
    expect(() => handle(raw)).toThrow('transient');
    boom.mockRestore();
    expect(handle(raw)).toBe('applied');
  });
});
