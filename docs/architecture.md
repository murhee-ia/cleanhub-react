# Frontend Architecture

A practical map of the `cleanhub-react` SPA: where code lives, the shared design-system layer, and the load-bearing decisions already made. This is updated as new code lands, in the same format as what's already here.

The app is a React 19 + Vite single-page app that consumes the Laravel REST API over bearer-token auth. Two providers wrap everything (`main.jsx`): `QueryClientProvider` for server state and `RouterProvider` for routing; auth context is provided inside the router so it can use router hooks.

## Runtime and project-level files

Before `src/` takes over, a small set of root files installs, starts, checks,
and packages the app:

| Path | Purpose |
|---|---|
| `package.json`, `package-lock.json` | Declare scripts and lock the exact JavaScript dependency graph. `dev`, `build`, `lint`, and `preview` are the supported entry commands. |
| `.env` | Supplies `VITE_API_URL`, which becomes the Axios base URL at build/dev time. Vite exposes only variables with its public prefix, so secrets do not belong here. |
| `index.html` | Browser document shell. It supplies metadata, the `#root` mount node, fonts, and the module script that starts `src/main.jsx`. |
| `vite.config.js` | Connects Vite's React transform and Tailwind plugin. It controls the build tool, not application routing. |
| `eslint.config.js` | Defines the static code checks used by `npm run lint`, including hook and fast-refresh rules. |
| `public/` | Files copied and served by URL as-is, such as the favicon and icon sprite. Imported source assets belong in `src/assets/` instead. |
| `dist/` | Generated production output from `npm run build`. It is a delivery artifact, not a place to edit application code. |

The boot chain is short: the browser loads `index.html`; that imports
`src/main.jsx`; `main.jsx` mounts React, server-state, and routing providers; the
router then selects `RootLayout`, which adds `AuthProvider` around the matched
page.

## Directory map

Everything lives under `src/`. Each folder has one job.

| Folder | Purpose |
|---|---|
| `api/` | Axios instance + one thin module per resource:<ul><li>`jobs.js` — browse, post, publish, advance, and complete cleaning job posts</li><li>`applications.js` — apply, withdraw, review, complete, and read the calendar feed</li><li>`savedJobs.js` — a cleaner's bookmarked jobs</li><li>`profile.js` — the caller's own profile + public cleaner/employer profiles</li><li>`ratings.js` — visible profile review lists + rating submission</li><li>`notifications.js` — list notifications and mark one/all read</li><li>`jobCategories.js` — the category lookup</li><li>`auth.js` — register/login/logout/verification/reset requests</li></ul> |
| `components/` | Shared UI, not tied to one feature — primitives (`PaperCard`, `Button`, `Modal`, `Badge`, form fields), the route guard, and the role-based `Sidebar` |
| `context/` | `authContext.js` + `AuthProvider.jsx` — the auth React context and its provider |
| `hooks/` | Cross-feature reusable hooks (`useAuth`, `useDebounce`) |
| `layouts/` | Route-level shells that render an `<Outlet />`:<ul><li>`CleanerLayout`, `EmployerLayout` — sidebar + content for their role</li><li>`RootLayout` — top-level shell providing auth context</li><li>`AuthLayout` — centered card frame around login/register/reset</li></ul> |
| `lib/` | Query client, zod schemas (`lib/schemas/`), and helper modules (`lib/helpers/`):<ul><li>`paths.js` — role-aware links so a shared page keeps the right sidebar</li><li>`roles.js` — role constants, route-guard lookup, post-login redirect target</li><li>`formErrors.js` — maps a `422` onto React Hook Form field errors</li><li>`wordCount.js` — backs every word-capped field's live counter</li><li>`fileLimits.js` — shared file-size constants for uploads</li><li>`scheduleConflict.js` — client-side mirror of the backend overlap check</li><li>`notificationTarget.js` — maps notification types to role-aware destinations</li></ul> |
| `pages/` | Route-level components, composed from layouts + components + features |
| `features/` | Feature-scoped modules, one directory per domain:<ul><li>`jobs/` — browsing, posting, status transitions, save controls, employer proof upload</li><li>`applications/` — apply modal, applicant review, decisions, cleaner proof upload, status badges/tabs</li><li>`calendar/` — FullCalendar wrapper and event mapping</li><li>`profile/` — cleaner/employer forms and views</li><li>`ratings/` — star input, rating modal/button, profile review list</li><li>`notifications/` — polling bell/dropdown, rows, read mutations, click routing</li></ul> |
| `assets/` | Static assets imported by components |
| `src/router.jsx` | The route tree (public / auth / role-guarded) |
| `src/main.jsx` | App entry — mounts the provider stack |

