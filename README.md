<div align="center">
  <img src="apps/web/public/logo.png" alt="Ares" width="80" />
  <h1>Ares</h1>
</div>

**Plataforma open-source e 100% gratuita de competições e comunidade** para jogos digitais e físicos. Comunidades criam jogos, organizam ligas e torneios em diversos formatos (Elo, pontos corridos, eliminatória, suíço, fase de grupos e mais), formam times e clãs, e interagem através de fóruns e perfis customizáveis — tudo sem nenhum paywall.

> Repositório público que serve como referência de arquitetura para um monorepo moderno com Next.js + NestJS + GraphQL + Prisma. Aberto a colaboradores e sustentado por comunidade.

## O que é

- Usuários entram via Discord OAuth
- Qualquer um pode criar um jogo e organizar competições dentro dele
- **Ligas** com dois modos: **Elo** (rating dinâmico com K-factor, score relevance e inactivity decay) ou **Pontos** (win/draw/loss com pontuação configurável)
- **Torneios** com chaveamento: eliminatória simples, eliminatória dupla, sistema suíço, fase de grupos, montagem de fases personalizadas
- Partidas podem ser **agendadas** ou ter **resultados registrados** com formato, placar e provas opcionais (imagem, YouTube, Twitch)
- Criadores de eventos definem **dados customizados** por partida (kills, assistências, dano, etc.) via formulários dinâmicos
- **Times e Clãs**: crie equipes com múltiplos jogadores e acompanhe rankings coletivos
- **Fóruns e posts** em páginas de usuários, jogos e eventos
- **Perfis altamente customizáveis** — o "templo" de cada jogador, inspirado em Discord e Steam
- **Notificações e convites** para eventos, staff de moderação por evento
- **Painel administrativo** para admins e moderadores
- Ranking em tempo real com caching agressivo de páginas
- **100% gratuito para sempre** — open-source, sustentado por patrocinadores e doações

## Stack

| Camada   | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS v4 |
| Backend  | NestJS, GraphQL code-first, Passport-JWT          |
| Banco    | PostgreSQL + Prisma                               |
| Auth     | Discord OAuth → JWT                               |
| Monorepo | pnpm workspaces + Turborepo                       |
| i18n     | next-intl (`en` e `pt`)                           |
| Upload   | Presigned URL (S3-compatible)                     |

## Estrutura

```
apps/
  api/       NestJS + GraphQL — backend
  web/       Next.js — frontend
packages/
  core/      Enums, permissões e tipos compartilhados
  db/        Prisma schema, migrations e cliente singleton
```

Para entender as convenções e decisões arquiteturais, veja [ARCHITECTURE.md](ARCHITECTURE.md).

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL (ou Neon/Supabase)
- App OAuth no Discord

### Setup

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
```

**`apps/api/.env`:**

| Variável                | Descrição                                     |
| ----------------------- | --------------------------------------------- |
| `DATABASE_URL`          | Connection string do PostgreSQL               |
| `JWT_SECRET`            | Secret para assinar tokens JWT                |
| `DISCORD_CLIENT_ID`     | Client ID do app OAuth no Discord             |
| `DISCORD_CLIENT_SECRET` | Client Secret do app OAuth no Discord         |
| `CORS_ORIGIN`           | URL do frontend (ex: `http://localhost:3000`) |

**`apps/web/.env`:**

| Variável              | Descrição                                |
| --------------------- | ---------------------------------------- |
| `NEXTAUTH_SECRET`     | Secret para NextAuth                     |
| `NEXT_PUBLIC_API_URL` | URL da API (ex: `http://localhost:4000`) |

```bash
# 3. Rodar migrations e seed
pnpm db:migrate
pnpm db:seed

# 4. Iniciar em desenvolvimento
pnpm dev
```

## Scripts principais

```bash
pnpm dev           # inicia API e web em paralelo
pnpm dev:api       # apenas a API (porta 4000)
pnpm dev:web       # apenas o frontend (porta 3000)
pnpm lint          # lint em todos os pacotes
pnpm typecheck     # tsc --noEmit em todos os pacotes
pnpm codegen       # regenera tipos Apollo (rodar após mudar o schema GraphQL)
pnpm db:migrate    # roda migrations Prisma
```

## Contribuindo

Este repositório segue as convenções descritas em [ARCHITECTURE.md](ARCHITECTURE.md). Leia antes de abrir um PR.
