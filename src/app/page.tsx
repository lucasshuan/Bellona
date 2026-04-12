import Link from "next/link";
import { ChevronRight, Shield, Swords, Trophy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  const displayName =
    session?.user.username ?? session?.user.name?.split(" ")[0] ?? "player";

  return (
    <main className="grid-surface relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-primary">
              Enyo
            </p>
            <p className="mt-2 text-sm text-muted">
              Ranking, torneios e rivalidade organizada.
            </p>
          </div>

          <Link
            href={session ? "/dashboard" : "/login"}
            className={buttonVariants({ intent: "ghost", size: "sm" })}
          >
            {session ? `Entrar, ${displayName}` : "Acessar"}
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.28em] text-secondary">
              <Swords className="size-3.5" />
              Competitivo, limpo e direto
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                O lugar para subir no{" "}
                <span className="text-primary">ranking</span>, entrar em{" "}
                <span className="text-secondary">torneios</span> e deixar seu nome
                marcado.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Enyo foi pensado para comunidades de jogos que querem acompanhar
                desempenho, organizar confrontos e transformar partidas em uma
                temporada viva.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={session ? "/dashboard" : "/login"}
                className={buttonVariants({ intent: "primary", size: "lg" })}
              >
                {session ? "Ir para o dashboard" : "Entrar no Enyo"}
              </Link>

              <Link
                href="/login"
                className={buttonVariants({ intent: "secondary", size: "lg" })}
              >
                Ver acesso
              </Link>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Ranking
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Evolução por jogo, rivalidades e posição clara para cada player.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Torneios
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Inscrição, chaveamento e acompanhamento de cada etapa do evento.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Identidade
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Um ambiente mais tenso, competitivo e focado no jogo em si.
                </p>
              </div>
            </div>
          </div>

          <div className="spotlight-ring glass-panel overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="rounded-[1.6rem] border border-primary/15 bg-gradient-to-br from-primary/18 via-primary/8 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">
                    Temporada
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    Prepare sua próxima disputa.
                  </h2>
                </div>
                <Trophy className="size-9 text-primary" />
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-muted">
                A proposta da home agora é apresentar clima, ambição e direção do
                produto. O detalhe operacional fica para dentro da plataforma.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-primary" />
                  <h3 className="text-lg font-medium">Perfil competitivo</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Entre, acompanhe sua trajetória e construa presença dentro da
                  comunidade.
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <div className="flex items-center gap-3">
                  <Swords className="size-5 text-primary" />
                  <h3 className="text-lg font-medium">Conflito organizado</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Cada torneio precisa parecer um evento, não só uma lista de
                  partidas. A home agora aponta nessa direção.
                </p>
              </article>
            </div>

            <Link
              href={session ? "/dashboard" : "/login"}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-secondary"
            >
              {session ? "Abrir painel do jogador" : "Entrar para competir"}
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
