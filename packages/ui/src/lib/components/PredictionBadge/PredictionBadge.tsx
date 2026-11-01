import type { PredictionResponse } from '@nba-analytics-hub/types';
import { getPredictionDisplay } from '@nba-analytics-hub/domain';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';

export interface PredictionBadgeProps {
  prediction: PredictionResponse;
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  const predictionDisplay = getPredictionDisplay(prediction);

  return (
    <Card
      aria-label="prediction-badge"
      className="gap-2 rounded-lg px-3 py-2 text-sm shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prediction
        </span>
        <span className="text-sm font-semibold">
          {predictionDisplay.favoriteLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {predictionDisplay.awayPct}%
        </span>
        <Progress
          value={predictionDisplay.awayPct}
          aria-label="Away win probability"
          className="flex-1 bg-neutral-300"
        />
        <span className="text-xs font-semibold text-muted-foreground">
          {predictionDisplay.homePct}%
        </span>
      </div>
    </Card>
  );
}
