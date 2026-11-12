import type { PredictionResponse } from '@nba-analytics-hub/prediction';
import { getPredictionDisplay } from '@nba-analytics-hub/prediction';
import { ProbabilityBar } from '../ProbabilityBar';
import { Card } from '../ui/card';

export interface PredictionBadgeProps {
  prediction: PredictionResponse;
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  const { awayPct, homePct, favoriteLabel } = getPredictionDisplay(prediction);

  return (
    <Card aria-label="prediction-badge" className="gap-2 rounded-lg px-3 py-2 text-sm shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Prediction
        </span>
        <span className="text-sm font-semibold">{favoriteLabel}</span>
      </div>
      <ProbabilityBar awayPct={awayPct} homePct={homePct} />
    </Card>
  );
}
