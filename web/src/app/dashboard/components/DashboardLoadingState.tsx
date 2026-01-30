function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-6 w-20 rounded-full bg-neutral-200" />
          <div className="h-4 w-28 rounded bg-neutral-200" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md bg-neutral-100 px-3 py-2">
            <div className="h-5 w-32 rounded bg-neutral-200" />
            <div className="h-6 w-10 rounded bg-neutral-200" />
          </div>
          <div className="flex items-center justify-between rounded-md bg-neutral-100 px-3 py-2">
            <div className="h-5 w-28 rounded bg-neutral-200" />
            <div className="h-6 w-10 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="mb-3 flex justify-between">
          <div className="h-4 w-20 rounded bg-neutral-200" />
          <div className="h-3 w-24 rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-lg bg-neutral-100" />
          <div className="h-16 rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
