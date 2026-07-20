# Frontend API Layer

This documents how the React app consumes the CleanHub auth API: the exact JSON it **sends** and **receives**, and where each request is triggered, where the response goes, and how the data is used.

The backend's [`cleanhub-laravel/docs/api.md`](../../cleanhub-laravel/docs/api.md) is the canonical contract and already explains *what* every field and status code means. The JSON blocks below are shown as illustrative samples to see the shapes at a glance. What this doc adds is the **frontend data flow**: request → response → where it lands → how it's used.

Every network call goes through one Axios instance that stamps outgoing requests with the auth token and intercepts unauthorized replies; thin resource functions each wrap one endpoint.

## Base client (`api/client.js`)

A single Axios instance is shared by every resource function — nothing calls `axios` directly, so the interceptors always apply. Its base URL comes from `VITE_API_URL` (e.g. `http://localhost:8000/api/v1`).

**Request interceptor** — reads the token from `localStorage` and attaches it outbound:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
```

**Response interceptor** — on any `401`, clears the token and redirects to `/login` (status-code only; it never reads the body):

```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
```

The `401` body that triggers this looks like:

```json
{ "message": "Unauthenticated." }
```

## Auth functions (`api/auth.js`)

Each function POSTs to one endpoint and returns `response.data`; it does not catch errors — the rejected promise flows to the caller (a TanStack Query mutation).

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `register(payload)` | `POST /auth/register` | `{ name, email, role, password, password_confirmation }` | `{ token, user }` |
| `login(payload)` | `POST /auth/login` | `{ email, password }` | `{ token, user }` |
| `logout()` | `POST /auth/logout` | *(nothing; bearer token)* | `{ message }` |
| `resendVerification()` | `POST /auth/email/verification-notification` | *(nothing; bearer token)* | `{ message }` |
| `forgotPassword(payload)` | `POST /auth/forgot-password` | `{ email }` | `{ message }` |
| `resetPassword(payload)` | `POST /auth/reset-password` | `{ token, email, password, password_confirmation }` | `{ message }` |

### `register(payload)`

Request body sent:

```json
{
  "name": "Jane Cleaner",
  "email": "jane@example.com",
  "role": "cleaner",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Success — `201`:

```json
{
  "token": "3|BC34EgzzZpHyMFYI19UnkYYJPiebpD2FLhcqvRYB8d78a024",
  "user": {
    "id": 3,
    "name": "Jane Cleaner",
    "email": "jane@example.com",
    "role": "cleaner",
    "email_verified_at": null
  }
}
```

Error — `422` (e.g. duplicate email):

```json
{
  "message": "The email has already been taken.",
  "errors": { "email": ["The email has already been taken."] }
}
```

**Flow:** triggered by the `RegisterPage` form submit → `useAuth().register(payload)`. The received `token` and `user` are written to `localStorage` (`access_token`, `auth_user`) and into React state by `AuthProvider.persistSession`, then the user is routed to `/verify-email`. From that moment the stored token is picked up by the request interceptor and rides on every subsequent call. On the `422`, `applyServerErrors` drops each `errors[field][0]` onto the matching form input.

### `login(payload)`

Request body sent:

```json
{ "email": "jane@example.com", "password": "password123" }
```

Success — `200` (same `{ token, user }` shape as register):

```json
{
  "token": "7|q0Xk…plaintext-sanctum-token",
  "user": {
    "id": 3,
    "name": "Jane Cleaner",
    "email": "jane@example.com",
    "role": "cleaner",
    "email_verified_at": null
  }
}
```

Error — `422` (bad credentials — note it lands under `email`, not a `401`):

```json
{
  "message": "These credentials do not match our records.",
  "errors": { "email": ["These credentials do not match our records."] }
}
```

**Flow:** triggered by the `LoginPage` submit → `useAuth().login`. The received session is persisted exactly like register, then `onSuccess` reads `user.role` and redirects via `roleHome(user.role)` (`lib/roles.js`): cleaner → `/cleaner`, employer → `/employer`, moderator/admin → `/admin` — unless the user was bounced here from a protected page, in which case they return to that original location. The bad-credentials `422` is mapped to the Email field, so it reads as an inline error instead of tripping the redirect interceptor.

### `logout()`

Sends no body (identified by the bearer token). Success — `200`:

```json
{ "message": "Logged out." }
```

**Flow:** triggered by `useAuth().logout` → best-effort POST to revoke the token server-side. Regardless of the outcome, `access_token` and `auth_user` are removed from `localStorage` and React state is cleared, returning the app to a logged-out view. (No UI trigger is wired yet — see `testing.md`.)

### `resendVerification()`

Sends no body (uses the bearer token of the logged-in-but-unverified user). Success — `200`:

```json
{ "message": "Verification link sent." }
```

**Flow:** triggered by the "Resend email" button on `VerifyEmailPage` → fires the request and surfaces a "Sent — check your inbox" note on success. Nothing is stored; it's a fire-and-confirm action.

### `forgotPassword(payload)`

Request body sent:

```json
{ "email": "jane@example.com" }
```

Success — `200` (deliberately generic, whether or not the email exists):

```json
{ "message": "We have emailed your password reset link." }
```

**Flow:** triggered by the `ForgotPasswordPage` submit → on success the form is swapped for a neutral "check your inbox" message. The response carries no data the UI keeps; the emailed link is what carries the flow forward (into reset, below).

### `resetPassword(payload)`

Request body sent (`token` and `email` come from the emailed link's query string, `password`/`password_confirmation` from the form):

```json
{
  "token": "a1b2c3d4e5f6...",
  "email": "jane@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

Success — `200`:

```json
{ "message": "Your password has been reset." }
```

Error — `422` (expired/invalid token):

```json
{
  "message": "This password reset token is invalid.",
  "errors": { "email": ["This password reset token is invalid."] }
}
```

**Flow:** the reset email links to `FRONTEND_URL/reset-password?token=<token>&email=<email>`. `ResetPasswordPage` reads both query params (`useSearchParams`), pre-fills email, and merges `token` back into the payload on submit. On success the user is routed to `/login` to sign in with the new password; on `422` the invalid-token message maps to the Email field.

## Error handling

Two paths, by kind of failure:

**`401` — handled globally.** The `api/client.js` response interceptor catches every `401`, clears the token, and redirects to `/login`; no component handles expired sessions itself. Bad *login* credentials are `422` (not `401`), so they never hit this path.

**`422` — handled per form.** Validation failures (`{ message, errors: { field: [msg] } }`) are mapped onto React Hook Form field errors by `lib/formErrors.js`:

```js
export function applyServerErrors(error, setError) {
  const fieldErrors = error?.response?.data?.errors
  if (!fieldErrors || typeof fieldErrors !== 'object') return false
  for (const [field, messages] of Object.entries(fieldErrors)) {
    setError(field, {
      type: 'server',
      message: Array.isArray(messages) ? messages[0] : String(messages),
    })
  }
  return true
}
```

Each form's `onError` maps field errors; if there are none (network/`500`), it falls back to a form-level `root` error:

```jsx
onError: (error) => {
  if (!applyServerErrors(error, setError)) {
    setError('root', { message: 'Something went wrong. Please try again.' })
  }
}
```
