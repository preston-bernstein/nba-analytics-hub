import type { Game, GameStatus } from '../types/game.js';

export interface ResolvedGameStatus {
  /** Status kind after correcting a stale `SCHEDULED` using the status text and score. */
  kind: GameStatus;
  /** Status text from the provider, or '' when it is empty or just a timestamp. */
  text: string;
}

const LIVE_PATTERN = /\b(q[1-4]|ot|halftime|half|end of|end of period|in progress)\b/i;
const FINAL_PATTERN = /\b(final|ended)\b/i;
const POSTPONED_PATTERN = /\bpostponed\b/i;
const CANCELED_PATTERN = /\b(cancelled|canceled)\b/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}t/i;

/** Providers sometimes put a start timestamp in the status field; treat that as no text. */
function cleanStatusText(status: string): string {
  const trimmed = status.trim();
  return ISO_TIMESTAMP_PATTERN.test(trimmed) ? '' : trimmed;
}

function hasScore(score: Game['score']): boolean {
  return score.home > 0 || score.away > 0;
}

/**
 * Providers can report `SCHEDULED` after a game has started or ended. When the kind is
 * `SCHEDULED`, read the status text and score to find the real state.
 */
export function resolveGameStatus(
  game: Pick<Game, 'status' | 'statusKind' | 'score'>
): ResolvedGameStatus {
  const text = cleanStatusText(game.status);
  if (game.statusKind !== 'SCHEDULED') return { kind: game.statusKind, text };

  const lower = text.toLowerCase();
  if (FINAL_PATTERN.test(lower)) return { kind: 'FINAL', text };
  if (POSTPONED_PATTERN.test(lower)) return { kind: 'POSTPONED', text };
  if (CANCELED_PATTERN.test(lower)) return { kind: 'CANCELED', text };
  if (LIVE_PATTERN.test(lower)) return { kind: 'IN_PROGRESS', text };

  return { kind: hasScore(game.score) ? 'IN_PROGRESS' : 'SCHEDULED', text };
}
