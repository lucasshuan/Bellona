import { notFound } from "next/navigation";
import { GET_GAME } from "@/lib/apollo/queries/games";
import { GetGameQuery } from "@/lib/apollo/generated/graphql";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import Image from "next/image";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    gameSlug: string;
    locale: string;
  }>;
}

export default async function GameLayout({
  children,
  params,
}: GameLayoutProps) {
  const { gameSlug } = await params;
  const data = await safeServerQuery<GetGameQuery>({
    query: GET_GAME,
    variables: { slug: gameSlug },
  });

  if (!data?.game) {
    notFound();
  }

  const { game } = data;

  return (
    <>
      <section
        className="relative min-h-70 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      >
        {game.backgroundImageUrl ? (
          <>
            <Image
              src={game.backgroundImageUrl}
              alt=""
              fill
              priority
              className="object-cover opacity-40"
              sizes="100vw"
            />
            <div className="to-background absolute inset-0 bg-linear-to-b from-transparent" />
          </>
        ) : (
          <div className="from-primary/20 to-background/94 absolute inset-0 bg-linear-to-br" />
        )}
      </section>
      {children}
    </>
  );
}
