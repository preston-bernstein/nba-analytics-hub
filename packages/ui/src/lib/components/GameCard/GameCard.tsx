import type { Game } from '@nba-analytics-hub/types';
import { formatDateTime } from '../../utils/formatDateTime';

export function GameCard({ game }: { game: Game }) {
  return (
    <div>
      <div>
        {game.awayTeam.id} @ {game.homeTeam.id}
      </div>
      <div>{formatDateTime(game.startTime)}</div>
    </div>
  );
}
