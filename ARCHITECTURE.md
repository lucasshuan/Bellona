# Ares — Architecture Reference

> Fonte de verdade para agentes e desenvolvedores. Antes de criar qualquer arquivo ou fazer qualquer modificação significativa, leia este documento.

---

## 1. Visão Geral do Monorepo

```
Ares/
├── apps/
│   ├── api/          NestJS + GraphQL (code-first) — backend
│   └── web/          Next.js 15 App Router — frontend
├── packages/
│   ├── core/         Enums, permissões e tipos compartilhados
│   └── db/           Prisma schema, migrations e cliente singleton
├── turbo.json        Pipeline de tasks (build, dev, lint, typecheck)
└── pnpm-workspace.yaml
```

Gerenciador de pacotes: **pnpm workspaces**. Build system: **Turborepo**.  
Nunca use `npm` ou `yarn` neste projeto.

---

## 2. Camadas e Responsabilidades

### `packages/db`

- **O quê**: Prisma schema (`prisma/schema.prisma`), migrations (`prisma/migrations/`), seed (`prisma/seed.ts`) e cliente singleton exportado como `@ares/db`.
- **Regra**: é a única camada que fala com o banco. Nenhuma outra camada instancia `PrismaClient` diretamente. A API consome via `DatabaseProvider` (`apps/api/src/database/database.provider.ts`).
- **Enums no schema**: sempre `UPPER_SNAKE_CASE` (ex: `RANKED_LEAGUE`, `APPROVED`). Devem espelhar exatamente os valores em `@ares/core`.
- **Migrations**: usar `pnpm db:migrate` (nunca `prisma db push` em produção). Cada migration tem nome descritivo.

### `packages/core`

- **O quê**: Única fonte de verdade para enums de domínio, chaves de permissão e tipos compartilhados entre `api` e `web`.
- **Exporta**: `INITIAL_PERMISSION_DEFINITIONS`, `PermissionKey`, `GameStatus`, `EventStatus`, `EventType`, `MatchOutcome`, `MatchFormat`, `MATCH_FORMATS`, etc.
- **Regra**: qualquer novo enum ou chave de permissão nasce aqui. Nunca defina o mesmo enum em dois lugares.
- **Casing**: constantes são `UPPER_SNAKE_CASE` como arrays `as const`, tipos são derivados via `typeof`.

### `apps/api`

- **Framework**: NestJS com GraphQL code-first (`@nestjs/graphql`, `ApolloDriver`).
- **Estrutura interna** — cada módulo de domínio segue este padrão rígido:

```
src/modules/<domain>/
  <domain>.module.ts      Registra providers, importa dependências
  <domain>.model.ts       @ObjectType() — define o tipo GraphQL
  <domain>.resolver.ts    @Resolver() — queries, mutations, ResolveField
  <domain>.service.ts     Lógica de negócio, acessa DatabaseProvider
  dto/
    <domain>.input.ts     @InputType() com class-validator
    <domain>.output.ts    Tipos paginados ou compostos de resposta
```

- **Schema GraphQL**: gerado automaticamente em `src/schema.gql` a partir dos decorators. Não edite o arquivo manualmente.
- **Segurança**: toda mutation sensível usa `@UseGuards(GqlAuthGuard, PermissionsGuard)` + `@RequiredPermissions(...)`. Queries públicas não precisam de guard.
- **Validação de input**: sempre via `class-validator` nos `@InputType()`. O `ValidationPipe` global (`main.ts`) rejeita campos não declarados (`forbidNonWhitelisted: true`).
- **Acesso a dados**: sempre via `this.databaseProvider.db` (Prisma client injetado). Nunca SQL raw exceto quando absolutamente necessário e documentado.
- **N+1**: relações entre entidades usam `DataLoaderService` via `@ResolveField`. Não carregue relações em includes do Prisma quando um loader já existe.
- **Logger**: `nestjs-pino`. Use `@Logger()` ou injete via construtor. Não use `console.log`.

### `apps/web`

- **Framework**: Next.js 15, App Router, TypeScript strict.
- **Estrutura interna detalhada**: ver Seção 5.

---

## 3. Fluxo de Dados Completo

