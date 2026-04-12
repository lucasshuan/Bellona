function GameCardSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.8rem]">
      <div className="h-44 w-full animate-pulse bg-white/6" />
      <div className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="h-6 w-40 animate-pulse rounded bg-white/8" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/6" />
        </div>
        <div className="h-5 w-5 animate-pulse rounded bg-white/6" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="grid-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-56 animate-pulse rounded-[1.2rem] bg-primary/30 sm:h-14 sm:w-64 lg:h-16 lg:w-72" />
          <div className="h-5 w-full max-w-md animate-pulse rounded-full bg-white/6 sm:h-6" />
        </section>

        <section className="space-y-5">
          <div className="space-y-3">
            <div className="h-5 w-24 animate-pulse rounded-full bg-primary/30 sm:h-6 sm:w-28" />
            <div className="h-4 w-56 animate-pulse rounded-full bg-white/6 sm:h-5 sm:w-72" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </div>
        </section>
      </div>
    </main>
  );
}
