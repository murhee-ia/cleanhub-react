# Frontend API Layer

This documents how the React app consumes the CleanHub API: the exact JSON it
**sends** and **receives**, where each request is triggered, where the response
goes, and how the data is used.

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

**Response interceptor** — on any `401`, clears cached server data and both
stored session values, then redirects to `/login` (status-code only; it never
reads the body):

```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      queryClient.clear()
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
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

**Flow:** triggered by the `LoginPage` submit → `useAuth().login`. The received
session is persisted exactly like register, then `onSuccess` reads `user.role`
and redirects through `roleHome(user.role)` in `lib/helpers/roles.js`. In this
document's scope, cleaner → `/cleaner` and employer → `/employer`. If the user
was bounced from an allowed protected page, they return to that location. The
bad-credentials `422` maps to the Email field instead of tripping the global
`401` interceptor.

### `logout()`

Sends no body (identified by the bearer token). Success — `200`:

```json
{ "message": "Logged out." }
```

**Flow:** triggered by the sidebar's **Log out** action through
`useAuth().logout` → best-effort POST to revoke the token server-side.
Regardless of the outcome, `access_token` and `auth_user` are removed from
`localStorage`, the TanStack Query cache and React session state are cleared,
and the user returns to the public home page.

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

**`422` — handled per form.** Validation failures (`{ message, errors: { field: [msg] } }`) are mapped onto React Hook Form field errors by `lib/helpers/formErrors.js`:

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

## Job categories (`api/jobCategories.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getJobCategories()` | `GET /cleaning-job-categories` | *(nothing)* | `[{ id, name, slug }]` — a bare array, not the paginated envelope |

### `getJobCategories()`

**Flow:** fetched with a 5-minute `staleTime` wherever a category picker appears, then mapped straight into `<option>` elements — `id` is what gets submitted, `name` is what's shown, `slug` is unused on the client today.

```js
// features/jobs/JobPostForm.jsx
const { data: categories = [] } = useQuery({
  queryKey: jobCategoryKeys.list(),
  queryFn: getJobCategories,
  staleTime: 5 * 60 * 1000,
})
```

```jsx
<SelectField id="cleaning_job_category_id" label="Category" {...register('cleaning_job_category_id')}>
  <option value="">Select a category…</option>
  {categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ))}
</SelectField>
```

## Job posts (`api/jobs.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getJobs(params)` | `GET /cleaning-job-posts` | query params (search/category/country/city/schedule_date/status/sort/per_page) | paginated `{ data, links, meta }` |
| `getMyJobs(params)` | `GET /cleaning-job-posts/mine` | query params | paginated envelope, employer's own posts |
| `getEmployerJobs(employerId, params)` | `GET /employers/{id}/cleaning-job-posts` | query params | paginated envelope, one employer's public history |
| `getJob(id)` | `GET /cleaning-job-posts/{id}` | *(nothing)* | one job post |
| `createJob(payload)` | `POST /cleaning-job-posts` | `FormData` (fields + optional `media[]`) | the created post |
| `updateJobStatus(id, status)` | `PATCH /cleaning-job-posts/{id}` | `{ status }` | the updated post |
| `publishJob(id)` | `PATCH /cleaning-job-posts/{id}` | `{ visibility: 'published' }` | the updated post |
| `completeJobPost(id, proofFile)` | `PATCH /cleaning-job-posts/{id}` | `FormData` with `status=completed` + proof | the updated post |

### `getJobs(params)`

**Flow:** `params` is never hand-assembled at the call site — `CleanerJobFeed` reads whatever's currently in the URL's search params and turns *any subset* of `search`/`country`/`city`/`category_id`/`schedule_date`/`sort`/`page` into the `filters` object, so the same one `useQuery` call handles a bare feed, a single filter, or all of them combined:

```js
// features/jobs/CleanerJobFeed.jsx
const FILTER_KEYS = ['search', 'country', 'city', 'category_id', 'schedule_date', 'sort', 'page']

function paramsToFilters(searchParams) {
  const filters = {}
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value) filters[key] = value
  }
  return filters
}

const [searchParams, setSearchParams] = useSearchParams()
const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

