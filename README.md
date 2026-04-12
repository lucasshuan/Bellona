# Enyo

Base inicial em `Next.js` para um produto de ranking e torneios, com front e API no mesmo projeto.

## Stack inicial

- `Next.js 16` com `App Router`, TypeScript e `Turbopack` no ambiente local.
- `Auth.js` (`next-auth`) com adapter do `Drizzle`.
- `Drizzle ORM` + `drizzle-kit` preparados para `Postgres`.
- `Tailwind CSS v4` com uma base visual já customizada.
- `Zod` + `@t3-oss/env-nextjs` para envs tipadas.

## Estrutura

```text
src/
  app/
    api/
    dashboard/
    login/
  components/
    auth/
    ui/
  lib/
  server/
    auth/
    db/
      schema/
```

## Variáveis de ambiente

Use o arquivo `.env.example` como ponto de partida.

```bash
cp .env.example .env
```

Preencha:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Scripts úteis

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm check
pnpm db:generate
pnpm db:push
pnpm db:studio
```

## Fluxo sugerido

1. Subir um Postgres compatível com Vercel/Neon.
2. Configurar um app OAuth no Discord.
3. Rodar `pnpm db:generate` e `pnpm db:push`.
4. Evoluir o domínio com matches, brackets e regras de ranking.
