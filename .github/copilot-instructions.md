# Ares — Project Guidelines

Before making any structural change, read `ARCHITECTURE.md` at the repo root. It is the source of truth for this project.

## Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full reference. Key rules enforced here:

**Directory layout**

- Route folders (`app/[locale]/**`) contain **only** Next.js reserved files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`. All other files go into `src/components/`.
- New UI components → `components/ui/`
- Domain cards → `components/cards/`, tables → `components/tables/`, modals → `components/modals/<domain>/`, action triggers → `components/triggers/<domain>/`, heavy page compositions → `components/templates/`
- GraphQL queries → `lib/apollo/queries/<domain>.ts` (mutations in `<domain>-mutations.ts`)
- Form validation schemas → `schemas/<domain>.ts`

**Data flow**

- Types from the Apollo codegen (`lib/apollo/generated/`) — never write manual TypeScript interfaces for API data.
- Run `pnpm codegen` (in `apps/web`) after any schema change before writing frontend code.
- Server Components fetch with `safeServerQuery()`. Client Components use `useQuery()`.

**Enums and shared types**

- All domain enums and permission keys live in `packages/core`. Never define the same enum in two places.

**Permissions**

- Server Components: `getServerAuthSession()` + helpers from `lib/permissions.ts`.
- Client Components: `useUser()` hook from `@/components/providers`.
- API: `@UseGuards(GqlAuthGuard, PermissionsGuard)` + `@RequiredPermissions(...)` on every sensitive mutation.

## Code Conventions

- **One `useTranslations` per file.** Use sub-namespaces if multiple are needed.
- **No hardcoded colors.** Use Tailwind tokens (`text-primary`, `bg-primary/10`, `border-border`, `text-muted`, etc.).
- Use `cn()` from `lib/utils` for conditional class merging — never string concatenation.
- Reuse `ManageButton` for any "Manage" dropdown trigger. Never duplicate its styled button.

## Workflow

**After any task that modifies more than 2 files**, run lint-staged from the repo root before considering the task complete:

```bash
pnpm exec lint-staged
```

- If lint-staged auto-fixes files (ESLint `--fix`, Prettier `--write`), report which files changed.
- If lint-staged exits with errors, fix them before finishing — do not leave linting failures unresolved.
- This applies to all file types: `.ts`, `.tsx`, `.json`, `.md`, `.yml`, etc.

## Build and Test

```bash
pnpm dev          # starts all apps (root)
pnpm codegen      # regenerate Apollo types (apps/web)
pnpm db:migrate   # run Prisma migrations (packages/db)
pnpm tsc --noEmit # type-check (run in apps/web or apps/api)
```
