import type { PredictionResponse } from '@nba-analytics-hub/types';
import { getPredictionDisplay } from '@nba-analytics-hub/domain';

export interface PredictionBadgeProps {
  prediction: PredictionResponse;
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  const predictionDisplay = getPredictionDisplay(prediction);

  return (
    <div
      aria-label="prediction-badge"
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prediction
        </span>
        <span className="text-sm font-semibold text-foreground">
          {predictionDisplay.favoriteLabel}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {predictionDisplay.awayPct}%
        </span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          <span
            className="h-full bg-brand-500/80"
            style={{ flexGrow: predictionDisplay.awayPct }}
          />
          <span
            className="h-full bg-neutral-300"
            style={{ flexGrow: predictionDisplay.homePct }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {predictionDisplay.homePct}%
        </span>
      </div>
    </div>
  );
}

export default PredictionBadge;
