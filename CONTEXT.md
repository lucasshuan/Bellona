# Ares — Contexto Geral do Projeto

> Última atualização: Abril 2026  
> Referência rápida para IA e memória de desenvolvimento

---

## O que é o Ares

Plataforma **open-source e 100% gratuita** de competições e comunidade para jogos digitais e físicos. Usuários criam jogos, organizam ligas e torneios em diversos formatos (pontos corridos, Elo rating, eliminatória simples/dupla, sistema suíço, fase de grupos, e mais), agendam e registram partidas, formam times e clãs, e interagem através de fóruns e perfis altamente customizáveis.

O produto é voltado para **comunidades** — não é uma plataforma oficial de publishers. Nenhuma funcionalidade será colocada atrás de paywall; o projeto é open-source, aberto a colaboradores, e pretende se sustentar via patrocinadores e doações.

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
- Campos: `name`, `username`, `email`, `imageUrl`, `bio`, `profileColor`, `country`, `isAdmin`, `onboardingCompleted`
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

### Player _(em revisão)_

- Atualmente é um vínculo entre `User` e `Game` com histórico de nicks (`PlayerUsername[]`)
- **Refactor planejado**: a entidade Player como vínculo direto com Game não faz sentido conceitual; a lógica de armazenamento de usernames também precisa ser repensada (não há forma fácil de garantir que o nick é exibido corretamente). A entidade pode ser eliminada ou reestruturada — ainda em análise

### LeagueEntry

- Vínculo `Player ↔ League` com `currentElo` atual

### Result / Match _(em revisão)_

- Atualmente: partida registrada dentro de uma League com `format`, `ResultEntry[]` e `eloDifference` por jogador
- Suporta `ResultAttachment` (imagem ou vídeo: YouTube, Twitch, etc.)
- **Refactor planejado**: além de registrar resultados, será possível **agendar partidas** (Match). O modelo atual será reestruturado para separar agendamento de resultado. Nada disso foi efetivamente implementado no backend ainda, facilitando o refactor

---

## Funcionalidades Planejadas (Visão de Produto)

Além do que já existe, o Ares pretende evoluir para uma plataforma de comunidade completa:

### Formatos de Competição

- **Ligas**: pontos corridos (round robin), Elo rating (já parcialmente implementado)
- **Torneios com chaveamento**: eliminatória simples, eliminatória dupla (chave dos perdedores), sistema suíço, fase de grupos, montagem de fases personalizadas
- Cada evento pode combinar formatos (ex: fase de grupos → eliminatória)

### Times e Clãs

- **Times/Equipes**: sistema de criação de times com múltiplos usuários, nomeação, e resultados vinculados a times (com dados individuais dentro do resultado do time)
- **Clãs**: agrupamento de usuários com ranking próprio baseado na performance coletiva dos membros
- Complexidade alta — exige modelagem cuidadosa de vínculos entre usuários, times, clãs e resultados

### Dados Dinâmicos por Evento

- Criadores de eventos podem definir **campos customizados** para resultados (formulários dinâmicos)
- Podem ser dados gerais do evento ou individuais por jogador (ex: kills, assistências, cura realizada, dano causado, nota na partida)
- Permite que cada comunidade adapte as estatísticas ao seu jogo

### Comunidade e Social

- **Fóruns e posts**: criação de tópicos e publicações em páginas — página do usuário (estilo Steam), página da comunidade (jogo), página de um evento
- **Perfis customizáveis**: páginas de usuário altamente personalizáveis, inspiradas em Discord e Steam — o "templo" de cada jogador
- **Sistema de notificações e convites**: convidar usuários para eventos, notificar sobre partidas, atualizações de ranking, posts, etc.
- **Staff de moderação por evento**: organizadores podem definir moderadores com permissões específicas

### Administração e Moderação

- **Painel administrativo**: para usuários com `isAdmin` ou permissões granulares
- **Sistema de banimento/bloqueio**: banir usuários de eventos, jogos ou da plataforma

