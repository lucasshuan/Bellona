import Link from "next/link";
import { redirect } from "next/navigation";
import { Medal, Swords, Trophy } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";

export const metadata = {
  title: "Dashboard",
};

const roadmap = [
  {
    title: "Rankings por jogo",
    description:
      "Cada jogo pode evoluir em regras próprias sem quebrar a tipagem central do projeto.",
    icon: Medal,
  },
  {
    title: "Torneios com bracket",
    description:
      "A base já contempla estrutura para participantes, status e formatos como single elimination.",
    icon: Trophy,
  },
  {
    title: "Operação simples",
    description:
      "Front, API e autenticação ficam no mesmo repositório, com deploy direto na Vercel.",
    icon: Swords,
  },
];

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="grid-surface min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Bem-vindo, {session.user.username ?? session.user.name ?? "player"}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Sua autenticação está conectada ao Auth.js com persistência em banco
              via Drizzle. Esse painel já está protegido por sessão no servidor.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className={buttonVariants({ intent: "secondary" })}>
              Home
            </Link>
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {roadmap.map(({ title, description, icon: Icon }) => (
            <article key={title} className="glass-panel rounded-[1.75rem] p-6">
              <Icon className="size-6 text-secondary" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-primary/18 bg-primary/8 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Sugestão de sequência
          </p>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-muted sm:grid-cols-3">
            <p>1. Criar migrations iniciais e subir as tabelas do Auth.js.</p>
            <p>2. Implementar CRUD de jogos e criação de torneios.</p>
            <p>3. Modelar partidas e cálculo de rating por modalidade.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
