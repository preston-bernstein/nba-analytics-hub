import { Card } from '@nba-analytics-hub/ui';

export function DashboardEmptyState() {
  return (
    <Card className="items-center justify-center gap-0 rounded-lg py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">
        &#127936;
      </div>
      <h2 className="text-xl font-semibold text-foreground">No games scheduled</h2>
      <p className="mt-2 text-sm text-muted-foreground">Try a different date to find games.</p>
    </Card>
  );
}