```
Banco (Postgres)
  ↓  Prisma Client (@ares/db)
  ↓  DatabaseProvider (api)
  ↓  Service (lógica de negócio)
  ↓  Resolver (@ObjectType / @ResolveField)
  ↓  schema.gql (gerado automaticamente)
  ↓  codegen (apps/web/codegen.js lê schema.gql)
  ↓  src/lib/apollo/generated/ (tipos TypeScript gerados)
  ↓  src/lib/apollo/queries/*.ts (documentos GQL tipados)
  ↓  safeServerQuery() (Server Components) ou useQuery() (Client)
  ↓  Componentes React
```

**Regra de ouro**: tipos do frontend vêm do codegen, nunca escritos à mão. Se precisar de um tipo novo no frontend, primeiro adicione o campo no resolver/model da API, gere o schema, então rode `pnpm codegen`.

---

## 4. Autenticação e Autorização

### Fluxo de Auth

1. **Login**: usuário clica "Login with Discord" → NextAuth dispara `signIn("credentials")` com redirect para a API (`/auth/discord`).
2. **API**: processa OAuth do Discord via `DiscordStrategy`, emite JWT assinado contendo `{ sub, username, isAdmin, permissions[], onboardingCompleted }`.
3. **NextAuth callback**: recebe o JWT da API, decodifica o payload, armazena na sessão NextAuth (cookie seguro HttpOnly).
4. **Apollo Client**: `authLink` no `apollo-client.ts` lê a sessão server-side e injeta `Authorization: Bearer <token>` em toda requisição GraphQL.
5. **API guard**: `JwtStrategy` valida o token, popula `req.user`. `GqlAuthGuard` extrai o request do contexto GraphQL.

### Permissões no Backend (API)

```typescript
// Em qualquer resolver:
@UseGuards(GqlAuthGuard, PermissionsGuard)
@RequiredPermissions('manage_games')
@Mutation(() => Game)
async updateGame(...) {}
```

- `GqlAuthGuard`: exige token válido (usuário autenticado).
- `PermissionsGuard`: exige permissões específicas. `isAdmin` bypassa tudo.
- Permissões disponíveis: `manage_games`, `manage_players`, `manage_events` — definidas em `@ares/core`.

### Permissões no Frontend (Web)

**Server Components** — usar funções de `src/lib/permissions.ts`:

```typescript
const session = await getServerAuthSession();
const canEdit = canEditGame(session, game.authorId);
const canManage = canManageLeagues(session);
```

**Client Components** — usar hook `useUser()` de `@/components/providers`:

```typescript
const { user, canManageGames, canManageLeagues, canEditGame } = useUser();
```

`useUser()` não pode ser chamado fora de um Client Component. Para Server Components, sempre use `getServerAuthSession()`.

---

## 5. Estrutura do `apps/web`

### Regra Fundamental de Diretórios