### Integrações

- **Steam API**: busca e sugestão de jogos novos caso não existam no projeto, com cacheamento para evitar uso excessivo da API gratuita

### Performance e Caching

- Cacheamento agressivo de páginas e rankings no Next.js (ISR/revalidação) para reduzir carga na API
- Estratégia essencial para manter performance com infraestrutura enxuta

### Modelo de Negócio

- **100% gratuito, para sempre** — nenhuma funcionalidade atrás de paywall
- Open-source e aberto a colaboradores
- Sustentabilidade via patrocinadores e doações

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
- Onboarding wizard para novos usuários (multi-step: identidade, país, interesses de jogos)

### Pendente / Em progresso ⏳

- **Seleção de jogos de interesse no onboarding**: a UI de seleção de jogos no onboarding está implementada com dados mock; persistir a seleção no backend (criar relação `UserGameInterest` ou similar) ainda não foi feito
- **Cálculo de Elo no backend**: a fórmula está definida (ver seção acima), mas a mutation de Result com cálculo automático de Elo ainda não foi implementada; `eloDifference` em `ResultEntry` provavelmente ainda é manual ou placeholder
- **Refactor de Match/Result**: separar conceitos de agendamento de partida e registro de resultado; nada foi efetivamente implementado, facilitando o redesign
- **Refactor de Player**: repensar se a entidade Player como vínculo User↔Game faz sentido; a lógica de usernames armazenados precisa de novo approach
- **Formatos de torneio**: modelar chaveamentos (eliminatória, suíço, grupos, fases, etc.) — apenas ligas existem hoje
- **Times e Clãs**: modelagem completa de equipes, vínculos e ranking coletivo
- **Dados dinâmicos por evento**: formulários customizáveis para estatísticas de partida
- **Fóruns e posts**: sistema de tópicos e publicações por contexto (usuário, jogo, evento)
- **Perfis customizáveis**: personalização rica da página de perfil
- **Notificações e convites**: sistema para convidar jogadores e notificar sobre eventos
- **Painel administrativo**: UI dedicada para admins e moderadores
- **Banimento/bloqueio**: sistema de moderação de usuários
- **Integração Steam API**: busca de jogos com cache
- **Caching de páginas e rankings**: ISR e estratégias de revalidação no Next.js
- **N+1 / DataLoaders**: existem, mas cobrem pouco
- **Testes**: cobertura quase zero (só boilerplate)
- **Padronização i18n**: múltiplos `useTranslation` por arquivo; estrutura dos arquivos json pode ser reorganizada
- **Posição no ranking**: lógica de `position` não está consolidada
- **UI inconsistências**: alguns modais/formulários ainda divergem de padrão visual
- **CI de validação**: sem pipeline automatizado antes do deploy

---

## Direção do Projeto

O Ares está evoluindo de uma ferramenta de ligas para uma **plataforma de comunidade competitiva completa**:

1. Qualquer pessoa cadastra um jogo e organiza competições em múltiplos formatos (liga, torneio com chave, sistema suíço, grupos, etc.)
2. Partidas podem ser **agendadas** ou ter **resultados registrados** com evidência (screenshot/vídeo) e dados customizados
3. Rankings são atualizados automaticamente — Elo sensível à margem de placar, pontos, ou métricas do formato
4. Jogadores formam **times** e **clãs** com rankings coletivos
5. Cada página (usuário, jogo, evento) tem **fóruns próprios** e os perfis são altamente customizáveis
6. **Notificações, convites e moderação** criam um ecossistema social completo
7. Tudo 100% gratuito, open-source, sustentado por comunidade

O próximo passo mais crítico continua sendo **fechar o ciclo da partida** — submissão de resultado → cálculo de Elo → atualização do ranking — porque é o núcleo do produto. Em paralelo, o refactor dos modelos de Player e Match/Result vai preparar a base para os formatos de torneio e o sistema de times.