**Routing shape.** `router.jsx` uses a single `RootLayout` (provides auth context) at the root, with these groups beneath it:

- **Public** — `/`, `/jobs`, `/jobs/:id`, `/not-allowed`.
- **Any authenticated user** — `/cleaners/:id`, `/employers/:id` (viewing someone else's public profile from outside your own role's sidebar).
- **Auth** — under `AuthLayout`: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.
- **Role-guarded areas described here** — `/cleaner` and `/employer`, each wrapped in `ProtectedRoute` then its layout. `/cleaner` additionally nests `saved-jobs`, `applications`, `calendar`, `notifications`, `profile`, `profile/edit`, and — importantly — its **own copies** of `jobs/:id` and `employers/:id`. `/employer` mirrors this with `jobs`, `jobs/new`, `jobs/:id/applicants`, `jobs/:id`, `notifications`, `profile`, `profile/edit`, and `cleaners/:id`.

That last point is a real pattern, not incidental duplication: a job detail page or another user's profile is reachable from several different places (a job card on the feed, on saved jobs, on an application), and a signed-in cleaner or employer should never lose their sidebar just because they clicked into one of those. Rather than one shared detail route, each role gets its **own** copy of the same page component nested under its own layout — see `lib/helpers/paths.js`'s `jobDetailPath()` / `employerProfilePath()` / `cleanerProfilePath()`, which pick the right prefix (`/cleaner/...`, `/employer/...`, or the bare public route) based on the current viewer's role, so a `<Link>` never has to hardcode which sidebar it should preserve.

**Auth state.** `AuthProvider` holds `{ token, user }`, persists both to `localStorage` under `access_token` and `auth_user`, and rehydrates them on load. The backend has `/user`, but this client does not currently call it during startup; the cached login/register response remains the local identity until logout or the next `401`. `AuthProvider` exposes `login` / `register` / `logout` / `isAuthenticated`, and clears the TanStack Query cache whenever the session changes so one account cannot inherit another account's cached data. Components read auth through `useAuth`; `ProtectedRoute` gates role areas; `lib/helpers/roles.js`'s `isPathAllowedForRole()` checks a remembered "come back here after logging in" location so a stale redirect from another role cannot bounce a fresh login into `/not-allowed`.

## How the frontend layers connect

The folders above are not isolated boxes. For a typical screen, data travels
through them like an order moving from a dining room to a kitchen and back:

1. `router.jsx` chooses a layout and page for the URL. The layout supplies the
   surrounding navigation; the page owns route parameters, loading, empty, and
   error states.
2. The page composes domain pieces from `features/` and reusable visual pieces
   from `components/`. A feature owns behavior that makes sense only for its
   domain, such as applying, completing work, or submitting a rating.
3. A query or mutation calls a thin function in `api/`. `api/client.js` adds the
   bearer token and common JSON headers before Axios sends the request to the
   Laravel backend.
4. TanStack Query stores the response under a resource-specific key. After a
   successful mutation, the affected keys are invalidated or updated so every
   screen reading the same server data catches up.
5. Helpers in `lib/` provide rules shared by several screens: paths, validation
   schemas, file limits, role checks, date formatting, and notification targets.

This separation keeps pages readable and prevents the same network request or
business hint from being reimplemented in several components. It also keeps the
backend as the authority: client validation and route guards improve feedback,
but Laravel still validates and authorizes every protected operation.

## Design-system layer

The visual identity is a **neo-brutalist** look throughout: thick (2px) solid borders, hard offset drop-shadows with no blur (`--shadow-card`, `--shadow-btn`, `--shadow-btn-sm` — all `Npx Npx 0 <color>`, not a soft CSS blur), bold display headings, and a small, saturated brand palette. One decorative accent from an earlier direction survives on exactly one screen: `WashiTape.jsx`'s torn-paper-tape strip appears only on `AuthCard` (the auth-page frame) — it is **not** a general pattern to sprinkle elsewhere, and no second one should be added without a deliberate design decision to do so.

The reusable pieces live in two places — CSS tokens/utilities in `src/index.css`, and primitive components in `src/components/`. New pages should compose these rather than hand-rolling styles, and any new color must come from the `@theme` token block, never a hardcoded hex value in a component.

**Tokens & utilities (`src/index.css`):**