const { data, isPending, isError } = useQuery({
  queryKey: jobKeys.list(filters),
  queryFn: () => getJobs(filters),
  placeholderData: keepPreviousData,
})

const jobs = data?.data ?? []
const meta = data?.meta
```

Each filter control calls back into the same `setParam` helper, which adds or removes exactly one key from the URL (and resets `page`) — a category chip, the sort dropdown, and the date picker in `JobFilters` all funnel through it:

```js
function setParam(key, value) {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    return next
  })
}
```

`GuestJobFeed` (rendered instead of `CleanerJobFeed` for a logged-out visitor) calls `getJobs` the same way with a smaller filter set — no `is_saved`/`has_applied` ever come back for a guest, so there's nothing extra to wire up. On the receiving end, a cleaner viewer's rows carry those two flags, which `JobCard` reads directly to decide what to render, with no separate lookup:

```jsx
// features/jobs/JobCard.jsx
{job.has_applied && (
  <ApplicationStatusBadge status={job.application_status} />
)}
...
{(job.status === 'open' || job.is_saved) && (
  <SaveJobButton job={job} className="-mr-1 shrink-0" />
)}
```

### `getMyJobs(params)` / `getEmployerJobs(employerId, params)`

**Flow:** `EmployerJobsSection` picks between the two based on whether the viewer owns the profile being looked at — an employer sees their own drafts and `applications_count` through `getMyJobs`, everyone else always goes through the public `getEmployerJobs`:

```jsx
// features/jobs/EmployerJobsSection.jsx
export default function EmployerJobsSection({ employerId, isOwnProfile = false }) {
  const [page, setPage] = useState(1)
  const params = page > 1 ? { page } : {}
  const { data, isPending, isError } = useQuery({
    queryKey: isOwnProfile ? jobKeys.mineList({ page }) : jobKeys.employerList(employerId, { page }),
    queryFn: () => (isOwnProfile ? getMyJobs(params) : getEmployerJobs(employerId, params)),
    placeholderData: keepPreviousData,
  })
  ...
}
```

### `getJob(id)`

**Flow:** `JobDetailPage` fetches by the route's `:id` param and hands the whole result straight to `JobDetailView` as a prop — the page owns loading/error/404 states, the view owns everything about what to do with a loaded job:

```jsx
// pages/JobDetailPage.jsx
const { id } = useParams()
const { data, isPending, isError, error } = useQuery({
  queryKey: jobKeys.detail(id),
  queryFn: () => getJob(id),
  retry: (count, err) => err?.response?.status !== 404 && count < 2,
})
...
<JobDetailView job={data} />
```

`JobDetailView` then reads `has_applied`/`application_status`/`status` straight off that job to decide which of three CTAs to render — no separate "can I apply?" check, the same object drives all three branches:

```jsx
// features/jobs/JobDetailView.jsx
{isCleaner && job.has_applied && (
  <Button type="button" disabled className="capitalize" style={{ width: '100%', padding: '12px' }}>
    Applied · {job.application_status}
  </Button>
)}
{job.status === 'open' && isCleaner && !job.has_applied && (
  <Button type="button" onClick={() => setApplyOpen(true)} style={{ width: '100%', padding: '12px' }}>
    Apply to this job
  </Button>
)}
```

### `createJob(payload)`

**Flow:** `JobPostForm` builds `payload` as `FormData` field-by-field from the validated form values (always `FormData`, even with no media attached, so the shape is consistent), then submits and maps any `422` straight onto the offending field:

```js
// features/jobs/JobPostForm.jsx
const formData = new FormData()
formData.append('title', values.title)
formData.append('cleaning_job_category_id', values.cleaning_job_category_id)
formData.append('description', values.description)
// ...one appendIf()/append() per field...
Array.from(getValues('media') ?? []).forEach((file) => formData.append('media[]', file))

