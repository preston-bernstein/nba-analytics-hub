import type { Game, GameStatus, PredictionResponse } from '@nba-analytics-hub/types';
import { getPredictionDisplay } from '@nba-analytics-hub/domain';
import { formatDateTime } from '../../utils/formatDateTime';
import { statusBadge, teamRow, teamRowDefault, teamRowWinner } from '../../styles';

export interface GameCardProps {
  game: Game;
  prediction?: PredictionResponse;
}

const statusConfig: Record<
  GameStatus,
  { label: string; className: string; showScore: boolean }
> = {
  SCHEDULED: {
    label: 'Upcoming',
    className: 'bg-brand-50 text-brand-700 border-brand-200',
    showScore: false,
  },
  IN_PROGRESS: {
    label: 'Live',
    className: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse',
    showScore: true,
  },
  FINAL: {
    label: 'Final',
    className: 'bg-neutral-200 text-neutral-800 border-neutral-300',
    showScore: true,
  },
  POSTPONED: {
    label: 'Postponed',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    showScore: false,
  },
  CANCELED: {
    label: 'Canceled',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-300',
    showScore: false,
  },
};

function getTeamInitials(name: string) {
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

export function GameCard({ game, prediction }: GameCardProps) {
  const { homeTeam, awayTeam, startTime, status, score } = game;
  const config = statusConfig[status];
  const isLive = status === 'IN_PROGRESS';
  const isFinal = status === 'FINAL';

  const homeWins = isFinal && score.home > score.away;
  const awayWins = isFinal && score.away > score.home;

  const predictionDisplay = prediction
    ? getPredictionDisplay(prediction)
    : null;

  return (
    <div
      aria-label="game-card"
      className={`rounded-lg border border-border bg-card p-4 shadow-sm transition-all ${
        isLive ? 'ring-1 ring-rose-200' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-end">
        <span className="text-sm font-medium text-muted-foreground">
          {formatDateTime(startTime)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`${teamRow} ${awayWins ? teamRowWinner : teamRowDefault} flex-col items-center justify-center gap-2 text-center shrink-0`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-500">
              {getTeamInitials(awayTeam.name)}
            </div>
            <span
              className={`text-sm font-semibold ${
                awayWins ? 'text-emerald-700' : 'text-foreground'
              }`}
            >
              {awayTeam.name}
            </span>
          </div>

          {config.showScore && (
            <span
              className={`text-3xl font-bold ${
                awayWins ? 'text-emerald-700' : 'text-foreground'
              }`}
            >
              {score.away}
            </span>
          )}
        </div>

        <span className={`${statusBadge} ${config.className}`}>
          {config.label}
        </span>

        <div className="flex items-center gap-4">
          {config.showScore && (
            <span
              className={`text-3xl font-bold ${
                homeWins ? 'text-emerald-700' : 'text-foreground'
              }`}
            >
              {score.home}
            </span>
          )}

          <div
            className={`${teamRow} ${homeWins ? teamRowWinner : teamRowDefault} flex-col items-center justify-center gap-2 text-center shrink-0`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-500">
              {getTeamInitials(homeTeam.name)}
            </div>
            <span
              className={`text-sm font-semibold ${
                homeWins ? 'text-emerald-700' : 'text-foreground'
              }`}
            >
              {homeTeam.name}
            </span>
          </div>
        </div>
      </div>

      {predictionDisplay && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-100/70 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prediction
          </span>
          <div className="flex flex-1 items-center gap-2">
            <span
              className="text-xs font-semibold text-muted-foreground"
              title={awayTeam.name}
            >
              {predictionDisplay.awayPct}%
            </span>
            <div className="relative flex h-2 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-200">
              <span
                className="absolute left-0 top-0 h-full bg-brand-500/80"
                style={{ width: `${predictionDisplay.awayPct}%` }}
              />
            </div>
            <span
              className="text-xs font-semibold text-muted-foreground"
              title={homeTeam.name}
            >
              {predictionDisplay.homePct}%
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {predictionDisplay.favoriteLabel}
          </span>
        </div>
      )}
    </div>
  );
}
