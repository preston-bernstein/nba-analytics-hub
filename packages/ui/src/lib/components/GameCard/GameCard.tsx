import type { Game, GameStatus, PredictionResponse } from '@nba-analytics-hub/types';
import { getPredictionDisplay } from '@nba-analytics-hub/domain';
import { formatEasternTime } from '../../utils/formatEasternTime';
import { statusBadge } from '../../styles';

export interface GameCardProps {
  game: Game;
  prediction?: PredictionResponse;
}

const statusConfig: Record<
  GameStatus,
  { label: string; className: string; showScore: boolean }
> = {
  SCHEDULED: {
    label: 'Scheduled',
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
  /* c8 ignore next 2 - defensive fallbacks for edge cases */
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

const LOGO_STYLE = {
  width: '4rem',
  height: '4rem',
  minWidth: '4rem',
  minHeight: '4rem',
} as const;

interface TeamSectionProps {
  team: { name: string };
  score?: number;
  isWinner: boolean;
  showScore: boolean;
}

function TeamSection({ team, score, isWinner, showScore }: TeamSectionProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 sm:text-base"
        style={LOGO_STYLE}
      >
        {getTeamInitials(team.name)}
      </div>
      <span
        className={`text-sm font-semibold sm:text-base ${
          isWinner ? 'text-emerald-700' : 'text-foreground'
        }`}
      >
        {team.name}
      </span>
      {showScore && score !== undefined && (
        <span
          className={`text-2xl font-bold sm:text-3xl ${
            isWinner ? 'text-emerald-700' : 'text-foreground'
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export function GameCard({ game, prediction }: GameCardProps) {
  const { homeTeam, awayTeam, startTime, status, statusKind, score } = game;
  const config = statusConfig[statusKind];
  const isLive = statusKind === 'IN_PROGRESS';
  const isFinal = statusKind === 'FINAL';
  const isScheduled = statusKind === 'SCHEDULED';
  const rawStatus = status.trim();
  const badgeLabel =
    isLive && rawStatus && rawStatus.toLowerCase() !== 'in progress'
      ? rawStatus
      : config.label;

  const homeWins = isFinal && score.home > score.away;
  const awayWins = isFinal && score.away > score.home;

  const predictionDisplay = prediction
    ? getPredictionDisplay(prediction)
    : null;

  return (
    <div
      aria-label="game-card"
      className={`w-full max-w-[400px] mx-auto rounded-lg border border-border bg-card p-4 shadow-sm transition-all ${
        isLive ? 'ring-1 ring-rose-200' : ''
      }`}
    >
      <div
        className="grid w-full items-center gap-x-4 gap-y-2"
        style={{ gridTemplateColumns: '1fr auto 1fr' }}
      >
        {/* Away Team - Left Side - Stacked Vertically */}
        <TeamSection
          team={awayTeam}
          score={score.away}
          isWinner={awayWins}
          showScore={config.showScore}
        />

        {/* Center - Time/Status */}
        {isFinal ? (
          <span className="justify-self-center text-[11px] font-semibold uppercase tracking-wide text-neutral-900">
            {awayWins && <span className="mr-1">◀</span>}
            FINAL
            {homeWins && <span className="ml-1">▶</span>}
          </span>
        ) : isScheduled ? (
          <span
            className="justify-self-center whitespace-nowrap text-3xl font-black tracking-tight text-neutral-900"
            style={{ lineHeight: 1 }}
          >
            {formatEasternTime(startTime)}
          </span>
        ) : (
          <span
            className={`${statusBadge} ${config.className} justify-self-center whitespace-nowrap px-2 py-0.5 text-[10px] tracking-normal`}
          >
            {badgeLabel}
          </span>
        )}

        {/* Home Team - Right Side - Stacked Vertically */}
        <TeamSection
          team={homeTeam}
          score={score.home}
          isWinner={homeWins}
          showScore={config.showScore}
        />
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