try {
  await onSubmit(formData)
} catch (error) {
  if (!applyServerErrors(error, setError)) {
    setError('root', { message: 'Could not create the job post. Please try again.' })
  }
}
```

### `updateJobStatus(id, status)`

**Flow:** `JobStatusActions` keeps a small local map of which statuses can follow the post's *current* one — mirroring the backend's forward-only rule client-side — so the buttons on screen never even offer a transition the backend would reject:

```js
// features/jobs/JobStatusActions.jsx
const NEXT_ACTIONS = {
  open: [
    { status: 'reviewing', label: 'Review now', variant: 'secondary' },
    { status: 'closed', label: 'Close applications', variant: 'dark' },
  ],
  reviewing: [{ status: 'closed', label: 'Close applications', variant: 'dark' }],
  closed: [{ status: 'completed', label: 'Mark as completed', variant: 'complete' }],
  completed: [],
}

const { mutate, isPending, error } = useMutation({
  mutationFn: (status) => updateJobStatus(job.id, status),
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
    queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
    queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
  },
})

const actions = NEXT_ACTIONS[job.status] ?? []
```

Ordinary transitions call `updateJobStatus`. The completed transition is kept
out of that JSON-only mutation: it opens `CompleteJobPostModal`, requires a
photo/PDF, and calls `completeJobPost` with multipart data. Publishing a draft
similarly uses the dedicated `publishJob` function.

```jsx
{action.status === 'completed' ? (
  <Button onClick={() => setCompleteModalOpen(true)}>Mark as completed</Button>
) : (
  <Button onClick={() => statusMutation.mutate(action.status)}>{action.label}</Button>
)}

<CompleteJobPostModal job={job} open={completeModalOpen} onClose={closeModal} />
```

`CompleteJobPostModal` invalidates the job detail, employer list, and public
lists after success. Completing the job post does not complete accepted
applications; cleaners have their own proof flow below.

## Profile (`api/profile.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getMyProfile()` | `GET /profile` | *(nothing)* | the caller's own profile (cleaner or employer shape) |
| `updateMyProfile(formData)` | `POST /profile` (with `_method=PATCH`) | `FormData` | the updated profile |
| `getCleanerProfile(id)` | `GET /cleaners/{id}` | *(nothing)* | a cleaner's public profile (no `email`) |
| `getEmployerProfile(id)` | `GET /employers/{id}` | *(nothing)* | an employer's public profile (no `email`) |

### `getMyProfile()` / `updateMyProfile(formData)`

**Flow:** `OwnProfilePage` is both views of the same query — the fetched profile is rendered read-only (`view="profile"`) or handed to the edit form as its initial values (`view="edit"`). On a successful edit, the mutation's result is written straight into the query cache rather than triggering a refetch:

```jsx
// pages/OwnProfilePage.jsx
const { data, isPending, isError } = useQuery({
  queryKey: profileKeys.me(),
  queryFn: getMyProfile,
})
const mutation = useMutation({
  mutationFn: updateMyProfile,
  onSuccess: (updated) => queryClient.setQueryData(profileKeys.me(), updated),
})
...
<Form initialData={data} onSubmit={(formData) => mutation.mutateAsync(formData)} />
```

`updateMyProfile` always receives `FormData` — a profile can carry a photo and PDF documents alongside plain text, and PHP can't parse a multipart body on a true `PATCH`, hence the `POST` with a spoofed `_method` inside `api/profile.js` itself.

### `getCleanerProfile(id)` / `getEmployerProfile(id)`

**Flow:** `ProfileViewPage` picks the fetch function and the display component by `role`, so one component handles both `/cleaners/:id` and `/employers/:id` (and their sidebar-preserving mirrors) without duplicating the loading/error scaffolding:

```jsx
// pages/ProfileViewPage.jsx
const CONFIG = {
  cleaner: { key: profileKeys.cleaner, fetch: getCleanerProfile, View: CleanerProfileView, ... },
  employer: { key: profileKeys.employer, fetch: getEmployerProfile, View: EmployerProfileView, ... },
}

