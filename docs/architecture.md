# Frontend Architecture

A practical map of the `cleanhub-react` SPA: where code lives, the shared design-system layer, and the load-bearing decisions already made. This is updated as new code lands, in the same format as what's already here.

The app is a React 19 + Vite single-page app that consumes the Laravel REST API over bearer-token auth. Two providers wrap everything (`main.jsx`): `QueryClientProvider` for server state and `RouterProvider` for routing; auth context is provided inside the router so it can use router hooks.

## Directory map

Everything lives under `src/`. Each folder has one job.

| Folder | Purpose |
|---|---|
| `api/` | Axios instance + one thin module per resource:<ul><li>`jobs.js` — browse, post, and manage cleaning job posts</li><li>`applications.js` — apply, withdraw, review, and the calendar feed</li><li>`savedJobs.js` — a cleaner's bookmarked jobs</li><li>`profile.js` — the caller's own profile + public cleaner/employer profiles</li><li>`jobCategories.js` — the fixed category list</li><li>`auth.js` — register/login/logout/verify/reset</li></ul> |
| `components/` | Shared UI, not tied to one feature — primitives (`PaperCard`, `Button`, `Modal`, `Badge`, form fields), the route guard, and the role-based `Sidebar` |
| `context/` | `authContext.js` + `AuthProvider.jsx` — the auth React context and its provider |
| `hooks/` | Cross-feature reusable hooks (`useAuth`, `useDebounce`) |
| `layouts/` | Route-level layout shells that render an `<Outlet />`:<ul><li>`CleanerLayout`, `EmployerLayout` — sidebar + content for their role</li><li>`ModeratorLayout`, `AdminLayout` — same shape, currently placeholder dashboards</li><li>`RootLayout` — the top-level shell providing auth context</li><li>`AuthLayout` — the centered card frame around login/register/reset</li></ul> |
| `lib/` | Query client, zod schemas (`lib/schemas/`), and helper modules (`lib/helpers/`):<ul><li>`paths.js` — role-aware links so a shared page keeps the right sidebar</li><li>`roles.js` — role constants, route-guard lookup, post-login redirect target</li><li>`formErrors.js` — maps a `422` onto React Hook Form field errors</li><li>`wordCount.js` — backs every word-capped field's live counter</li><li>`fileLimits.js` — shared file-size constants for uploads</li><li>`scheduleConflict.js` — the client-side mirror of the backend's overlap check</li></ul> |
| `pages/` | Route-level components, composed from layouts + components + features |
| `features/` | Feature-scoped modules, one directory per domain:<ul><li>`jobs/` — browsing, posting, status transitions, the save button</li><li>`applications/` — the apply modal, applicant review, status badges/tabs</li><li>`calendar/` — the FullCalendar wrapper and its event mapping</li><li>`profile/` — cleaner/employer profile forms and views</li></ul> |
| `assets/` | Static assets imported by components |
| `src/router.jsx` | The route tree (public / auth / role-guarded) |
| `src/main.jsx` | App entry — mounts the provider stack |

**Routing shape.** `router.jsx` uses a single `RootLayout` (provides auth context) at the root, with these groups beneath it:

- **Public** — `/`, `/jobs`, `/jobs/:id`, `/not-allowed`.
- **Any authenticated user** — `/cleaners/:id`, `/employers/:id` (viewing someone else's public profile from outside your own role's sidebar).
- **Auth** — under `AuthLayout`: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.
- **Role-guarded areas** — `/cleaner`, `/employer`, `/moderator`, `/admin`, each wrapped in `ProtectedRoute` then its layout. `/cleaner` additionally nests `saved-jobs`, `applications`, `calendar`, `profile`, `profile/edit`, and — importantly — its **own copies** of `jobs/:id` and `employers/:id`. `/employer` mirrors this with `jobs`, `jobs/new`, `jobs/:id/applicants`, `jobs/:id`, `profile`, `profile/edit`, and `cleaners/:id`.

That last point is a real pattern, not incidental duplication: a job detail page or another user's profile is reachable from several different places (a job card on the feed, on saved jobs, on an application), and a signed-in cleaner or employer should never lose their sidebar just because they clicked into one of those. Rather than one shared detail route, each role gets its **own** copy of the same page component nested under its own layout — see `lib/helpers/paths.js`'s `jobDetailPath()` / `employerProfilePath()` / `cleanerProfilePath()`, which pick the right prefix (`/cleaner/...`, `/employer/...`, or the bare public route) based on the current viewer's role, so a `<Link>` never has to hardcode which sidebar it should preserve.

