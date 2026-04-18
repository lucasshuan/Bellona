import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { GET_LEAGUES } from "@/lib/apollo/queries/leagues";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { EventCard, EventCardSkeleton } from "@/components/cards/event-card";
import { SectionHeader } from "@/components/ui/section-header";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { CalendarX2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const t = await getTranslations("EventsPage");

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-14 pb-12 sm:px-10 lg:px-12">
      <SectionHeader title={t("title")} description={t("description")} />

      <div className="border-b border-white/5" />

      <Suspense fallback={<EventsGridSkeleton />}>
        <EventsGrid />
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

async function EventsGrid() {
  const t = await getTranslations("EventsPage");

  const data = await safeServerQuery<GetLeaguesQuery>({
    query: GET_LEAGUES,
    variables: { pagination: { skip: 0, take: 50 } },
  });

  const events = data?.leagues?.nodes ?? [];

  if (events.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-4xl px-8 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/8 bg-white/5">
          <CalendarX2 className="size-7 text-white/30" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-white/60">
            {t("noEventsTitle")}
          </p>
          <p className="max-w-xs text-xs text-white/30">
            {t("noEventsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