const { key, fetch, View } = CONFIG[role]
const { data, isPending, isError, error } = useQuery({
  queryKey: key(id),
  queryFn: () => fetch(id),
  retry: (count, err) => err?.response?.status !== 404 && count < 2,
})
```

## Saved jobs (`api/savedJobs.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getSavedJobs(params)` | `GET /saved-jobs` | query params | paginated `{ data, links, meta }`, rows are `{ id, saved_at, job }` |
| `saveJob(cleaningJobPostId)` | `POST /saved-jobs` | `{ cleaning_job_post_id }` | the created saved-row |
| `unsaveJob(cleaningJobPostId)` | `DELETE /saved-jobs/{jobId}` | *(nothing; job id is the route param)* | *(nothing)* |

### `getSavedJobs(params)`

**Flow:** `SavedJobsPage` fetches with just the current page (there's no filtering on this list), unwraps each row down to its embedded `job`, and — since a saved job that has since closed still comes back with its live `status` (the endpoint never filters closed jobs out) — pairs any non-open one with a notice, straight off that same field, no second check:

```jsx
// pages/SavedJobsPage.jsx
const CLOSED_NOTICE = 'This job is no longer open, so you cannot apply to it.'

const [searchParams] = useSearchParams()
const page = searchParams.get('page')
const filters = page ? { page } : {}

const { data, isPending, isError } = useQuery({
  queryKey: savedJobKeys.list(filters),
  queryFn: () => getSavedJobs(filters),
  placeholderData: keepPreviousData,
})

const jobs = (data?.data ?? []).map((row) => row.job)
...
renderCard={(job) => (
  <JobCard key={job.id} job={job} notice={job.status !== 'open' ? CLOSED_NOTICE : undefined} />
)}
```

### `saveJob(cleaningJobPostId)` / `unsaveJob(cleaningJobPostId)`

**Flow:** `SaveJobButton` drives an **optimistic** toggle — local state flips immediately on click, before the request resolves, and reverts only if the failure means something actually went wrong (a `422`/`404` here means "already saved"/"already unsaved," i.e. the click already reflected reality, so nothing is undone):

```jsx
// features/jobs/SaveJobButton.jsx
const [saved, setSaved] = useState(Boolean(job.is_saved))

const { mutate, isPending } = useMutation({
  mutationFn: (next) => (next ? saveJob(job.id) : unsaveJob(job.id)),
  onError: (error, next) => {
    const status = error?.response?.status
    if (status !== 422 && status !== 404) setSaved(!next)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: savedJobKeys.lists() })
    queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
  },
})

function handleClick() {
  const next = !saved
  setSaved(next)
  mutate(next)
}
```

## Applications & calendar (`api/applications.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getMyApplications(params)` | `GET /applications` | query params (`status`, `per_page`) | paginated envelope, each row embeds the full `job` |
| `applyToJob({ cleaningJobPostId, message, resume })` | `POST /applications` | plain JSON, or `FormData` when a resume is attached | the created application |
| `withdrawApplication(id)` | `DELETE /applications/{id}` | *(nothing)* | `{ message }` |
| `getJobApplicants(jobPostId, params)` | `GET /cleaning-job-posts/{jobId}/applications` | query params | paginated envelope, each row embeds a `cleaner` summary + `private_note` |
| `getApplicationDetail(id)` | `GET /applications/{id}/detail` | *(nothing)* | one application |
| `acceptApplication(id, message)` | `PATCH /applications/{id}/accept` | `{ message }` | the updated application |
| `rejectApplication(id, message)` | `PATCH /applications/{id}/reject` | `{ message }` | the updated application |
| `updateApplicationNote(id, note)` | `PATCH /applications/{id}/note` | `{ note }` | the updated application |
| `completeApplication(id, proofFile)` | `POST /applications/{id}/complete` | `FormData` with `proof` | the completed application |
| `getCalendarEvents()` | `GET /calendar` | *(nothing)* | a bare array of accepted/completed applications, not the paginated envelope |

### `getMyApplications(params)`

**Flow:** same URL-derived-filters shape as `getJobs`, just a smaller key set (`status`, `page`) — `ApplicationStatusTabs` writes `status` into the URL, and an unrecognized value is dropped rather than sent (a bad status would just `422` the request):

```js
// pages/MyApplicationsPage.jsx
function paramsToFilters(searchParams) {
  const filters = {}
  for (const key of ['status', 'page']) {
    const value = searchParams.get(key)
    if (value) filters[key] = value
  }
  if (filters.status && !APPLICATION_STATUSES.includes(filters.status)) delete filters.status
  return filters
}

const [searchParams] = useSearchParams()
const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

