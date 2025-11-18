import type { Game } from '@nba-analytics-hub/types';
import { formatDateTime } from '../../utils/formatDateTime';

export function GameCard({ game }: { game: Game }) {
  return (
    <div>
      <div>
        {game.awayTeamId} @ {game.homeTeamId}
      </div>
      <div>{formatDateTime(game.startTimeUtc)}</div>
    </div>
  );
}
