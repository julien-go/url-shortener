# CLAUDE.md

Working guide for this repository. Goal: act rigorously **without re-reading the whole codebase**. This map tells you where things live and which conventions to follow. Verify a file before asserting, but start here.

## Project

**Fliro** — fullstack TypeScript URL shortener (portfolio project). See `README.md` for the product pitch, flow diagrams (create / redirect / stats) and the database schema. This file complements the README on the **code conventions** side, not the product side.

- Frontend: React 19, Vite, React Router 7, TanStack Query 5, Tailwind 4, shadcn/ui (Radix).
- Backend: Node 20+, Express 5, Apollo Server 5 (GraphQL), Zod, PostgreSQL (`pg`), pino, JWT in an HttpOnly cookie.
- pnpm workspace monorepo. Workspace globs cover `apps/*` only.

## Commands

Always run through pnpm from the repo root (Windows / PowerShell). Filter by app when needed.

```bash
pnpm dev                 # front + back in parallel (-r)
pnpm -r lint             # ESLint
pnpm -r typecheck        # tsc --noEmit
pnpm -r test             # vitest run
pnpm -r build

pnpm --filter ./apps/backend db:migrate    # dbmate up (SQL migrations)
pnpm --filter ./apps/backend db:status
```

**Before calling a task done**, run at least `typecheck` and `lint` on the touched app, and `test` if any logic changed. Never claim a test passes without having run it.

## Code map

### Backend (`apps/backend/src`)

Layered architecture, downward dependencies only (`resolver → service → repo → db`):

- `config/env.ts` — **single source** of config. Typed `env` object, validated by Zod at startup (throws if invalid). Never read `process.env` anywhere else; add any new variable here.
- `graphql/schema.ts` — SDL. `graphql/resolvers/` — resolvers split by type (`mutation`, `query`, `shortUrl`). `resolvers.schema.ts` = Zod schemas for GraphQL inputs. `shared.ts` = error helpers (`requireAuth`, `badUserInput`, `internalServerError`). `context.ts` = auth cookie → `ctx.user`.
- `modules/<domain>/` — business logic. File convention: `*.service.ts` (business), `*.repo.ts` (SQL), `*.schema.ts` (Zod), `*.types.ts`, `*.constants.ts`, `*.utils.ts`. Domains: `auth`, `users`, `shortUrls`.
- `http/routes/redirect.route.ts` — Express `/:code` route (outside GraphQL), 302 redirect + non-blocking click tracking.
- `security/` — `authCookies`, `headers` (CSP/HSTS/…), `rateLimit*`. `utils/logger.ts` — pino.
- `db/pool.ts` — `pg` pool. `migrations/` — versioned SQL applied by dbmate.

### Frontend (`apps/frontend/src`)

**Feature-based** layout:

- `app/` — `App.tsx` (routes + `RequireAuth`/`GuestOnly` guards), `layouts/`, `providers/` (Auth, Query, Toast — each context is a `*Context.ts` + `*Provider.tsx` + `use*.ts` hook).
- `features/<auth|links>/` — subtree of `api/` (requests + `types.ts`), `hooks/` (TanStack Query wrappers), `components/`.
- `components/ui/` — shadcn/ui primitives. No business logic here.
- `lib/graphql/graphqlFetch.ts` — **the only** network entry point. `config/app.ts`, `lib/utils.ts` (`cn`), `pages/`.

## Backend conventions

- **Services: discriminated results, no exceptions for business cases.** A service returns `{ ok: true, … } | { ok: false, reason: "INVALID_URL" | … }` (see `shortUrls.service.ts`). The resolver maps `reason` → `GraphQLError`. Only `throw` for the unexpected.
- **GraphQL errors** go through the `resolvers/shared.ts` helpers and `GraphQLError` with `extensions.code` (`BAD_USER_INPUT`, `UNAUTHENTICATED`, `INTERNAL_SERVER_ERROR`) plus an optional `reason`. Never leak an internal message/stack to the client: log server-side, return a generic message (see `internalServerError`).
- **Validation**: every GraphQL input goes through a Zod schema `safeParse` before use. Auth is enumeration-resistant (`login` always compares against `DUMMY_PASSWORD_HASH`, generic message).
- **SQL** lives exclusively in `*.repo.ts`, parameterized queries (`$1`), never string interpolation. Deletion is **logical** (`deleted_at` + `is_active=false`), never a physical DELETE.
- **Non-blocking side effects** (click tracking): `void promise.catch(err => logger.error(...))`, never in the response path.
- **DB schema changes** = a new numbered migration in `migrations/`. Never edit an already-applied migration.
- Strict ESM (`"type": "module"`): relative imports with full path.

## Frontend conventions

