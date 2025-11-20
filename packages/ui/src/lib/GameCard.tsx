import type { Game } from '@nba-analytics-hub/types';

export function GameCard({ game }: { game: Game }) {
  return (
    <div>
      <div>{game.awayTeamId} @ {game.homeTeamId}</div>
      <div>{new Date(game.startTimeUtc).toLocaleString()}</div>
    </div>
  );
}
