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
    <main className="mx-auto flex w-full flex-col gap-8 px-6 pt-20 pb-12 sm:px-10 lg:px-12">
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