const { data, isPending, isError } = useQuery({
  queryKey: applicationKeys.list(filters),
  queryFn: () => getMyApplications(filters),
  placeholderData: keepPreviousData,
})
```

The response is then turned into a lookup from job id → application, so each `JobCard` can be given its matching application as a footer without `JobCard` itself needing to know applications exist:

```jsx
const applications = data?.data ?? []
const jobs = applications.map((application) => application.job)
const byJobId = new Map(applications.map((application) => [application.job.id, application]))
...
renderCard={(job) => (
  <JobCard key={job.id} job={job} footer={<ApplicationCardFooter application={byJobId.get(job.id)} />} />
)}
```

### `applyToJob({ cleaningJobPostId, message, resume })`

**Flow:** `ApplyModal` checks for a schedule conflict client-side *before* submitting (a non-blocking warning — see `lib/helpers/scheduleConflict.js`), then on failure branches on the HTTP status to decide which of two different UI treatments a rejection gets:

```jsx
// features/applications/ApplyModal.jsx
const acceptedConflict = open
  ? findAcceptedScheduleConflict(job, calendarApplications ?? [])
  : null

const mutation = useMutation({
  mutationFn: (values) => applyToJob({ cleaningJobPostId: job.id, message: values.message, resume: values.resume?.[0] }),
  onError: (error) => {
    const fieldErrors = error?.response?.data?.errors
    const jobError = fieldErrors?.cleaning_job_post_id
    if (error?.response?.status === 409 && jobError) {
      setScheduleConflictMessage(Array.isArray(jobError) ? jobError[0] : String(jobError))
      return
    }
    if (jobError) {
      setError('root', { message: Array.isArray(jobError) ? jobError[0] : String(jobError) })
      return
    }
    if (!applyServerErrors(error, setError)) {
      setError('root', { message: 'Could not send your application. Please try again.' })
    }
  },
})
```

The two `422`s (closed job, duplicate) fall into the shared `errors.root` branch and render as one plain-danger message; the `409` sets `scheduleConflictMessage` instead, rendered in its own caution-colored banner.

### `withdrawApplication(id)`

**Flow:** `WithdrawButton` mirrors `SaveJobButton`'s optimistic pattern — flip local state immediately, only revert on a failure that isn't the expected "already moved on" case:

```jsx
// features/applications/WithdrawButton.jsx
const [withdrawn, setWithdrawn] = useState(false)

const { mutate, isPending } = useMutation({
  mutationFn: () => withdrawApplication(application.id),
  onError: (error) => {
    if (error?.response?.status !== 403) setWithdrawn(false)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
    queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
  },
})

function handleClick() {
  setWithdrawn(true)
  mutate()
}
```

### `getJobApplicants(jobPostId, params)` / `getApplicationDetail(id)`

**Flow:** `JobApplicantsPage` fetches by the job's route `:id`, with only `page` as a filter (there's no status/search filtering on this list — an employer works through everyone who applied):

```jsx
// pages/JobApplicantsPage.jsx
const { id } = useParams()
const [searchParams] = useSearchParams()
const page = searchParams.get('page')
const filters = page ? { page } : {}