- **Data access = TanStack Query, not `useEffect`.** Reads via `useQuery`, writes via `useMutation` (see `hooks/`). After a mutation, invalidate the relevant query keys (`qc.invalidateQueries({ queryKey: ["myLinks"] })`) rather than mutating local state. Query keys must be stable and serializable (`["myLinks", limit, cursor]`).
- **Network** only through `graphqlFetch<TData, TVars>`; do not call `fetch` directly in a component. Each request lives in `features/*/api/*.ts` with its response type.
- **Auth / routing**: guard per component (`RequireAuth`, `GuestOnly` in `App.tsx`) based on `useMe()`. Do not use imperative `useEffect` redirects for this — use `<Navigate>`.

### `useEffect` — avoid it outside its legitimate domain

`useEffect` is **only** for synchronizing with an external system (subscription, event listener, timer, non-React lib integration, DOM focus). Do **not** use it to:

- fetch data → `useQuery`;
- react to a click / submit → an event handler;
- derive state from props/state → compute during render (or `useMemo` if expensive), not a mirror state + effect;
- transform data for display → at render time;
- "reset when the id changes" → prefer a `key` on the component.

If you write a `useEffect`, justify the external system being synchronized (one sentence is enough); otherwise there is almost always a better option. Always provide the full dependency array (the react-hooks ESLint rule checks it — do not disable it to work around it).

### State management

- **Server state** → TanStack Query (all API data).
- **Shared client state** → React Context providers in `app/providers/` (auth session, toasts). No global store library.
- **Local state** → `useState`. Derived state → compute at render (`useMemo` if expensive), never a mirror state.

### Naming conventions

| Type              | Convention                          | Example                                  |
| ----------------- | ----------------------------------- | ---------------------------------------- |
| Components        | PascalCase `.tsx`                   | `LinkCard.tsx`, `CreateShortUrlForm.tsx` |
| Hooks             | camelCase, `use` prefix             | `useMyLinks.ts`, `useLinkStats.ts`       |
| Pages             | PascalCase, `Page` suffix, `pages/` | `MyLinksPage.tsx`                         |
| API requests      | `*.query.ts` / `*.mutation.ts`      | `myLinks.query.ts`, `login.mutation.ts`  |
| Types / utils     | camelCase                           | `types.ts`, `utils.ts`                   |

Pages live in `src/pages/`; everything else (api, hooks, components) lives inside its feature folder.

### Routes

Defined in `app/App.tsx`. `/:code` short-link redirection is a **backend** Express route, not a frontend route.

| Path                | Access | Page                                     |
| ------------------- | ------ | ---------------------------------------- |
| `/`                 | public | `HomePage` (landing vs workspace by auth)|
| `/login`            | guest  | `LoginPage` (redirects if signed in)     |
| `/register`         | guest  | `RegisterPage`                           |
| `/links`            | auth   | `MyLinksPage`                            |
| `/links/:id/stats`  | auth   | `LinkStatsPage`                          |
| `*`                 | public | `NotFoundPage`                          |

### Other UI rules

- New UI: reuse `components/ui/` (shadcn) and `cn()` to compose classes. No ad-hoc CSS.
- `useCallback`/`useMemo` only when a stable dependency is actually needed (a context value, a prop passed to a memoized child), not by reflex.

## Style & quality (cross-cutting)

- **Strict TypeScript**, no `any`. For external/unknown JSON, type it `unknown` then narrow explicitly (see `graphqlFetch`).
- **Tests are required for logic, not for pure UI.** Cover with Vitest: backend services/utils, frontend business-logic hooks, and critical components (auth forms, role/auth conditional rendering) — including the failure/`reason` paths. Do not test pure presentational UI (shadcn primitives, layout). Tests live in `apps/backend/tests/` and alongside frontend code; run `pnpm -r test` before finishing.
- **Keep `README.md` in sync.** When a change affects something the README documents — stack, repo layout, features, DB schema, app flows, security, observability, env/production notes — update the README in the same change. Keep it in its existing language and product-oriented tone; do not turn it into a code reference.
- **No superfluous comments.** Write readable code that needs no comment; add one only for a non-obvious "why" (invariant, workaround). Do not comment what the code already says.
- Match the neighboring file's style (naming, imports, structure). Prefer small focused files over a catch-all, as `features/links/components/stats/` already does.
- Do not add a dependency without need; tooling (ESLint, tsconfig) is shared — changing it has cross-cutting effects.
- Secrets and sensitive config: through `env` (backend) / `import.meta.env` (frontend), never hardcoded. Never log a sensitive field.

## Git

- Commit messages **without** a `Co-Authored-By` / AI-attribution line.
- Do not commit/push without an explicit request. If on `main`, create a branch first.