> Pastas de rota (`app/[locale]/**`) contêm **exclusivamente** arquivos reservados do Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`. Qualquer outro arquivo vai para `src/components/`.

### Estrutura de `src/`

```
src/
├── app/
│   ├── [locale]/           Rota localizada — SOMENTE arquivos Next.js
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── games/
│   │   │   ├── page.tsx
│   │   │   └── [gameSlug]/
│   │   │       ├── page.tsx
│   │   │       └── layout.tsx
│   │   ├── profile/[username]/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── events/[...]
│   └── api/                Rotas de API do Next.js (NextAuth, etc.)
│
├── components/
│   ├── ui/                 Primitivos de UI reutilizáveis (sem lógica de domínio)
│   ├── cards/              Card components por domínio
│   ├── tables/             Tabelas por domínio
│   ├── modals/             Modais organizados por domínio
│   │   ├── game/
│   │   ├── league/
│   │   ├── profile/
│   │   └── auth/
│   ├── triggers/           Botões/ações que disparam modais ou navegação
│   │   ├── game/           Ex: add-event-button, game-manage-actions
│   │   ├── profile/        Ex: profile-manage-actions
│   │   └── league/         Ex: registration triggers
│   ├── templates/          Composições pesadas de página (sidebar + main)
│   │   └── events/
│   │       ├── league/
│   │       │   ├── index.tsx
│   │       │   └── admin-section.tsx
│   │       ├── elo-league/index.tsx
│   │       └── standard-league/index.tsx
│   ├── layout/             Componentes estruturais (sidebar, footer, header)
│   ├── forms/              Formulários reutilizáveis
│   ├── providers/          Context providers (UserProvider, ApolloWrapper)
│   └── auth/               Componentes de autenticação
│
├── lib/
│   ├── apollo/
│   │   ├── apollo-client.ts        Client Apollo com authLink (server-side)
│   │   ├── apollo-provider.tsx     Provider Apollo para Client Components
│   │   ├── safe-server-query.ts    Wrapper seguro para queries em Server Components
│   │   ├── queries/                Documentos GQL por domínio
│   │   └── generated/              GERADO — nunca editar manualmente
│   ├── permissions.ts              Helpers de permissão para Server Components
│   ├── action-utils.ts             Helpers para Server Actions
│   ├── utils.ts                    Utilitários gerais (cn, formatters)
│   └── logger.ts                   Logger do frontend (pino)
│
├── schemas/                Schemas Zod de validação de formulários
│   ├── game.ts
│   ├── league.ts
│   └── profile.ts
│
├── actions/                Server Actions do Next.js
├── auth/                   Configuração do NextAuth
├── i18n/                   Configuração do next-intl
└── env.ts                  Validação de variáveis de ambiente (t3-oss/env)
```

### Onde criar cada tipo de arquivo

| Tipo                                           | Onde                                                |
| ---------------------------------------------- | --------------------------------------------------- |
| Novo componente de UI genérico                 | `components/ui/`                                    |
| Card de domínio                                | `components/cards/<domain>-card.tsx`                |
| Tabela de domínio                              | `components/tables/<domain>-table.tsx`              |
| Modal                                          | `components/modals/<domain>/<modal-name>-modal.tsx` |
| Botão que dispara modal ou ação                | `components/triggers/<domain>/<name>.tsx`           |
| Composição de página inteira (sidebar+content) | `components/templates/<area>/`                      |
| Query GQL nova                                 | `lib/apollo/queries/<domain>.ts`                    |
| Schema de validação de form                    | `schemas/<domain>.ts`                               |
| Server Action                                  | `actions/<domain>.ts`                               |

---

## 6. Componentes de UI — Quando Usar Cada Um

Todos em `src/components/ui/`. São Server Components por padrão, exceto onde indicado.

| Componente       | Quando usar                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | Botão genérico com `intent` (primary/secondary/ghost/danger/outline) e `size`. Usa `buttonVariants` (CVA).                 |
| `PrimaryAction`  | CTA grande, ocupa largura total, uppercase tracking. Variantes `primary` e `red`. Ideal para ações principais em sidebars. |
| `ActionButton`   | Botão de ação secundária com ícone + label. Usado em painéis admin (editar liga, adicionar jogador).                       |
| `Modal`          | Modal base. Props: `isOpen`, `onClose`, `title`, `confirmText`, `onConfirm`. Renderiza via portal.                         |
| `MultiStepModal` | Modal com steps navegáveis. Recebe `steps[]`, `currentStep`, `onNext`, `onBack`.                                           |
| `DropdownMenu`   | Dropdown posicionado via portal. Suporta `side` (bottom/right), `align`, `openOnHover`.                                    |
| `ManageButton`   | `DropdownMenu` pré-estilizado com o visual de "Manage" (borda inferior, Settings2 icon). Aceita `children` como items.     |
| `GlowBorder`     | Container com borda gradiente e sombra profunda. Usado em cards principais de sidebar.                                     |
| `SectionHeader`  | Header de seção com `eyebrow`, `title` mono uppercase, `description` e slot `actions`.                                     |
| `GlowBorder`     | Card container com borda glow e fundo escuro.                                                                              |
| `SearchInput`    | Input de busca controlado.                                                                                                 |
| `CustomSelect`   | Select estilizado substituindo o nativo.                                                                                   |
| `DataTable`      | Tabela genérica com colunas configuráveis.                                                                                 |
| `UserChip`       | Avatar + nome de usuário compacto.                                                                                         |
| `Tabs`           | Navegação em abas (UI).                                                                                                    |

---

## 7. Queries GraphQL

**Onde ficam**: `src/lib/apollo/queries/<domain>.ts`  
**Como são escritas**: `gql` template literal, nomeadas (ex: `GetGame`, `UpdateGame`).  
**Tipos**: gerados automaticamente em `src/lib/apollo/generated/` via `pnpm codegen`.

```typescript
// Padrão de query
export const GET_GAME = gql`
  query GetGame($slug: String!) {
    game(slug: $slug) {
      id
      name
      slug
      # Solicite apenas campos que o componente usa
    }
  }
`;
```

**Regras**:

- Nunca solicite campos que o componente não usa (overfetching).
- Mutations ficam em arquivos separados: `<domain>-mutations.ts`.
- Nunca importe tipos de `../generated/` e escreva à mão — use os tipos exportados por `generated/`.
- Para Server Components: `safeServerQuery({ query: GET_GAME, variables })` — retorna `null` em erro ao invés de lançar exceção.
- Para Client Components: `useQuery(GET_GAME)` do Apollo.

**Codegen**:

```bash
pnpm codegen          # apps/web — gera tipos a partir de schema.gql
pnpm codegen:watch    # modo watch durante desenvolvimento
```

---

## 8. Internacionalização (i18n)

**Biblioteca**: `next-intl` com `localePrefix: "as-needed"` (sem prefixo para `en`, prefixo `/pt` para português).  
**Locales**: `["en", "pt"]`, default `"en"`.  
**Cookie**: `ARES_LOCALE` (definido em `src/i18n/routing.ts`).

### Arquivos de tradução

```
apps/web/messages/
  en.json
  pt.json
