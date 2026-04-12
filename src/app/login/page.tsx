import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Swords } from "lucide-react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { hasDiscordAuth } from "@/server/auth/config";

export const metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid-surface min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Link
          href="/"
          className={cn(buttonVariants({ intent: "ghost", size: "sm" }), "w-fit")}
        >
          Voltar para a home
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-[0.28em] text-primary">
              <Swords className="size-3.5" />
              Autenticação
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Entrar no Enyo
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                O setup inicial está usando Discord como provider principal, o que
                combina bem com comunidades e torneios de jogos. Se quiser, depois
                a gente pode adicionar Google, Twitch ou credenciais próprias.
              </p>
            </div>
          </section>

          <section className="spotlight-ring glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Discord OAuth</h2>
                <p className="text-sm text-muted">Auth.js + Drizzle adapter</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <SignInButton disabled={!hasDiscordAuth} />

              <div className="rounded-3xl border border-white/10 bg-white/4 p-5 text-sm leading-7 text-muted">
                {hasDiscordAuth ? (
                  <p>
                    As credenciais do Discord já estão configuradas. O próximo login
                    vai criar e persistir o usuário nas tabelas do Auth.js.
                  </p>
                ) : (
                  <p>
                    Para ativar o login, preencha `AUTH_DISCORD_ID` e
                    `AUTH_DISCORD_SECRET` no `.env`. O botão fica desabilitado até
                    essas variáveis existirem.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-primary/18 bg-primary/8 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                  Próximo passo
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Depois do login funcionar, a próxima camada natural é modelar
                  partidas, brackets e atualização de rating.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
