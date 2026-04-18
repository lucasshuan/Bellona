# Ares — Contexto Geral do Projeto

> Última atualização: Abril 2026  
> Finalidade: referência rápida para IA e memória de desenvolvimento

---

## O que é o Ares

Plataforma de **ligas e torneios competitivos** para jogos digitais e físicos. Usuários criam jogos, organizam ligas dentro deles, registram resultados e acompanham rankings via Elo ou pontos fixos. O produto é voltado para comunidades — não é uma plataforma oficial de publishers.

---

## Stack

| Camada     | Tech                                                 |
| ---------- | ---------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend    | NestJS, GraphQL (code-first), Passport-JWT           |
| Banco      | PostgreSQL + Prisma                                  |
| Auth (web) | NextAuth.js (CredentialsProvider → Discord via API)  |
| Auth (api) | Discord OAuth + JWT (7d expiry)                      |
| Monorepo   | pnpm workspaces + Turborepo                          |
| i18n       | next-intl, locales: `en` e `pt`                      |
| Upload     | Presigned URL (S3-compatible)                        |
| Logger     | pino (API) + logger próprio (web)                    |

---

## Estrutura do Monorepo

```
apps/api        → NestJS + GraphQL
apps/web        → Next.js
packages/db     → Prisma schema, migrations, seed
packages/core   → Enums, permissões e tipos compartilhados
```

---

## Domínio: Entidades Principais

### User

- Autenticado via Discord (OAuth na API, depois JWT para o web)
- Campos: `name`, `username`, `email`, `imageUrl`, `bio`, `profileColor`, `country`, `isAdmin`
- Pode ter permissões granulares além de `isAdmin`

### Game

- Criado por usuários (ou pelo admin)
- Status: `PENDING` | `APPROVED`
- Tem `slug` único, imagem de thumbnail (460×215) e background
- Link opcional para Steam (`steamUrl`)

### Event

- Contêiner genérico para competições dentro de um `Game`
- Tipos: `LEAGUE` | `TOURNAMENT`
- Status: `PENDING` | `ACTIVE` | `FINISHED` | `CANCELLED`
- Cada Event pode ter uma extensão específica (ex: `League`)

### League _(extensão de Event)_

- Sistema de rating: `elo` ou `points`
- **Campos Elo:**
  - `initialElo` — rating inicial dos jogadores (padrão: 1000)
  - `kFactor` — magnitude máxima de variação por partida (1–100)
  - `scoreRelevance` — impacto da margem de placar no cálculo (0.0–1.0)
  - `inactivityDecay` — pontos perdidos por dia de inatividade
  - `inactivityThresholdHours` — horas sem jogar antes do decay começar
  - `inactivityDecayFloor` — Elo mínimo atingível por decay
- **Campos Points:**
  - `pointsPerWin`, `pointsPerDraw`, `pointsPerLoss`
- `allowDraw` — se empates são possíveis
- `allowedFormats` — formatos de partida aceitos (ex: `ONE_V_ONE`, `FREE_FOR_ALL`)

### Player

- Vínculo entre `User` e `Game` (um User pode ser Player em múltiplos jogos)
- Tem `PlayerUsername[]` (histórico de nicks)

### LeagueEntry

- Vínculo `Player ↔ League` com `currentElo` atual

### Result

- Partida registrada dentro de uma League
- Tem `format` (MatchFormat) e `ResultEntry[]` com `eloDifference` por jogador
- Suporta `ResultAttachment` (imagem ou vídeo: YouTube, Twitch, etc.)

---

## Regras de Negócio Importantes

### Elo e scoreRelevance

A fórmula Elo padrão é: `ΔElo = K × (S - E)`, onde:

- `S` = Score: **1.0** (vitória), **0.5** (empate), **0.0** (derrota)
- `E` = probabilidade esperada de vitória baseada na diferença de Elo

O `scoreRelevance` **não multiplica** o Elo ganho. Ele **modifica o valor de S** com base na margem de placar:

- `scoreRelevance = 0` → S é sempre binário (1/0.5/0); a margem de placar é ignorada
- `scoreRelevance > 0` → vitórias apertadas fazem S se aproximar de 0.5 (quase empate para o Elo)
- `scoreRelevance = 1` → uma vitória por 15×14 pode gerar quase o mesmo Elo que um empate

#### Fórmula de mapeamento margem → S

```
S = 1 - scoreRelevance × (loserScore / winnerScore) × 0.5
```

**Propriedades:**

- `loserScore = 0` (vitória total) → `S = 1.0` sempre, independente do `scoreRelevance`
- `loserScore → winnerScore` (vitória mínima) → `S → 1 - scoreRelevance × 0.5` (mínimo de `0.5` quando `scoreRelevance = 1`)
- `scoreRelevance = 0` → `S = 1.0` sempre (bypass explícito; margem ignorada)
- `scoreRelevance = 1` e placar `10×9` → `S = 1 - 1 × (9/10) × 0.5 = 0.55`
- `scoreRelevance = 1` e placar `10×2` → `S = 1 - 1 × (2/10) × 0.5 = 0.90`

