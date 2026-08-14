# Testing & Verification

> **No automated test framework is wired up yet.** There is no Vitest, no React Testing Library, no Playwright in this repo today. This document describes the verification process we actually use right now — static CLI checks, manual browser walkthroughs, and API-level smoke tests with `curl`. When an automated framework is introduced, its setup and conventions will be added here as a new section.

Verification currently has three layers, cheapest first: the CLI checks catch code-level breakage, the browser walkthrough confirms each user flow behaves per the business rules, and the curl smoke test confirms the client's assumptions still match the live backend contract.

## CLI checks

Run both before every commit. They are fast and catch the majority of regressions that would otherwise show up in the browser.

```bash
npm run lint    # eslint . — code style, unused vars, hook rules, fast-refresh boundaries
npm run build   # vite build — full production build; fails on bad imports or broken JSX
```

`lint` must be clean (zero errors). `build` must complete and emit the `dist/`
bundle; a successful build means every module resolves and the Tailwind layer
compiles. Vite may print an advisory about a large generated chunk; record it
for a later code-splitting improvement, but do not confuse that warning with a
failed build. Neither command exercises runtime behavior — that is what the
next two layers are for.

## Manual browser verification

The browser walkthrough needs both applications, and notification delivery also
needs the Laravel queue worker. Start each long-running command in its own
terminal:

```bash
# cleanhub-laravel
php artisan serve
```

```bash
# cleanhub-laravel — required for queued email/database notifications
php artisan queue:work
```

```bash
# cleanhub-react
npm run dev
```

Open the frontend URL printed by Vite (default `http://localhost:5173`) and make
sure `VITE_API_URL` points at the backend API (normally
`http://localhost:8000/api/v1`). Most end-to-end checks are easier with one
cleaner account and one employer account in separate browser profiles or in a
normal/private-window pair; this prevents one login from replacing the other in
`localStorage`.

Open the browser DevTools **Console** before starting — a red error on page load or during a step is a failure even if the screen looks right. Each subsection below lists the steps, what to expect, and which rule the step confirms.

### Register

1. Go to `/register`, fill name + email, pick **Cleaner** or **Employer**, enter matching passwords, submit.
2. **Expect:** redirect to `/verify-email`; you are now logged in (a token is in `localStorage` under `access_token`).
3. **Confirms:** self-registration is limited to cleaner/employer and a successful register returns a session immediately.

Also submit with mismatched passwords → **"Passwords do not match"** under the confirm field, and with the role left unselected → **"Select cleaner or employer"**. Confirms client-side zod validation before any request is sent.

### Login

1. Go to `/login`, enter the credentials you just registered, submit.
2. **Expect:** redirect to the role's area — cleaner → `/cleaner`, employer → `/employer`.
3. **Confirms:** token exchange and the role-based redirect (`lib/helpers/roles.js`).

Then enter a wrong password → red **"These credentials do not match our records."** under the Email field. Confirms the `422 → setError` field mapping (bad credentials are a validation error, not a redirect-triggering `401`).

### Logout

1. With a session active, click **Log out** at the bottom of the role sidebar.
2. **Expect:** navigation to `/`; `access_token` and `auth_user` are gone from
   `localStorage`.
3. Press Back or enter the previous protected URL directly. **Expect:** redirect
   to `/login` instead of redisplaying cached account data.
4. **Confirms:** server-side token revocation is attempted, local identity and
   TanStack Query data are cleared, and protected routing no longer treats the
   browser as signed in.

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
2. Open that draft's detail page and click **Publish job**. **Expect:** it now appears on `/jobs` for a guest.
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

### Complete work independently

Use an accepted application from the applicant walkthrough. The two completion
buttons intentionally update different backend records, so verify both orders
at least once.

1. As the cleaner, open `/cleaner/applications` and find the accepted job. Click
   **Mark job as complete**.
2. Submit the modal without a file. **Expect:** submission remains blocked and
   the proof requirement is clear. Then attach a JPG, JPEG, PNG, WEBP, GIF, or
   PDF no larger than 10 MB and submit.
3. **Expect:** the application changes to `completed`, remains on the calendar,
   **Rate this job** appears, and an “Awaiting employer's completion mark” note
   appears if the employer has not completed the post.
4. As the employer, move the published post forward to `closed`, click **Mark as
   completed**, and exercise the same missing-file and valid-file checks.
5. **Expect:** the post becomes `completed` and the accepted application does
   not change status as a side effect. The employer's rating action becomes
   available for each accepted cleaner.
6. Repeat with another accepted relationship, completing the employer record
   first. **Expect:** each party can finish and unlock their own rating action
   without waiting for the other party.
7. **Confirms:** proof validation, independent completion ownership, terminal
   completed states, and cache refreshes across job, application, calendar, and
   profile views.

### Ratings and reviews

1. After the cleaner has completed their application, click **Rate this job**,
   choose 1–5 stars, optionally enter review text, and submit.
2. **Expect:** the modal closes, the button disappears, and refreshing the page
   does not bring the button back. Open the employer's profile and confirm its
   visible-review average, count, and review list include the new rating.
3. After the employer has completed the job post, rate an accepted cleaner from
   the applicant context. **Expect:** the cleaner profile updates in the same
   way. The cleaner's earlier/later completion does not control whether the
   employer can submit this rating.
4. Try submitting without selecting a star. **Expect:** **Pick a star rating**
   and no request. Try more than 2,000 review characters. **Expect:** the length
   validation message and no successful submission.
5. Check a review created while only the reviewer had completed their record.
   **Expect:** the review list can explain that the other party has not yet
   completed their side; once the other record is completed and data refetches,
   that context is updated.
