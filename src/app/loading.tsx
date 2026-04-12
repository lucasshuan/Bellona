function GameCardSkeleton() {
  return (
    <div className="glass-panel flex w-full max-w-[368px] flex-col overflow-hidden rounded-[2.2rem]">
      <div className="aspect-[368/178] w-full animate-pulse bg-white/6" />
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="w-full">
          <div className="h-5 w-32 animate-pulse rounded bg-white/8" />
          <div className="mt-2.5 h-3 w-full animate-pulse rounded bg-white/6" />
          <div className="mt-1.5 h-3 w-3/4 animate-pulse rounded bg-white/6" />
        </div>
        <div className="size-5 shrink-0 animate-pulse rounded bg-white/6" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="grid-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="flex flex-col items-center space-y-4 text-center">
          <div className="bg-primary/30 h-12 w-48 animate-pulse rounded-2xl sm:h-16 sm:w-56 lg:h-20 lg:w-64" />
          <div className="h-6 w-full max-w-2xl animate-pulse rounded-full bg-white/6" />
          <div className="flex gap-3 pt-4 sm:gap-4">
            <div className="h-12 w-32 animate-pulse rounded-full bg-white/6" />
            <div className="bg-primary/30 h-12 w-32 animate-pulse rounded-full" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="bg-primary/30 h-8 w-24 animate-pulse rounded-full sm:h-9 sm:w-32 lg:h-10 lg:w-40" />
                <div className="h-6 w-56 animate-pulse rounded-full bg-white/6 sm:w-[500px]" />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </div>
        </section>
      </div>
    </main>
  );
}