- `--font-serif` (aliased `--heading` in places) — the historically named heading token, currently backed by Space Grotesk rather than a serif face. **Headings, titles, and buttons only** — never body copy or the text inside form controls, which stay on `--font-sans`.
- `--color-primary` (brand green), `--color-highlight`/`-soft`/`-muted`/`-strong` (yellow, used for saved/pending/highlight states), `--color-caution`, `--color-danger`, plus the neutrals (`--color-background`, `--color-surface`, `--color-foreground`, `--color-muted`) and `--border`. No blue or purple exists in the palette.
- `.paper` / `.paper-flat` — the card surface: 2px dark border, grain texture, and the hard offset shadow. `.paper` lifts slightly on hover (for clickable cards); `.paper-flat` doesn't (for forms and static panels like a modal body).
- `.washi-tape` — the shape/opacity/shadow of the one tape accent described above; color and rotation are set by the component using it.

**Primitive components (`src/components/`):**

| Component | Role |
|---|---|
| `PaperCard.jsx` | `.paper`/`.paper-flat` container — the base card used almost everywhere |
| `WashiTape.jsx` | The single sparse tape accent (tone + rotation props), `AuthCard`-only |
| `AuthCard.jsx` | Auth-page frame: `PaperCard` + one `WashiTape` + heading title |
| `Modal.jsx` | Generic dialog: portal-rendered, dimmed backdrop, Escape/backdrop-click to close, focus trapped inside the panel — the shared base for applying, applicant review, proof upload, and rating, so the accessibility behavior is built once |
| `Badge.jsx` | Small pill/chip — the base every status badge (`JobStatusBadge`, `ApplicationStatusBadge`) and the category chip render through |
| `Button.jsx` | Several variants sharing one base style:<ul><li>`primary` — the main call-to-action color</li><li>`secondary` — a lower-emphasis alternative</li><li>`ghost` — outlined, for a de-emphasized action beside a primary one</li><li>`icon` — chromeless, icon-only</li><li>`danger` — destructive actions</li><li>`dark`, `complete` — narrower-purpose variants used only by specific job-status transition actions</li></ul> |
| `Sidebar.jsx` | The role-based left nav (desktop) / collapsed icon rail (tablet) / top tab bar (mobile), shared by every signed-in layout. It also hosts the notification bell and logout action — see the key decisions below for how it decides which link is "active" |
| `TextField.jsx`, `TextAreaField.jsx`, `SelectField.jsx`, `FileInput.jsx`, `TagsInput.jsx` | Labeled form controls wired for React Hook Form, each with its own error-display slot |
| `Pagination.jsx` | Page-number controls driven by a Laravel paginator's `meta` object |
| `RatingSummary.jsx` | Compact star-rating display for live visible-review averages and counts on cards and profiles |
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
| Session (`user`) also cached in `localStorage` | The backend exposes `/user`, but the current client deliberately rehydrates from the login/register response instead of making a startup identity request; logout and `401` handling clear both local session values and cached server data | `context/AuthProvider.jsx`, `api/client.js` |
| **TanStack Query key-factory** convention per resource | Scoped cache invalidation (e.g. accepting an application refreshes applicant, calendar, job, and related list data without throwing away unrelated caches) | One factory per resource, colocated with its `api/*.js` file:<ul><li>`jobKeys`</li><li>`applicationKeys` (includes `.calendar()`)</li><li>`savedJobKeys`</li><li>`profileKeys`</li><li>`ratingKeys`</li><li>`notificationKeys`</li><li>`jobCategoryKeys`</li></ul> |
| Route guards are **UX only** | The backend policies are the real authorization gate; a client guard can't be trusted to protect a mutation | `components/ProtectedRoute.jsx` (guards render), backend policies (enforce) |
| A shared detail page (job detail, another user's profile) is mirrored under each role rather than having one canonical route | A signed-in user should never lose their sidebar just because they clicked into a page also reachable from a public/guest context | `router.jsx`'s per-role route nesting; `lib/helpers/paths.js`'s role-aware path pickers |
| The sidebar's "active" link is the **longest matching non-root path**, remembered across navigation to a page no link directly owns | `/cleaner` (the root) is a structural ancestor of every cleaner route, so naively matching by prefix would highlight Home Feed on every page; a shared page like a job detail view isn't "owned" by any one link, so the sidebar keeps whichever section was last genuinely active instead of guessing | `components/Sidebar.jsx`'s `pickDirectMatch()` plus a small piece of state that only updates when a new *direct* match is found |
| `NavLink`'s `className` prop is always passed as a **function**, never a plain string | React Router runs its own prefix-based active check internally and appends its own `active` class regardless of the custom logic passed in — a string `className` can't suppress that, so more than one link could end up visually active at once | `components/Sidebar.jsx`'s `SidebarLink`/`MobileTab` |
| The client mirrors the backend's schedule-overlap check before submitting an apply, in addition to reacting to the server's rejection | Warning the cleaner up front is a better experience than only finding out after a failed submit — but the warning is non-blocking, since the backend's `409` is the actual enforcement | `lib/helpers/scheduleConflict.js` (mirrors `ApplicationController::conflictsWithAcceptedSchedule` in the backend), consumed by `ApplyModal.jsx` |
| A `409` schedule-conflict apply rejection gets its own UI treatment, not the shared field-error banner used for the `422` rejections | It's a genuinely different kind of failure (a real scheduling clash, not invalid input) and deserves a visually distinct, caution-colored callout rather than reading like every other validation error | `ApplyModal.jsx` branches on `error.response.status === 409` before falling back to the generic `422` handling |
| React's "adjust state during render" pattern for resyncing local optimistic state to a fresh server value | Avoids an extra `useEffect`-triggered re-render just to reconcile "what I set locally" with "what the server actually says" after a background refetch | `SaveJobButton.jsx`'s `is_saved` resync; `Sidebar.jsx`'s active-link state |
| Cleaner and employer completion use separate proof-upload flows | Completing the cleaner's application and completing the employer's post are independent facts; one UI action must not silently complete the other record | `CompleteApplicationModal.jsx`, `CompleteJobPostModal.jsx`, `api/applications.js`, `api/jobs.js` |
| Rating availability comes from API relationship context | A locally remembered flag could incorrectly show the button after reload or to the wrong account; `viewer_has_rated` and the two completion statuses let the backend describe whether this viewer may act | `RateButton.jsx`, `RateModal.jsx`, application/job resources returned by the API |
| Notifications poll every 30 seconds | Application events can be caused by another signed-in user, so local mutation invalidation alone cannot discover them. Polling is a small, predictable synchronization mechanism for this app | `NotificationBell.jsx` with `notificationKeys.list({ unread_only: true })` |
| Opening a notification updates unread state and uses one route mapper | The bell and full page should agree on both read behavior and destination; updating the unread cache immediately keeps the count responsive while a refetch reconciles the full lists | `useNotificationActions.js`, `lib/helpers/notificationTarget.js`, `NotificationItem.jsx` |

## Completion and rating data flow

An accepted application connects one cleaner to one employer's job, but each
party records completion on the record they own:

```text
accepted application
├── cleaner: CompleteApplicationModal → application becomes completed
│   └── RateButton may open RateModal for a cleaner → employer review
└── employer: CompleteJobPostModal → job post becomes completed
    └── RateButton may open RateModal for an employer → cleaner review
```

The branches can finish in either order. `ApplicationCardFooter` exposes the
cleaner's completion action for an accepted application, while
`JobStatusActions` exposes the employer's action after the post is closed. Both
modals submit `FormData` because proof may be an image or PDF. Successful
mutations invalidate the relevant application, calendar, job-list, job-detail,
profile, and rating queries so status badges, completed counts, buttons, and
review summaries do not disagree across screens.

`RateButton` is intentionally small and self-gating. It renders only when the
API response says the viewer's own completion requirement is met and
`viewer_has_rated` is false. `RateModal` collects 1–5 stars and optional review
text, posts through `api/ratings.js`, then refreshes application context and the
reviewed profile's rating queries. `ReviewsSection` owns pagination and displays
the backend's `other_side_completed` context when it is relevant. Profile
headers and cards use `RatingSummary` for the visible-review average and count;
the full review list remains in `ReviewsSection`.

## Notification data flow

The backend writes queued database notifications for application events. The
frontend receives a flattened row with `type`, `message`, relationship ids,
`read_at`, and timestamps; it does not need to know Laravel's internal payload
nesting.

`NotificationBell`, mounted by the signed-in `Sidebar`, requests only unread
rows and repeats that request every 30 seconds. Its dropdown is rendered through
a portal because the responsive sidebar clips its own overflow; without the
portal, a correctly positioned panel could still be cut off. The unread count
comes from the paginator's total, not only the few rows displayed in the panel.

The full `NotificationsPage` uses the same item and action helpers as the bell.
Clicking an unread item marks it read, removes it from the unread cache
immediately, refreshes notification lists, and navigates using
`notificationTargetPath()`. That helper converts application-event types and ids
into the correct cleaner or employer route. “Mark all as read” invalidates the
same key family so the page, dropdown, and badge converge on one result.
