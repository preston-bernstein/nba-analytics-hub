import type { Game, GameStatus } from '@nba-analytics-hub/types';
import { formatDateTime } from '../../utils/formatDateTime';
import { statusBadge, teamRow, teamRowDefault, teamRowWinner } from '../../styles';

export interface GameCardProps {
  game: Game;
}

const statusConfig: Record<
  GameStatus,
  { label: string; className: string; showScore: boolean }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-gray-700 text-gray-300',
    showScore: false,
  },
  IN_PROGRESS: {
    label: 'LIVE',
    className: 'bg-red-600 text-white animate-pulse',
    showScore: true,
  },
  FINAL: {
    label: 'Final',
    className: 'bg-gray-600 text-gray-200',
    showScore: true,
  },
  POSTPONED: {
    label: 'Postponed',
    className: 'bg-yellow-700 text-yellow-100',
    showScore: false,
  },
  CANCELED: {
    label: 'Canceled',
    className: 'bg-red-900 text-red-200',
    showScore: false,
  },
};

export function GameCard({ game }: GameCardProps) {
  const { homeTeam, awayTeam, startTime, status, score } = game;
  const config = statusConfig[status];
  const isLive = status === 'IN_PROGRESS';
  const isFinal = status === 'FINAL';

  const homeWins = isFinal && score.home > score.away;
  const awayWins = isFinal && score.away > score.home;

  return (
    <div
      aria-label="game-card"
      className={`rounded-md border bg-gray-900 p-4 shadow-sm ${
        isLive ? 'border-red-600' : 'border-gray-700'
      }`}
    >
      {/* Status Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`${statusBadge} ${config.className}`}>
          {config.label}
        </span>
        <span className="text-xs text-gray-500">{formatDateTime(startTime)}</span>
      </div>

      {/* Teams and Scores */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className={`${teamRow} ${awayWins ? teamRowWinner : teamRowDefault}`}>
          <span
            className={`font-medium ${
              awayWins ? 'text-green-300' : 'text-gray-200'
            }`}
          >
            {awayTeam.name}
          </span>
          {config.showScore && (
            <span
              className={`text-lg font-bold ${
                awayWins ? 'text-green-300' : 'text-gray-300'
              }`}
            >
              {score.away}
            </span>
          )}
        </div>

        {/* Home Team */}
        <div className={`${teamRow} ${homeWins ? teamRowWinner : teamRowDefault}`}>
          <span
            className={`font-medium ${
              homeWins ? 'text-green-300' : 'text-gray-200'
            }`}
          >
            {homeTeam.name}
          </span>
          {config.showScore && (
            <span
              className={`text-lg font-bold ${
                homeWins ? 'text-green-300' : 'text-gray-300'
              }`}
            >
              {score.home}
            </span>
          )}
        </div>
      </div>

      {/* Home indicator */}
      <div className="mt-2 text-center text-xs text-gray-500">
        @ {homeTeam.name}
      </div>
    </div>
  );
}