const { data, isPending, isError } = useQuery({
  queryKey: applicationKeys.byJobList(id, filters),
  queryFn: () => getJobApplicants(id, filters),
  placeholderData: keepPreviousData,
})
```

It lists rows via `ApplicantRow`; clicking one just sets which application id is "open," and `ApplicantDrawer` fetches that single application's own detail itself — the list and the drawer never share a data-fetching component:

```jsx
const [openApplicationId, setOpenApplicationId] = useState(null)
...
<ApplicantRow key={application.id} application={application} onReview={() => setOpenApplicationId(application.id)} />
...
<ApplicantDrawer applicationId={openApplicationId} jobPostId={id} onClose={() => setOpenApplicationId(null)} />
```

```jsx
// features/applications/ApplicantDrawer.jsx
const detailQuery = useQuery({
  queryKey: applicationKeys.detail(applicationId),
  queryFn: () => getApplicationDetail(applicationId),
  enabled: open, // only fetches once a row has actually been clicked
})
```

### `acceptApplication(id, message)` / `rejectApplication(id, message)`

**Flow:** both the applicant row's quick actions and the drawer's buttons call the same shared hook, so an accept/reject from either place invalidates identical caches — including the calendar, since accepting is the one thing that puts a job on it:

```js
// features/applications/useApplicationDecision.js
export function useApplicationDecision(applicationId, jobPostId) {
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(jobPostId) })
    queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
    queryClient.invalidateQueries({ queryKey: applicationKeys.calendar() })
    queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobPostId) })
  }

  const accept = useMutation({ mutationFn: (message) => acceptApplication(applicationId, message), onSettled: invalidate })
  const reject = useMutation({ mutationFn: (message) => rejectApplication(applicationId, message), onSettled: invalidate })
  ...
}
```

```jsx
// features/applications/ApplicantActions.jsx
const { accept, reject, isDeciding, decisionError } = useApplicationDecision(application.id, jobPostId)
if (application.status !== 'pending') return null
...
<Button type="button" onClick={() => accept(message)} disabled={isDeciding}>Accept</Button>
<Button variant="danger" type="button" onClick={() => reject(message)} disabled={isDeciding}>Reject</Button>
```

### `updateApplicationNote(id, note)`

**Flow:** the note form inside `ApplicantDrawer` is seeded from the fetched application whenever a different one is opened, and always sends the current field value — including an empty string turned into `null` — so clearing a saved note is just submitting the form empty:

```jsx
// features/applications/ApplicantDrawer.jsx
useEffect(() => {
  reset({ note: application?.private_note ?? '' })
}, [application?.id, application?.private_note, reset])

const noteMutation = useMutation({
  mutationFn: (values) => updateApplicationNote(applicationId, values.note || null),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
    queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(jobPostId) })
  },
})
```

The form's own submit is what actually fires it — React Hook Form's `values` is exactly the `{ note }` shape the mutation expects, so nothing is reshaped in between:

```jsx
<form onSubmit={handleSubmit((values) => noteMutation.mutate(values))} noValidate>
  <TextAreaField id="applicant-note" error={errors.note?.message} {...register('note')} />
</form>
```

### `completeApplication(id, proofFile)`

**Flow:** `CompleteApplicationButton` appears only while the cleaner's
application is `accepted`. It opens a dedicated proof modal; the submit action
posts one image/PDF as `proof`, then invalidates the cleaner's application
lists, calendar, and public profile cache.

```js
export async function completeApplication(id, proofFile) {
  const payload = new FormData()
  payload.append('proof', proofFile)
  const { data } = await api.post(`/applications/${id}/complete`, payload)
  return data
}
```

On success, `application.status` becomes `completed`,
`completion_proof_url` is populated, and the cleaner's rating button unlocks.
`application.job_completed` remains a separate indicator of the employer's
job-post completion. The two sides can complete in either order.

The modal accepts JPG/JPEG, PNG, WEBP, GIF, or PDF and displays the backend's
`errors.proof` message when server validation rejects the file.

### `getCalendarEvents()`

**Flow:** `CalendarPage` takes no filters at all — the whole point of this endpoint is that it always returns everything relevant in one shot — and maps the raw array straight into FullCalendar's event shape:

```jsx
// pages/CalendarPage.jsx
const { data, isPending, isError } = useQuery({
  queryKey: applicationKeys.calendar(),
  queryFn: getCalendarEvents,
})

const events = (data ?? []).map(toCalendarEvent)
...
<CleanerCalendar events={events} />
```

`toCalendarEvent` is the one small pure function that decides color, all-day-ness, and what an event click should carry:

```js
// features/calendar/toCalendarEvent.js
export function toCalendarEvent(application) {
  const job = application.job
  const hasTimes = Boolean(job.start_time && job.end_time)
  const colors = STATUS_COLORS[application.status] ?? STATUS_COLORS.accepted

  return {
    id: String(application.id),
    title: job.title,
    start: hasTimes ? `${job.schedule_date}T${job.start_time}` : job.schedule_date,
    end: hasTimes ? `${job.schedule_date}T${job.end_time}` : job.schedule_date,
    allDay: !hasTimes,
    backgroundColor: colors.background,
    extendedProps: { jobId: job.id, employer: job.employer.name, status: application.status },
  }
}
```

```jsx
// features/calendar/CleanerCalendar.jsx
<FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={events}
  eventClick={(info) => navigate(jobDetailPath(info.event.extendedProps.jobId, ROLES.CLEANER))}
