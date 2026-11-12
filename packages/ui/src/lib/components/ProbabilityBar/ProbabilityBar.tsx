import { Progress } from '../ui/progress';

export interface ProbabilityBarProps {
  /** Percent (0-100) for the left side. */
  awayPct: number;
  /** Percent (0-100) for the right side. */
  homePct: number;
  awayLabel?: string;
  homeLabel?: string;
}

const PCT_CLASS = 'text-xs font-semibold text-muted-foreground';

/** Two percentages with a bar showing the left side's share between them. */
export function ProbabilityBar({ awayPct, homePct, awayLabel, homeLabel }: ProbabilityBarProps) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className={PCT_CLASS} title={awayLabel}>
        {awayPct}%
      </span>
      <Progress
        value={awayPct}
        aria-label="Away win probability"
        className="flex-1 bg-neutral-300"
      />
      <span className={PCT_CLASS} title={homeLabel}>
        {homePct}%
      </span>
    </div>
  );
}