```

### Namespaces atuais (convenção)

| Namespace                    | Conteúdo                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `Admin`                      | Labels de admin (`panel`, etc.)                           |
| `GamePage`                   | Textos específicos da página `/games/[slug]`              |
| `GamesPage`                  | Textos específicos da página `/games`                     |
| `ProfilePage`                | Textos da página `/profile/[username]`                    |
| `League`                     | Textos de componentes de liga (cards, tabelas, templates) |
| `Modals.<ModalName>`         | Textos de cada modal específico                           |
| `Modals.<ModalName>.trigger` | Label do botão que abre o modal                           |
| `Sidebar`                    | Sidebar principal                                         |
| `Sidebar.userMenu`           | Items do menu de usuário                                  |
| `Sidebar.locale`             | Seletor de idioma                                         |
| `Validations`                | Mensagens de erro de validação de formulários             |

### Regras

1. **Um `useTranslations` por arquivo**. Se precisar de dois namespaces, use sub-namespaces ou reestruture as chaves.
2. Componentes que não são de página usam seu próprio namespace (`League`, `Modals.*`), nunca o namespace da página que os contém.
3. Textos novos: adicionar em **ambos** `en.json` e `pt.json` simultaneamente.
4. Server Components: `getTranslations("Namespace")` (async).  
   Client Components: `useTranslations("Namespace")` (hook).

---

## 9. Estilo e Tailwind

**Configuração**: `apps/web/tailwind.config.ts`. Design tokens via variáveis CSS (`--primary`, `--border`, `--foreground`, `--muted`, etc.).

### Regras

- **Nunca cores hardcoded**. Use sempre variáveis: `text-primary`, `bg-primary/10`, `border-border`, `text-foreground`, `text-muted`.
- **Variável `--primary`** é dinâmica por contexto (perfil de usuário muda a cor primária via `style` inline). Por isso nunca use `#hex` inline.
- `cn()` (de `src/lib/utils.ts`) para merge condicional de classes — nunca concatenação de strings.
- Classe `no-lift`: desabilita o efeito de hover padrão em botões. Use quando o estilo visual do botão já tem seu próprio hover.
- `glass-panel`: card com fundo semi-transparente e backdrop blur.

### Padrão de background escuro (usado em GlowBorder e ManageButton)

```
bg-[linear-gradient(180deg,rgb(20_13_22),rgb(11_8_15))]
```

---

## 10. Convenções de Naming

