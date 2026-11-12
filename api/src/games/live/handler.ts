import { parseGameUpdatedEvent } from '@nba-analytics-hub/events';
import { PoisonMessageError } from '../../platform/kafka/consumer.js';
import type { BoundedIdSet } from './boundedIdSet.js';
import type { LiveGamesReadModel } from './liveGamesReadModel.js';

export type HandleOutcome = 'applied' | 'stale' | 'duplicate';

export interface GameUpdatedHandlerDeps {
  model: LiveGamesReadModel;
  seen: BoundedIdSet;
}

/**
 * Handles one message body. An eventId is remembered only after the model
 * accepted the event, so a failed attempt can be retried.
 */
export function createGameUpdatedHandler({ model, seen }: GameUpdatedHandlerDeps) {
  return (value: string): HandleOutcome => {
    const parsed = parseGameUpdatedEvent(value);
    if (!parsed.ok) throw new PoisonMessageError(parsed.reason);
    const { event } = parsed;
    if (seen.has(event.eventId)) return 'duplicate';
    const outcome = model.apply(event);
    seen.add(event.eventId);
    return outcome;
  };
}
