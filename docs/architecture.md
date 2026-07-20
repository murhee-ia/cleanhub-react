# Frontend Architecture

A practical map of the `cleanhub-react` SPA: where code lives, the shared design-system layer, and the load-bearing decisions already made. This reflects the app as it actually stands today (auth + foundations); it will grow as more features land.

The app is a React 19 + Vite single-page app that consumes the Laravel REST API over bearer-token auth. Two providers wrap everything (`main.jsx`): `QueryClientProvider` for server state and `RouterProvider` for routing; auth context is provided inside the router so it can use router hooks.

## Directory map

Everything lives under `src/`. Each folder has one job.

| Folder | Purpose |
|---|---|
| `api/` | Axios instance + one thin module per resource |
| `components/` | Shared UI + the route guard (not tied to one feature) |
| `context/` | React context + provider for cross-app state |
| `hooks/` | Cross-feature reusable hooks |
| `layouts/` | Route-level layout shells that render an `<Outlet />` |
| `lib/` | Query client, zod schemas, helpers, constants |
| `pages/` | Route-level components, composed from layouts + components |
| `features/` | Feature-scoped modules (empty for now — populated as features land) |
| `assets/` | Static assets imported by components |
| `src/router.jsx` | The route tree (public / auth / role-guarded) |
| `src/main.jsx` | App entry — mounts the provider stack |

**Routing shape.** `router.jsx` uses a single `RootLayout` (provides auth context) at the root, with three groups beneath it: public routes (`/`, `/jobs`, `/not-allowed`), auth routes under `AuthLayout` (`/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`), and role-guarded areas (`/cleaner`, `/employer`, `/moderator`, `/admin`) each wrapped in `ProtectedRoute` then its layout.

**Auth state.** `AuthProvider` holds `{ token, user }`, rehydrated from `localStorage` on load, and exposes `login` / `register` / `logout` / `isAuthenticated`. Components read it via the `useAuth` hook; `ProtectedRoute` uses it to gate role areas.

## Design-system layer

The visual identity is "editorial base with sparse scrapbook accents." The reusable pieces live in two places — CSS tokens/utilities in `src/index.css`, and primitive components in `src/components/`. New pages should compose these rather than hand-rolling styles.

**Tokens & utilities (`src/index.css`):**

- `--font-serif` — a display serif (`@theme` token, used as `font-serif`). **Headings/titles only** — never body copy or form controls, which stay on `--font-sans`.
- `.paper` — a surface with a very light grain texture (inline SVG noise) and hairline framing; the "paper card" feel.
- `.washi-tape` — the shape/opacity/shadow of a decorative tape strip; color and rotation are set by the component.

These sit alongside the brand color tokens (`--color-primary`, `--color-surface`, `--color-foreground`, `--color-highlight`, `--color-danger`, …) already defined in the `@theme` block.

**Primitive components (`src/components/`):**

| Component | Role |
|---|---|
| `PaperCard.jsx` | `.paper` container with hairline border + shadow |
| `WashiTape.jsx` | One sparse tape accent (tone + rotation props) |
| `AuthCard.jsx` | Auth-page frame: `PaperCard` + one `WashiTape` + serif title |
| `TextField.jsx` | Labeled input wired for React Hook Form + error display |
| `Button.jsx` | `primary` / `ghost` variants |

**How a new page hooks in:** wrap the content in `PaperCard` (or `AuthCard` for auth-style pages) for the paper/tape treatment, put headings in `font-serif`, and build forms from `TextField` + `Button`. Keep the scrapbook flavor in typography and card framing — functional controls stay clean and modern. Deliberately **not** built yet: torn/deckle edges (deferred to job/card grids later).

## Key decisions

Decisions already locked in, with the one-line why and where they're enforced. Change these deliberately — a lot hangs off each.

| Decision | Why | Where enforced |
|---|---|---|
| React Router in **library mode** (`createBrowserRouter`), not framework mode | An SPA over a REST API doesn't need file-based routing or loaders; guards are plain components | `src/router.jsx`, `components/ProtectedRoute.jsx` |
| Bearer token in **`localStorage`**, not cookies | Sanctum is stateless bearer auth — no cookies, no CSRF layer | `api/client.js` (interceptors), `context/AuthProvider.jsx` |
| Session (`user`) also cached in `localStorage` | Backend exposes no current-user endpoint, so the app rehydrates the logged-in user from the login/register response | `context/AuthProvider.jsx` |
| **TanStack Query key-factory** convention per resource | Scoped cache invalidation instead of blowing away unrelated caches | Convention in `CLAUDE.md`; applied per resource as they're built (e.g. a future `jobKeys` beside `api/jobs.js`) |
| Route guards are **UX only** | The backend policies are the real authorization gate; a client guard can't be trusted to protect a mutation | `components/ProtectedRoute.jsx` (guards render), backend policies (enforce) |