| Contexto                  | Convenção              | Exemplo                         |
| ------------------------- | ---------------------- | ------------------------------- |
| Arquivos de componente    | `kebab-case.tsx`       | `game-manage-actions.tsx`       |
| Componentes React         | `PascalCase`           | `GameManageActions`             |
| Funções utilitárias       | `camelCase`            | `formatCompactNumber`           |
| Variáveis de ambiente     | `SCREAMING_SNAKE_CASE` | `NEXT_PUBLIC_API_URL`           |
| Enums (values)            | `UPPER_SNAKE_CASE`     | `RANKED_LEAGUE`                 |
| Chaves de tradução        | `camelCase`            | `playOnSteam`                   |
| Namespaces de tradução    | `PascalCase`           | `GamePage`, `Modals.EditLeague` |
| Queries GQL               | `PascalCase`           | `GetGame`, `UpdateLeague`       |
| Constantes GQL exportadas | `UPPER_SNAKE_CASE`     | `GET_GAME`                      |
| Rotas de URL              | `kebab-case`           | `/games/my-game-slug`           |
| Slugs no banco            | `kebab-case`           | `counter-strike-2`              |
| Classes CSS custom        | `kebab-case`           | `glass-panel`, `no-lift`        |

---

## 11. Variáveis de Ambiente

### `apps/web`

Validadas via `@t3-oss/env-nextjs` em `src/env.ts`. Toda variável deve ser declarada lá antes de usar.

| Variável              | Tipo           | Descrição                       |
| --------------------- | -------------- | ------------------------------- |
| `NEXTAUTH_SECRET`     | string (≥32)   | Segredo de assinatura de sessão |
| `NEXTAUTH_URL`        | url (opcional) | URL base do NextAuth            |
| `NEXT_PUBLIC_API_URL` | url            | URL do backend GraphQL          |
| `NEXT_PUBLIC_CDN_URL` | url            | URL do CDN para imagens         |
| `NEXT_PUBLIC_APP_URL` | url (opcional) | URL do app                      |

### `apps/api`

Validadas via `@nestjs/config` + Joi (ou similar) em `src/env.ts`.

| Variável                | Descrição                         |
| ----------------------- | --------------------------------- |
| `DATABASE_URL`          | Connection string Postgres        |
| `JWT_SECRET`            | Segredo de assinatura JWT         |
| `DISCORD_CLIENT_ID`     | OAuth Discord                     |
| `DISCORD_CLIENT_SECRET` | OAuth Discord                     |
| `CORS_ORIGIN`           | URL permitida no CORS             |
| `PORT`                  | Porta do servidor (default: 4000) |

---

## 12. Decisões Arquiteturais Tomadas (Não Reverter)

Estas decisões foram deliberadas. Antes de mudar qualquer uma, leia o PLAN.md e entenda o contexto.

1. **Pastas de rota limpas**: `app/[locale]/**` contém apenas arquivos reservados do Next.js. Sub-componentes de página vivem em `components/`.

2. **`@ares/core` como fonte única de enums**: enums nunca são duplicados entre API, web e banco. O banco espelha o `core`, não o contrário.

3. **GraphQL code-first**: o schema é gerado a partir dos decorators do NestJS. Nunca escreva SDL (`.graphql`) manualmente.

4. **Codegen obrigatório**: tipos TypeScript do Apollo são sempre gerados. Interfaces manuais para dados da API são proibidas.

5. **`safeServerQuery` para Server Components**: queries em Server Components usam este wrapper que absorve erros de rede/indisponibilidade ao invés de lançar exceção e quebrar a página.

6. **`useUser()` apenas em Client Components**: permissões em Server Components vêm de `getServerAuthSession()` + funções de `lib/permissions.ts`.

7. **Um `useTranslations` por arquivo**: reduz acoplamento e mantém rastreabilidade de chaves.

8. **`ManageButton` como componente genérico de gestão**: o dropdown "Manage" tem visual padronizado e aceita `children` como items. Nunca duplique o trigger button.

9. **Migrations versionadas**: `pnpm db:migrate` no desenvolvimento, nunca `prisma db push` como fluxo principal. Migrations ficam em `packages/db/prisma/migrations/`.

10. **Autorização no backend, não no frontend**: o frontend condiciona UI, mas a API sempre valida permissões independentemente. Um cliente que bypasse o frontend não deve conseguir executar operações protegidas.
