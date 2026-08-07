# Testing & Verification

> **No automated test framework is wired up yet.** There is no Vitest, no React Testing Library, no Playwright in this repo today. This document describes the verification process we actually use right now — static CLI checks, manual browser walkthroughs, and API-level smoke tests with `curl`. When an automated framework is introduced, its setup and conventions will be added here as a new section.

Verification currently has three layers, cheapest first: the CLI checks catch code-level breakage, the browser walkthrough confirms each user flow behaves per the business rules, and the curl smoke test confirms the client's assumptions still match the live backend contract.

## CLI checks

Run both before every commit. They are fast and catch the majority of regressions that would otherwise show up in the browser.

```bash
npm run lint    # eslint . — code style, unused vars, hook rules, fast-refresh boundaries
npm run build   # vite build — full production build; fails on bad imports or broken JSX
```

`lint` must be clean (zero errors). `build` must complete and emit the `dist/` bundle; a successful build means every module resolves and the Tailwind layer compiles. Neither exercises runtime behavior — that's what the next two layers are for.

## Manual browser verification

Start the dev server and open the printed URL (default `http://localhost:5173`):

```bash
npm run dev
```

Open the browser DevTools **Console** before starting — a red error on page load or during a step is a failure even if the screen looks right. Each subsection below lists the steps, what to expect, and which rule the step confirms.

### Register

1. Go to `/register`, fill name + email, pick **Cleaner** or **Employer**, enter matching passwords, submit.
2. **Expect:** redirect to `/verify-email`; you are now logged in (a token is in `localStorage` under `access_token`).
3. **Confirms:** self-registration works and is limited to cleaner/employer (there is no moderator/admin option in the dropdown — those accounts are never self-registered); a successful register returns a session immediately.

Also submit with mismatched passwords → **"Passwords do not match"** under the confirm field, and with the role left unselected → **"Select cleaner or employer"**. Confirms client-side zod validation before any request is sent.

### Login

1. Go to `/login`, enter the credentials you just registered, submit.
2. **Expect:** redirect to the role's area — cleaner → `/cleaner`, employer → `/employer`.
3. **Confirms:** token exchange and the role-based redirect (`lib/roles.js`).

Then enter a wrong password → red **"These credentials do not match our records."** under the Email field. Confirms the `422 → setError` field mapping (bad credentials are a validation error, not a redirect-triggering `401`).

### Logout

> There is no logout button in the UI yet — no nav/header has been built. Logout is available through `useAuth().logout()` and is exercised by the curl smoke test below. To verify in the browser today, call it from a temporary control or clear `localStorage` manually and reload.

1. With a session active, trigger `logout()` (or remove `access_token` from `localStorage`) and reload.
2. **Expect:** protected areas bounce you to `/login` again.
3. **Confirms:** the session is cleared locally and the stored token no longer grants access.

### Forgot & reset password

1. Go to `/forgot-password`, enter an email, submit.
2. **Expect:** a generic **"If an account exists… a reset link is on its way"** message — shown whether or not the email exists.
3. **Confirms:** the reset request works and does not leak account existence.
4. Retrieve the reset link (in dev the email is written to the backend log). Open `/reset-password?token=<token>&email=<email>`, set a new password, submit.
5. **Expect:** redirect to `/login`; the new password works.
6. **Confirms:** the reset page reads both query params from the emailed link and completes the reset.

### Browse, filter, and save jobs

1. As a guest, visit `/jobs`. **Expect:** the open/published feed loads, no save button appears on any card, and the apply button on a job's detail page redirects to `/login` (with a `from` location, so a subsequent login lands back on the job).
2. Log in as a cleaner, revisit the feed (now at `/cleaner`). **Expect:** every card shows a save icon, and any job already applied to is missing from the plain feed — but typing part of its title into search still finds it.
3. Use the category/location/date filters and the sort dropdown. **Expect:** the URL's query string updates with every change (confirms filters are URL state, not just component state — refreshing the page keeps the same results).
4. Click the save icon on a card. **Expect:** it fills in immediately (before any network round trip completes) and the job now appears on `/cleaner/saved-jobs`.
5. **Confirms:** the guest/cleaner feed split, the passive-feed-vs-search exclusion rule, filter state living in the URL, and the optimistic save toggle.

### Post a job and move it through its statuses (employer)