6. **Confirms:** one rating per reviewer/relationship, role-derived reviewees,
   independent rating unlocks, persistent `viewer_has_rated`, and visible-only
   profile summaries.

### Notifications

Keep the queue worker running and use the cleaner/employer browser pair.

1. Apply to a published job as the cleaner. **Expect:** within the next poll
   (up to about 30 seconds), the employer's bell shows a new unread count and
   the dropdown contains the new-applicant message.
2. Accept or reject an application as the employer. **Expect:** the cleaner
   receives the corresponding notification. On a separate pending application,
   withdraw as the cleaner. **Expect:** its employer receives a withdrawal
   notification.
3. Open the bell on desktop, tablet, and mobile widths. **Expect:** the dropdown
   is visible above surrounding content rather than clipped by the sidebar, and
   **View all notifications** opens the role's `/notifications` page.
4. Click an unread notification. **Expect:** it becomes read, the unread count
   drops immediately, and navigation goes to the related job, application, or
   applicant page for the current role. Use **Mark all read** and confirm the
   page, dropdown, and badge agree after refresh.
5. For an accepted job scheduled tomorrow, run the reminder command twice from
   the backend:

   ```bash
   php artisan app:send-job-reminders
   php artisan app:send-job-reminders
   ```

   **Expect:** the first run may report one sent reminder for that application;
   the second reports none for it, and only one reminder row appears for the
   cleaner.
6. Stop the queue worker, trigger an application event, and confirm the sender's
   request still completes but the recipient sees nothing yet. Restart the
   worker. **Expect:** the queued notification is delivered. This distinguishes
   a delivery-process problem from a frontend polling problem.
7. **Confirms:** cross-user polling, queued delivery, unread/read actions,
   role-aware navigation, responsive portal positioning, and reminder
   idempotency.

### Responsive and refresh checks

For at least the job feed, one form, a modal, the applications list, and the
notifications page, inspect mobile, tablet, and desktop widths. Confirm there
is no horizontal page overflow, the sidebar changes to its intended compact
forms, dialogs remain reachable by keyboard, and buttons do not cover content.
Refresh each role-prefixed detail URL directly to confirm the router restores
the same layout instead of relying on navigation history.

### Wrong-role / unauthenticated access to a protected route

1. **Logged out**, visit `/cleaner` or `/employer`.
2. **Expect:** redirect to `/login`.
3. **Confirms:** `ProtectedRoute` blocks unauthenticated access.
4. **Logged in as a cleaner**, visit `/employer`; then log in as an employer and visit `/cleaner`.
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

# Cleaner completion → 200 application; proof is required multipart data
curl -s -X POST "$API/applications/<application-id>/complete" -H "Accept: application/json" \
  -H "Authorization: Bearer <cleaner-token>" -F "proof=@/absolute/path/to/proof.jpg"

# Employer completion → 200 job post; this does not rewrite application statuses
curl -s -X PATCH "$API/cleaning-job-posts/<job-id>" -H "Accept: application/json" \
  -H "Authorization: Bearer <employer-token>" -F "status=completed" \
  -F "completion_proof=@/absolute/path/to/proof.jpg"
```

| Check | Confirms |
|---|---|
| categories → bare array | `getJobCategories()` reads the response directly as the array, no `.data` unwrap |
| browse feed row carries `is_saved`/`has_applied` | `JobCard`'s save-icon and "Applied · status" indicator have what they need without a second request |
| apply → `409` vs `422` | `ApplyModal`'s status-code branch between the caution banner and the shared field error |
| calendar → bare array | `getCalendarEvents()` and `CalendarPage` read the response directly as the array too |
| cleaner completion returns a completed application | `CompleteApplicationModal` can refresh the applications/calendar UI without changing the job post |
| employer completion returns a completed job | `CompleteJobPostModal` can refresh job views without assuming accepted applications also completed |

Ratings and notifications add two more resource shapes used across several
screens:

```bash
# Submit a rating → 201 rating; backend derives the other party from the application
curl -s -X POST "$API/ratings" -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer <cleaner-or-employer-token>" \
  -d '{"application_id": <application-id>, "stars": 5, "text": "Clear communication and good work."}'

# Profile reviews → 200 paginated envelope; only visible ratings are listed
curl -s "$API/cleaners/<cleaner-id>/ratings?per_page=50" -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
curl -s "$API/employers/<employer-id>/ratings?per_page=50" -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"

# Notification bell feed → 200 paginated envelope filtered to unread rows
curl -s "$API/notifications?unread_only=1&per_page=50" -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"

# Read one → 200 updated notification; read all → 200 message
curl -s -X PATCH "$API/notifications/<notification-id>/read" -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
curl -s -X PATCH "$API/notifications/read-all" -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

| Check | Confirms |
|---|---|
| rating submit returns reviewer, reviewee, job, and relationship context | `RateModal` can close and the profile/review queries have stable identifiers to refresh |
| profile ratings use `{ data, links, meta }` | `ReviewsSection` can paginate while `RatingSummary` reads aggregate fields from profile resources |
| unread notification list reports `meta.total` | the bell badge counts all unread rows, not only those visible in its dropdown |
| notification row carries type and relationship ids | `notificationTargetPath()` can send cleaner and employer viewers to the relevant screen |
| read-one/read-all succeed | the bell and full page can converge after optimistic removal and query invalidation |

> **Note:** registering through curl creates real rows in the backend's dev database. Use throwaway addresses (e.g. `qa+<timestamp>@example.com`) and clean them up if needed.
