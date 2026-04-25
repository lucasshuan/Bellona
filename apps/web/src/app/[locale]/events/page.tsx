import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { GET_LEAGUES } from "@/lib/apollo/queries/leagues";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { EventCard, EventCardSkeleton } from "@/components/cards/event-card";
import { SectionHeader } from "@/components/ui/section-header";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { CalendarX2 } from "lucide-react";
import { AddEventButton } from "@/components/triggers/game/add-event-button";
import { SearchInput } from "@/components/ui/search-input";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{ search?: string; sort?: string }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const t = await getTranslations("EventsPage");
  const { search, sort } = await searchParams;

  return (
    <main className="mx-auto flex w-full flex-col gap-8 px-6 pt-20 pb-12 sm:px-10 lg:px-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6">
          <SectionHeader title={t("title")} description={t("description")} />
          <div>
            <AddEventButton gameId="" variant="header" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-sm lg:items-end">
          <Suspense
            fallback={
              <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
            }
          >
            <SearchInput
              defaultValue={search}
              placeholder={t("searchPlaceholder")}
              className="w-full"
            />
          </Suspense>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link
              href={
                sort !== "name"
                  ? "#"
                  : `?${new URLSearchParams(search ? { search } : {})}`
              }
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
                sort !== "name"
                  ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_color-mix(in_srgb,var(--gold)_15%,transparent)]"
                  : "border-border text-muted hover:border-gold/30 hover:text-foreground",
              )}
            >
              {t("sortRecent")}
            </Link>
            <Link
              href={
                sort === "name"
                  ? "#"
                  : `?${new URLSearchParams({ ...(search ? { search } : {}), sort: "name" })}`
              }
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
                sort === "name"
                  ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_color-mix(in_srgb,var(--gold)_15%,transparent)]"
                  : "border-border text-muted hover:border-gold/30 hover:text-foreground",
              )}
            >
              {t("sortAlphabetical")}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-white/5" />

      <Suspense fallback={<EventsGridSkeleton />}>
        <EventsGrid search={search} sort={sort} />
      </Suspense>
    </main>
  );
}

function EventsGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function EventsGrid({
  search,
  sort,
}: {
  search?: string;
  sort?: string;
}) {
  const t = await getTranslations("EventsPage");

  const data = await safeServerQuery<GetLeaguesQuery>({
    query: GET_LEAGUES,
    variables: { pagination: { skip: 0, take: 50 } },
  });

  const allEvents = data?.leagues?.nodes ?? [];

  let events = allEvents;
  if (search) {
    const q = search.toLowerCase();
    events = allEvents.filter(
      (e) =>
        e.event?.name?.toLowerCase().includes(q) ||
        e.event?.game?.name?.toLowerCase().includes(q),
    );
  }
  if (sort === "name") {
    events = [...events].sort((a, b) =>
      (a.event?.name ?? "").localeCompare(b.event?.name ?? ""),
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="glass-panel mb-6 flex size-20 items-center justify-center rounded-2xl">
          <CalendarX2 className="text-muted size-10" />
        </div>
        <h3 className="text-xl font-semibold">{t("noEventsTitle")}</h3>
        <p className="text-muted mt-2 max-w-sm">{t("noEventsDescription")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.eventId} event={event} />
      ))}
    </div>
  );
}
