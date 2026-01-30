export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center shadow-sm">
      <div className="mb-4 text-5xl" aria-hidden="true">
        &#127936;
      </div>
      <h2 className="text-xl font-semibold text-foreground">No games scheduled</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Try a different date to find games.
      </p>
    </div>
  );
}
