export default function GameLoading() {
  return (
    <main className="grid-surface">
      <section className="relative min-h-[230px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 animate-pulse bg-white/5" />
      </section>

      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 sm:px-10 lg:flex-row lg:gap-12 lg:px-12">
        {/* Main Content Skeleton */}
        <div className="min-w-0 flex-1 space-y-6">
          <section className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="bg-primary/30 h-8 w-24 animate-pulse rounded-full sm:h-9 sm:w-32 lg:h-10 lg:w-40" />
                  <div className="h-6 w-56 animate-pulse rounded-full bg-white/6 sm:w-[500px]" />
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {[1, 2].map((i) => (
                <section key={i} className="glass-panel rounded-[1.8rem] p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="w-full">
                      <div className="bg-primary/30 h-3 w-16 animate-pulse rounded" />
                      <div className="mt-2 h-7 w-48 animate-pulse rounded bg-white/10" />
                    </div>
                    <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-white/6" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-[88px] w-full animate-pulse rounded-[1.4rem] bg-white/6"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
          <div className="glass-panel sticky top-8 overflow-hidden rounded-[2rem]">
            <div className="aspect-[368/178] w-full animate-pulse bg-white/10" />
            <div className="space-y-8 p-6">
              <div>
                <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-white/6" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-white/6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-[76px] animate-pulse rounded-2xl bg-white/5" />
                <div className="h-[76px] animate-pulse rounded-2xl bg-white/5" />
              </div>
              <div className="h-[50px] w-full animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
