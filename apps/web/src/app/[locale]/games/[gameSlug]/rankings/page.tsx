import { redirect } from "next/navigation";

interface GameRankingsPageProps {
  params: Promise<{
    gameSlug: string;
    locale: string;
  }>;
}

export default async function GameRankingsPage({
  params,
}: GameRankingsPageProps) {
  const { gameSlug, locale } = await params;

  redirect(`/${locale}/games/${gameSlug}`);
}