**Auth state.** `AuthProvider` holds `{ token, user }`, persisted to `localStorage` under the keys `access_token` and `auth_user` and rehydrated from there on load (the backend has no "current user" endpoint, so this cached copy is the only source until the next login), and exposes `login` / `register` / `logout` / `isAuthenticated`. Components read it via the `useAuth` hook; `ProtectedRoute` uses it to gate role areas, and `lib/helpers/roles.js`'s `isPathAllowedForRole()` is what a fresh login checks the remembered "come back here after logging in" location against, so a stale redirect from one role's area can't bounce a different role's login into `/not-allowed`.

## Design-system layer

The visual identity is a **neo-brutalist** look throughout: thick (2px) solid borders, hard offset drop-shadows with no blur (`--shadow-card`, `--shadow-btn`, `--shadow-btn-sm` — all `Npx Npx 0 <color>`, not a soft CSS blur), bold display headings, and a small, saturated brand palette. One decorative accent from an earlier direction survives on exactly one screen: `WashiTape.jsx`'s torn-paper-tape strip appears only on `AuthCard` (the auth-page frame) — it is **not** a general pattern to sprinkle elsewhere, and no second one should be added without a deliberate design decision to do so.

The reusable pieces live in two places — CSS tokens/utilities in `src/index.css`, and primitive components in `src/components/`. New pages should compose these rather than hand-rolling styles, and any new color must come from the `@theme` token block, never a hardcoded hex value in a component.

**Tokens & utilities (`src/index.css`):**

- `--font-serif` (aliased `--heading` in places) — a display serif/heading font. **Headings, titles, and buttons only** — never body copy or the text inside form controls, which stay on `--font-sans`.
- `--color-primary` (brand green), `--color-highlight`/`-soft`/`-muted`/`-strong` (yellow, used for saved/pending/highlight states), `--color-caution`, `--color-danger`, plus the neutrals (`--color-background`, `--color-surface`, `--color-foreground`, `--color-muted`) and `--border`. No blue or purple exists in the palette.
- `.paper` / `.paper-flat` — the card surface: hairline border, grain texture, and the hard offset shadow. `.paper` lifts slightly on hover (for clickable cards); `.paper-flat` doesn't (for forms and static panels like a modal body).
- `.washi-tape` — the shape/opacity/shadow of the one tape accent described above; color and rotation are set by the component using it.

**Primitive components (`src/components/`):**

| Component | Role |
|---|---|
| `PaperCard.jsx` | `.paper`/`.paper-flat` container — the base card used almost everywhere |
| `WashiTape.jsx` | The single sparse tape accent (tone + rotation props), `AuthCard`-only |
| `AuthCard.jsx` | Auth-page frame: `PaperCard` + one `WashiTape` + heading title |
| `Modal.jsx` | Generic dialog: portal-rendered, dimmed backdrop, Escape/backdrop-click to close, focus trapped inside the panel — the shared base for the apply modal and the applicant-review drawer, so a dialog is only built once |
| `Badge.jsx` | Small pill/chip — the base every status badge (`JobStatusBadge`, `ApplicationStatusBadge`) and the category chip render through |
| `Button.jsx` | Several variants sharing one base style:<ul><li>`primary` — the main call-to-action color</li><li>`secondary` — a lower-emphasis alternative</li><li>`ghost` — outlined, for a de-emphasized action beside a primary one</li><li>`icon` — chromeless, icon-only</li><li>`danger` — destructive actions</li><li>`dark`, `complete` — narrower-purpose variants used only by specific job-status transition actions</li></ul> |
| `Sidebar.jsx` | The role-based left nav (desktop) / collapsed icon rail (tablet) / top tab bar (mobile), shared by every signed-in layout — see the key decisions below for how it decides which link is "active" |
| `TextField.jsx`, `TextAreaField.jsx`, `SelectField.jsx`, `FileInput.jsx`, `TagsInput.jsx` | Labeled form controls wired for React Hook Form, each with its own error-display slot |
| `Pagination.jsx` | Page-number controls driven by a Laravel paginator's `meta` object |
| `RatingSummary.jsx` | Compact star-rating display (used ahead of the rating system existing, with placeholder data) |
| `WordCounter.jsx` | Live word count against a limit, paired with any field that has a backend word cap (job titles, application messages, profile bios) |
| `ProtectedRoute.jsx` | The role route guard described above |
| `PublicNavbar.jsx` | The guest-facing top nav on public pages |