/>
```

Clicking an event navigates to that job's existing detail page rather than opening a second, separate "event detail" surface. The same query also powers `ApplyModal`'s proactive overlap warning described above — both reads share the one `applicationKeys.calendar()` cache entry.

## Ratings (`api/ratings.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getCleanerRatings(id, params)` | `GET /cleaners/{id}/ratings` | pagination params | visible reviews in `{ data, links, meta }` |
| `getEmployerRatings(id, params)` | `GET /employers/{id}/ratings` | pagination params | visible reviews in `{ data, links, meta }` |
| `submitRating({ applicationId, stars, text })` | `POST /ratings` | `{ application_id, stars, text }` | created rating |

`ratingKeys` normalizes profile ids and keeps cleaner/employer review lists
separate:

```js
export const ratingKeys = {
  all: ['ratings'],
  lists: () => [...ratingKeys.all, 'list'],
  cleanerList: (id, filters) => [...ratingKeys.lists(), 'cleaner', String(id), filters],
  employerList: (id, filters) => [...ratingKeys.lists(), 'employer', String(id), filters],
}
```

### `submitRating({ applicationId, stars, text })`

**Flow:** `RateButton` is driven by the application resource rather than by a
separate permission request:

- cleaner: appears when `application.status === 'completed'`;
- employer: appears when `viewer_has_rated` is present, which means the job
  post is completed for that viewer;
- either role: disappears when `viewer_has_rated === true`.

`RateModal` uses React Hook Form + Zod for an integer 1–5 star selection and
optional review text up to 2000 characters. The API derives the reviewee; the
client only sends the application id.

```json
{
  "application_id": 5,
  "stars": 5,
  "text": "Clear instructions and professional communication."
}
```

After success the modal invalidates application lists/calendar, the affected
job's applicant cache, all rating lists, and the reviewee's profile cache. That
refreshes `viewer_has_rated`, the profile aggregate, and the review list without
maintaining a second local source of truth.

### Profile review lists

`ReviewsSection` selects `getCleanerRatings` or `getEmployerRatings` from its
`role` prop, displays the rating's job context and
`other_side_completed` indicator, and drives `Pagination` from the standard
metadata. `CleanerProfileView` and `EmployerProfileView` use the live
`rating_average`/`rating_count` returned by their profile resource.

## Notifications (`api/notifications.js`)

| Function | Method + endpoint | Sends | Receives |
|---|---|---|---|
| `getNotifications(params)` | `GET /notifications` | `page`, `per_page`, optional `unread_only` normalized to `1`/`0` | `{ data, links, meta }` |
| `markNotificationRead(id)` | `PATCH /notifications/{id}/read` | nothing | updated notification |
| `markAllNotificationsRead()` | `PATCH /notifications/read-all` | nothing | `{ message }` |

```js
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), filters],
}
```

### Notification row

The backend flattens event data, so the client reads one object directly:

```json
{
  "id": "2f0e87a1-7b93-4f55-9f25-a8e49cc80df0",
  "type": "application_accepted",
  "message": "Your application for \"Hotel Housekeeping Team\" was accepted.",
  "application_id": 5,
  "cleaning_job_post_id": 8,
  "read_at": null,
  "created_at": "2026-08-14T08:00:00.000000Z"
}
```

`notificationTargetPath` maps accepted/rejected/reminder events to the current
cleaner's sidebar-preserving job detail route, and new-applicant/withdrawal
events to the employer's applicant list.

### Bell and full page

`NotificationBell` queries `{ unread_only: true }` every 30 seconds. It uses
`meta.total` for the badge (display-capped at `9+`) and renders unread rows in a
body portal so the sidebar cannot clip the dropdown. The full
`NotificationsPage` uses the same row component with ordinary pagination.

Clicking a row marks it read when necessary and navigates immediately to its
target. The unread cache is reduced optimistically after the mark-one response,
then all notification-list queries are invalidated. Mark-all invalidates the
same key family so the bell and page converge on the server state.
