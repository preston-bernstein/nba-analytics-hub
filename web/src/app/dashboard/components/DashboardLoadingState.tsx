function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-md border border-gray-700 bg-gray-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-800" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded bg-gray-800/50 px-2 py-1.5">
            <div className="h-5 w-32 rounded bg-gray-700" />
          </div>
          <div className="flex items-center justify-between rounded bg-gray-800/50 px-2 py-1.5">
            <div className="h-5 w-28 rounded bg-gray-700" />
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-md border border-gray-700 bg-gray-900 p-3">
        <div className="mb-2 flex justify-between">
          <div className="h-4 w-16 rounded bg-gray-700" />
          <div className="h-3 w-20 rounded bg-gray-800" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded bg-gray-800" />
          <div className="h-12 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <section aria-label="Dashboard loading" className="p-6">
      <header className="mb-6">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-700" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-800" />
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  );
}