**How a new page hooks in:** wrap the content in `PaperCard` (or `AuthCard` only for the auth screens), put headings on the heading font, and build forms from the form-field primitives + `Button`. Every signed-in page under `/cleaner` or `/employer` must render inside that role's layout (so the sidebar is always present) — see `lib/helpers/paths.js` for how a shared page keeps the right sidebar when linked into from multiple places.

## Key decisions

Decisions already locked in, with the one-line why and where they're enforced. Change these deliberately — a lot hangs off each.

| Decision | Why | Where enforced |
|---|---|---|
| React Router in **library mode** (`createBrowserRouter`), not framework mode | An SPA over a REST API doesn't need file-based routing or loaders; guards are plain components | `src/router.jsx`, `components/ProtectedRoute.jsx` |
| Bearer token in **`localStorage`**, not cookies | Sanctum is stateless bearer auth — no cookies, no CSRF layer | `api/client.js` (interceptors), `context/AuthProvider.jsx` |
| Session (`user`) also cached in `localStorage` | Backend exposes no current-user endpoint, so the app rehydrates the logged-in user from the login/register response | `context/AuthProvider.jsx` |
| **TanStack Query key-factory** convention per resource | Scoped cache invalidation (e.g. accepting an application only invalidates that job's applicant list and the cleaner's calendar) instead of blowing away unrelated caches | One factory per resource, colocated with its `api/*.js` file:<ul><li>`jobKeys`</li><li>`applicationKeys` (includes `.calendar()`)</li><li>`savedJobKeys`</li><li>`profileKeys`</li><li>`jobCategoryKeys`</li></ul> |
| Route guards are **UX only** | The backend policies are the real authorization gate; a client guard can't be trusted to protect a mutation | `components/ProtectedRoute.jsx` (guards render), backend policies (enforce) |
| A shared detail page (job detail, another user's profile) is mirrored under each role rather than having one canonical route | A signed-in user should never lose their sidebar just because they clicked into a page also reachable from a public/guest context | `router.jsx`'s per-role route nesting; `lib/helpers/paths.js`'s role-aware path pickers |
| The sidebar's "active" link is the **longest matching non-root path**, remembered across navigation to a page no link directly owns | `/cleaner` (the root) is a structural ancestor of every cleaner route, so naively matching by prefix would highlight Home Feed on every page; a shared page like a job detail view isn't "owned" by any one link, so the sidebar keeps whichever section was last genuinely active instead of guessing | `components/Sidebar.jsx`'s `pickDirectMatch()` plus a small piece of state that only updates when a new *direct* match is found |
| `NavLink`'s `className` prop is always passed as a **function**, never a plain string | React Router runs its own prefix-based active check internally and appends its own `active` class regardless of the custom logic passed in — a string `className` can't suppress that, so more than one link could end up visually active at once | `components/Sidebar.jsx`'s `SidebarLink`/`MobileTab` |
| The client mirrors the backend's schedule-overlap check before submitting an apply, in addition to reacting to the server's rejection | Warning the cleaner up front is a better experience than only finding out after a failed submit — but the warning is non-blocking, since the backend's `409` is the actual enforcement | `lib/helpers/scheduleConflict.js` (mirrors `ApplicationController::conflictsWithAcceptedSchedule` in the backend), consumed by `ApplyModal.jsx` |
| A `409` schedule-conflict apply rejection gets its own UI treatment, not the shared field-error banner used for the `422` rejections | It's a genuinely different kind of failure (a real scheduling clash, not invalid input) and deserves a visually distinct, caution-colored callout rather than reading like every other validation error | `ApplyModal.jsx` branches on `error.response.status === 409` before falling back to the generic `422` handling |
| React's "adjust state during render" pattern for resyncing local optimistic state to a fresh server value | Avoids an extra `useEffect`-triggered re-render just to reconcile "what I set locally" with "what the server actually says" after a background refetch | `SaveJobButton.jsx`'s `is_saved` resync; `Sidebar.jsx`'s active-link state |
