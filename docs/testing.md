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

> **Note:** registering through curl creates real rows in the backend's dev database. Use throwaway addresses (e.g. `qa+<timestamp>@example.com`) and clean them up if needed.
