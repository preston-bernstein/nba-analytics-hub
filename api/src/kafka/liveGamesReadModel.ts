import { applyGameUpdated, type GameUpdatedEvent, type LiveGameEntry } from '@nba-analytics-hub/events';
import type { Game } from '@nba-analytics-hub/types';

export type ApplyOutcome = 'applied' | 'stale';
export type GameListener = (game: Game) => void;

/** In-memory latest Game per id, fed by game.updated events. */
export class LiveGamesReadModel {
  private readonly entries = new Map<string, LiveGameEntry>();
  private readonly listeners = new Set<GameListener>();

  apply(event: GameUpdatedEvent): ApplyOutcome {
    const next = applyGameUpdated(this.entries.get(event.game.id), event);
    if (!next) return 'stale';
    this.entries.set(event.game.id, next);
    for (const listener of this.listeners) {
      listener(next.game);
    }
    return 'applied';
  }

  get(id: string): Game | undefined {
    return this.entries.get(id)?.game;
  }

  list(): Game[] {
    return [...this.entries.values()].map((entry) => entry.game);
  }

  /** Calls `listener` for each applied update. Returns an unsubscribe function. */
  subscribe(listener: GameListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
