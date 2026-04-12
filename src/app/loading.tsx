function GameCardSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.8rem]">
      <div className="h-44 w-full animate-pulse bg-white/6" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/6" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/6" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="grid-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <section className="space-y-5">
          <div className="h-4 w-16 animate-pulse rounded-full bg-primary/30" />
          <div className="h-12 w-full max-w-3xl animate-pulse rounded-[1.2rem] bg-white/8 sm:h-14" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-white/6" />
        </section>

        <section className="space-y-5">
          <div className="space-y-3">
            <div className="h-4 w-20 animate-pulse rounded-full bg-primary/30" />
            <div className="h-9 w-80 animate-pulse rounded-[1rem] bg-white/8" />
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