1. Log in as an employer, go to `/employer/jobs/new`, fill the form, leave visibility as the default, submit. **Expect:** redirected to `/employer/jobs`, the new post listed with status `open` but not visible on the public `/jobs` feed (it's still a draft).
2. Edit the post and publish it (toggle visibility to published). **Expect:** it now appears on `/jobs` for a guest.
3. Open the post's detail page as its owner. **Expect:** every content field is now read-only, and only status-transition buttons (e.g. "Review now," "Close applications") appear — matching whatever the post's current status allows next.
4. Click a status transition. **Expect:** the button set changes to reflect the new status, and the change is reflected immediately on `/employer/jobs` too.
5. **Confirms:** the draft/published content-lock split, and that the status-transition buttons never offer a move the backend would reject.

### Apply to a job, including the rejection cases (cleaner)

1. As a cleaner, open a job's detail page and click "Apply." **Expect:** a modal with an optional message (word-counted) and an optional PDF resume field.
2. Submit. **Expect:** the modal closes, the job's card now shows "Applied · pending" wherever it appears, and the application is listed on `/cleaner/applications`.
3. Try to apply to the same job again (e.g. via the API directly, since the UI now hides the apply button for an already-applied job). **Expect:** a red error inside the modal reading roughly "You have already applied to this job."
4. As a cleaner who is already **accepted** into a job on a given date, open a job with an overlapping schedule and click Apply. **Expect:** a caution-colored banner appears in the modal *before* submitting, warning about the overlap, without blocking the Send button.
5. **Confirms:** the apply flow end to end, the duplicate-apply error surfacing inline (not as a silent failure), and the proactive client-side overlap warning.

### Review and decide on applicants (employer)

1. As the employer who posted a job with at least one applicant, open `/employer/jobs/{id}/applicants`. **Expect:** one row per active applicant (a withdrawn applicant is excluded from the list but counted in a small "N withdrawn" note).
2. Click a row to open the profile drawer. **Expect:** the cleaner's resume link (if any), their message, and Accept/Reject buttons, plus a private-note field.
3. Click Accept. **Expect:** the row's status updates to "accepted," and the applicant count on `/employer/jobs` reflects it.
4. Log in as that cleaner and visit `/cleaner/calendar`. **Expect:** the now-accepted job appears as an event on its scheduled date.
5. **Confirms:** the applicant review flow, and that accepting is genuinely the only thing that puts a job on a cleaner's calendar.

### Calendar

1. As a cleaner with at least one accepted job, visit `/cleaner/calendar`. **Expect:** a month view with one event per accepted/completed job, colored differently by status.
2. Click an event. **Expect:** navigation to that job's detail page — not a separate popup — showing the same "Applied · accepted" indicator seen elsewhere for this cleaner.
3. **Confirms:** the calendar reads live accepted/completed data and reuses the existing job detail view rather than a second detail surface.

### Wrong-role / unauthenticated access to a protected route

1. **Logged out**, visit `/cleaner`, `/employer`, `/moderator`, or `/admin`.
2. **Expect:** redirect to `/login`.
3. **Confirms:** `ProtectedRoute` blocks unauthenticated access.
4. **Logged in as a cleaner**, visit `/admin` (or `/employer`).
5. **Expect:** redirect to `/not-allowed`.
6. **Confirms:** role mismatch is rejected. Remember this guard is **UX only** — the backend policies are the real gate; the guard just avoids showing a page the API would refuse anyway.

## API smoke test (curl)

Because the frontend's assumptions about the wire contract are the thing most likely to silently drift, it's worth hitting the running backend directly and confirming the shapes the client parses. `curl` bypasses the browser's CORS layer, so this checks the contract, not the browser integration. Run against a live backend at `http://localhost:8000/api/v1`:

```bash
API=http://localhost:8000/api/v1

# Register → 201, returns { token, user }
curl -s -X POST "$API/auth/register" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"QA","email":"qa+1@example.com","role":"cleaner","password":"password123","password_confirmation":"password123"}'

# Login → 200, returns { token, user }
curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"qa+1@example.com","password":"password123"}'

# Bad login → 422, error under errors.email
curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"qa+1@example.com","password":"wrong"}'

# Logout with the token → 200 { "message": ... }
curl -s -X POST "$API/auth/logout" -H "Accept: application/json" -H "Authorization: Bearer <token>"

# Protected route, no token → 401 { "message": "Unauthenticated." }
curl -s -X POST "$API/auth/logout" -H "Accept: application/json"
```

What each check confirms maps directly onto the client's error handling:

| Check | Confirms |
|---|---|
| register / login return `{ token, user }` | the shape `AuthContext` persists to `localStorage` |
| bad login → `422 errors.email` | the field the `422 → setError` mapper targets |
| no-token → `401 Unauthenticated.` | the status the response interceptor keys off to clear the session |

The same idea extends to the job/application surface — these confirm the shapes
`JobCard`, `ApplyModal`, and `CalendarPage` parse:

```bash
# Categories → 200, bare array of { id, name, slug }
curl -s "$API/cleaning-job-categories" -H "Accept: application/json"

# Browse feed → 200, paginated envelope; a cleaner viewer's rows carry is_saved/has_applied
curl -s "$API/cleaning-job-posts?per_page=50" -H "Accept: application/json" -H "Authorization: Bearer <cleaner-token>"

# Apply → 201, or 422 (closed/duplicate) / 409 (schedule conflict) — the three
# cases ApplyModal's onError branches on
curl -s -X POST "$API/applications" -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer <cleaner-token>" -d '{"cleaning_job_post_id": <id>}'

# Calendar → 200, bare array (no data/meta) — the shape CalendarPage maps into FullCalendar events
curl -s "$API/calendar" -H "Accept: application/json" -H "Authorization: Bearer <cleaner-token>"
```

| Check | Confirms |
|---|---|
| categories → bare array | `getJobCategories()` reads the response directly as the array, no `.data` unwrap |
| browse feed row carries `is_saved`/`has_applied` | `JobCard`'s save-icon and "Applied · status" indicator have what they need without a second request |
| apply → `409` vs `422` | `ApplyModal`'s status-code branch between the caution banner and the shared field error |
| calendar → bare array | `getCalendarEvents()` and `CalendarPage` read the response directly as the array too |

> **Note:** registering through curl creates real rows in the backend's dev database. Use throwaway addresses (e.g. `qa+<timestamp>@example.com`) and clean them up if needed.