A probabilidade esperada `E` usa a escala padrão de 400 pontos:

```
E = 1 / (1 + 10^((eloB - eloA) / 400))
```

> **Status**: a fórmula está definida e implementada no simulador do frontend (Format Logic).
> O cálculo real de Elo por partida no backend (mutations de Result) ainda não foi construído.

### Permissões (RBAC)

Definidas em `packages/core`:

- `manage_games` — criar/editar/aprovar jogos
- `manage_players` — gerenciar jogadores
- `manage_events` — gerenciar ligas/eventos

`isAdmin = true` bypassa todas as checagens de permissão. Permissões granulares são para moderadores/organizadores.

### Criação de Liga com jogo novo

Ao criar uma liga, o usuário pode informar um `gameName` em vez de `gameId`. Se o jogo não existir, ele é criado automaticamente com status `APPROVED` e slug gerado automaticamente.

### Registro em liga

- Admins/editores: podem adicionar qualquer player via `addPlayerToLeague`
- Usuários comuns: se auto-registram via `registerSelfToLeague` (cria o Player no jogo se não existir)

### Ownership

- Criador da liga pode editar a própria liga
- Admin pode editar qualquer liga
- Criador do jogo pode editar o próprio jogo
- `manage_games` bypassa ownership para jogos

---

## Auth Flow

```
Discord OAuth (API)
    ↓
Nest gera JWT (7 dias) com: sub, username, imageUrl, isAdmin, permissions
    ↓
AuthCode de uso único armazenado no banco
    ↓
Web troca o code pelo token via /auth/callback
    ↓
NextAuth persiste sessão com o JWT
    ↓
Apollo Client injeta Authorization: Bearer <token> em todas as queries
    ↓
API valida via JwtStrategy → GqlAuthGuard
```

A sessão no web é revalidada a cada **5 minutos** via `/auth/me`.

---

## Rotas do Frontend (App Router)

| Rota                                   | Descrição                       |
| -------------------------------------- | ------------------------------- |
| `/`                                    | Home com lista de jogos         |
| `/games`                               | Todos os jogos                  |
| `/games/[gameSlug]`                    | Página do jogo + suas ligas     |
| `/games/[gameSlug]/events/[eventSlug]` | Página da liga (LeagueTemplate) |
| `/events`                              | Listagem global de eventos      |
| `/profile/[username]`                  | Perfil do usuário               |
| `/auth/signin`                         | Login (Discord)                 |

---

## Módulos da API

| Módulo    | Responsabilidade                                           |
| --------- | ---------------------------------------------------------- |
| `auth`    | Discord OAuth, JWT, AuthCode, guards, decorators, /auth/me |
| `games`   | CRUD de jogos, aprovação, busca                            |
| `leagues` | CRUD de ligas, entries, registro de players                |
| `users`   | Consulta de usuários, perfil, busca                        |
| `storage` | Geração de presigned URLs para upload de imagens           |
| `audit`   | Log de ações administrativas                               |

---

## Estado Atual de Implementação

### Concluído ✅

- Autenticação ponta a ponta (Discord OAuth → JWT → NextAuth → Apollo)
- RBAC com guards no backend (GqlAuthGuard, PermissionsGuard)
- GraphQL codegen no frontend (tipos gerados automaticamente)
- Enums e permissões centralizados em `@ares/core`
- Migrations versionadas com Prisma
- Logger estruturado (pino na API, custom no web)
- Bootstrap hardened (ValidationPipe, CORS estrito, introspection/playground só em dev)
- Upload via presigned URL
- Listagem, criação e edição de jogos e ligas
- Registro de players em ligas
- i18n com next-intl (en + pt)

### Pendente / Em progresso ⏳

- **Cálculo de Elo no backend**: a fórmula está definida (ver seção acima), mas a mutation de Result com cálculo automático de Elo ainda não foi implementada; `eloDifference` em `ResultEntry` provavelmente ainda é manual ou placeholder
- **Registro de partidas**: mutation de Result com cálculo de Elo automático
- **N+1 / DataLoaders**: existem, mas cobrem pouco
- **Testes**: cobertura quase zero (só boilerplate)
- **Padronização i18n**: múltiplos `useTranslation` por arquivo; estrutura dos arquivos json pode ser reorganizada
- **Posição no ranking**: lógica de `position` não está consolidada
- **UI inconsistências**: alguns modais/formulários ainda divergem de padrão visual
- **CI de validação**: sem pipeline automatizado antes do deploy

---

## Direção do Projeto

O produto está caminhando para ser uma plataforma de comunidade completa onde:

1. Qualquer pessoa pode cadastrar um jogo
2. Organizadores criam ligas com configuração rica (sistema de rating, formatos, etc.)
3. Partidas são registradas com evidência (screenshot/vídeo)
4. Rankings são atualizados automaticamente com Elo sensível à margem de placar
5. Perfis de jogadores acumulam histórico entre ligas e jogos

O próximo passo mais crítico é **fechar o ciclo da partida** — submissão de resultado → cálculo de Elo → atualização do ranking — porque é o núcleo do produto. Tudo que existe hoje é infraestrutura para chegar lá.
