import Link from "next/link";
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  Swords,
  Trophy,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import { hasDiscordAuth } from "@/server/auth/config";

export default async function Home() {
  const session = await getServerAuthSession();
  const displayName =
    session?.user.username ?? session?.user.name?.split(" ")[0] ?? "player";

  const stack = [
    {
      title: "Auth.js + Discord",
      description:
        "Login social rápido para comunidade gamer, com adapter do Drizzle e sessão em banco.",
      icon: ShieldCheck,
      status: hasDiscordAuth ? "Configurado para uso" : "Aguardando credenciais",
    },
    {
      title: "Drizzle + Postgres",
      description:
        "Tipagem forte, migrations simples e esquema inicial para usuários, torneios e ranking.",
      icon: Database,
      status: "Pronto para conectar na Vercel/Neon",
    },
    {
      title: "App Router unificado",
      description:
        "Front e API no mesmo projeto, com base limpa para páginas públicas e áreas privadas.",
      icon: Trophy,
      status: "Estrutura pronta para crescer",
    },
  ];

  return (
    <main className="grid-surface relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-primary">
              Enyo
            </p>
            <p className="mt-2 text-sm text-muted">
              Ranking, torneios e comunidade no mesmo app.
            </p>
          </div>

          <Link
            href={session ? "/dashboard" : "/login"}
            className={buttonVariants({ intent: "ghost", size: "sm" })}
          >
            {session ? `Entrar, ${displayName}` : "Abrir login"}
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-[0.28em] text-secondary">
              <Swords className="size-3.5" />
              Base inicial pronta para Vercel
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                Plataforma para organizar{" "}
                <span className="text-primary">rankings competitivos</span> e{" "}
                <span className="text-secondary">torneios</span> sem separar front
                e API.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                O projeto já nasce com Next.js, App Router, Auth.js, Drizzle,
                Postgres e uma estrutura de pastas pensada para evoluir rápido sem
                virar um monólito confuso.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={session ? "/dashboard" : "/login"}
                className={buttonVariants({ intent: "primary", size: "lg" })}
              >
                {session ? "Ir para o dashboard" : "Configurar autenticação"}
              </Link>

              <a
                href="#stack"
                className={buttonVariants({ intent: "secondary", size: "lg" })}
              >
                Ver o stack inicial
              </a>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  App
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  `src/app` para páginas, rotas e handlers de API.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Server
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  `src/server` separa auth, banco e regras de domínio.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  UI
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  `src/components` e `src/lib` deixam o front reaproveitável.
                </p>
              </div>
            </div>
          </div>

          <div className="spotlight-ring glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Setup
                </p>
                <h2 className="mt-3 text-2xl font-semibold">O que já entrou na base</h2>
              </div>
              <Trophy className="size-8 text-secondary" />
            </div>

            <div id="stack" className="space-y-4">
              {stack.map(({ title, description, icon: Icon, status }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/4 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Icon className="size-5 text-primary" />
                        <h3 className="text-lg font-medium">{title}</h3>
                      </div>
                      <p className="text-sm leading-7 text-muted">{description}</p>
                    </div>
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-success" />
                  </div>

                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-secondary">
                    {status}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/8 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                Status atual
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {hasDiscordAuth
                  ? "As credenciais de login via Discord já foram detectadas no ambiente."
                  : "Faltam apenas as variáveis de ambiente do Discord e do banco para autenticação e persistência ficarem operacionais."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
