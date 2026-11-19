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

interface StatusCenterProps {
  kind: GameStatus;
  startTime: string;
  liveLabel?: string;
  homeWins: boolean;
  awayWins: boolean;
}

function StatusCenter({ kind, startTime, liveLabel, homeWins, awayWins }: StatusCenterProps) {
  if (kind === 'FINAL') {
    return (
      <span className="justify-self-center text-[11px] font-semibold uppercase tracking-wide text-neutral-900">
        {awayWins && <span className="mr-1">◀</span>}
        FINAL
        {homeWins && <span className="ml-1">▶</span>}
      </span>
    );
  }
  if (kind === 'SCHEDULED') {
    return (
      <span className="justify-self-center whitespace-nowrap text-3xl font-black leading-none tracking-tight text-neutral-900">
        {formatEasternTime(startTime)}
      </span>
    );
  }
  return <StatusBadge status={BADGE_STATUS[kind]}>{liveLabel}</StatusBadge>;
}

interface PredictionRowProps {
  display: NonNullable<ReturnType<typeof getPredictionDisplay>>;
  awayName: string;
  homeName: string;
}

function PredictionRow({ display, awayName, homeName }: PredictionRowProps) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-100/70 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Prediction
      </span>
      <ProbabilityBar
        awayPct={display.awayPct}
        homePct={display.homePct}
        awayLabel={awayName}
        homeLabel={homeName}
      />
      <span className="text-sm font-semibold text-foreground">{display.favoriteLabel}</span>
    </div>
  );
}

interface MatchupProps extends StatusCenterProps {
  game: Game;
  showScore: boolean;
}

function Matchup({ game, showScore, ...status }: MatchupProps) {
  const { homeTeam, awayTeam, score } = game;
  return (
    <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2">
      <TeamScore
        name={awayTeam.name}
        score={score.away}
        isWinner={status.awayWins}
        showScore={showScore}
      />

      <StatusCenter {...status} />

      <TeamScore
        name={homeTeam.name}
        score={score.home}
        isWinner={status.homeWins}
        showScore={showScore}
      />
    </div>
  );
}

// Live games show the provider's detail (for example "Q3 4:12") instead of just "Live".
function liveLabelFor(isLive: boolean, text: string | undefined): string | undefined {
  return isLive && text && text.toLowerCase() !== 'in progress' ? text : undefined;
}

export function GameCard({ game, prediction }: GameCardProps) {
  const { homeTeam, awayTeam, startTime, score } = game;
  const { kind, text } = resolveGameStatus(game);

  const isLive = kind === 'IN_PROGRESS';
  const isFinal = kind === 'FINAL';
  const homeWins = isFinal && score.home > score.away;
  const awayWins = isFinal && score.away > score.home;
  const predictionDisplay = prediction ? getPredictionDisplay(prediction) : null;

  return (
    <Card
      aria-label="game-card"
      className={cn(
        'mx-auto w-full max-w-[400px] gap-0 rounded-lg p-4 transition-all',
        isLive && 'ring-1 ring-rose-200'
      )}
    >
      <Matchup
        game={game}
        showScore={isLive || isFinal}
        kind={kind}
        startTime={startTime}
        liveLabel={liveLabelFor(isLive, text)}
        homeWins={homeWins}
        awayWins={awayWins}
      />

      {predictionDisplay && (
        <PredictionRow
          display={predictionDisplay}
          awayName={awayTeam.name}
          homeName={homeTeam.name}
        />
      )}
    </Card>
  );
}
