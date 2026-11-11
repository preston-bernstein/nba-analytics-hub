import type { Game, GameStatus } from '@nba-analytics-hub/games';
import { resolveGameStatus } from '@nba-analytics-hub/games';
import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { getPredictionDisplay } from '@nba-analytics-hub/prediction';
import { formatEasternTime } from '../../utils/formatEasternTime';
import { cn } from '../../utils/cn';
import { ProbabilityBar } from '../ProbabilityBar';
import { StatusBadge, type StatusBadgeStatus } from '../StatusBadge';
import { TeamScore } from '../TeamScore';
import { Card } from '../ui/card';

export interface GameCardProps {
  game: Game;
  prediction?: PredictionResponse;
}

const BADGE_STATUS: Record<GameStatus, StatusBadgeStatus> = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'live',
  FINAL: 'final',
  POSTPONED: 'postponed',
  CANCELED: 'canceled',
};

export function GameCard({ game, prediction }: GameCardProps) {
  const { homeTeam, awayTeam, startTime, score } = game;
  const { kind, text } = resolveGameStatus(game);

  const isLive = kind === 'IN_PROGRESS';
  const isFinal = kind === 'FINAL';
  const showScore = isLive || isFinal;
  const homeWins = isFinal && score.home > score.away;
  const awayWins = isFinal && score.away > score.home;
  // Live games show the provider's detail (for example "Q3 4:12") instead of just "Live".
  const liveLabel = isLive && text && text.toLowerCase() !== 'in progress' ? text : undefined;
  const predictionDisplay = prediction ? getPredictionDisplay(prediction) : null;

  return (
    <Card
      aria-label="game-card"
      className={cn(
        'mx-auto w-full max-w-[400px] gap-0 rounded-lg p-4 transition-all',
        isLive && 'ring-1 ring-rose-200',
      )}
    >
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2">
        <TeamScore name={awayTeam.name} score={score.away} isWinner={awayWins} showScore={showScore} />

        {kind === 'FINAL' ? (
          <span className="justify-self-center text-[11px] font-semibold uppercase tracking-wide text-neutral-900">
            {awayWins && <span className="mr-1">◀</span>}
            FINAL
            {homeWins && <span className="ml-1">▶</span>}
          </span>
        ) : kind === 'SCHEDULED' ? (
          <span className="justify-self-center whitespace-nowrap text-3xl font-black leading-none tracking-tight text-neutral-900">
            {formatEasternTime(startTime)}
          </span>
        ) : (
          <StatusBadge status={BADGE_STATUS[kind]}>{liveLabel}</StatusBadge>
        )}

        <TeamScore name={homeTeam.name} score={score.home} isWinner={homeWins} showScore={showScore} />
      </div>

      {predictionDisplay && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-100/70 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prediction
          </span>
          <ProbabilityBar
            awayPct={predictionDisplay.awayPct}
            homePct={predictionDisplay.homePct}
            awayLabel={awayTeam.name}
            homeLabel={homeTeam.name}
          />
          <span className="text-sm font-semibold text-foreground">
            {predictionDisplay.favoriteLabel}
          </span>
        </div>
      )}
    </Card>
  );
}
