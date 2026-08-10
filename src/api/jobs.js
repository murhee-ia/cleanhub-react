import api from './client'

// Ids reach these keys both as route params (strings) and as payload fields
// (numbers), so they're normalised — otherwise `detail(1)` and `detail('1')`
// would be two separate cache entries and invalidation would miss one.
export const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), filters],
  mine: () => [...jobKeys.all, 'mine'],
  mineList: (filters) => [...jobKeys.mine(), filters],
  employer: (employerId) => [...jobKeys.all, 'employer', String(employerId)],
  employerList: (employerId, filters) => [...jobKeys.employer(employerId), filters],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), String(id)],
}

// Public browse — published + open posts. Returns the paginated envelope
// { data, links, meta }. `params` are the search/filter/sort query params.
export async function getJobs(params) {
  const { data } = await api.get('/cleaning-job-posts', { params })
  return data
}

// Employer's own posts (every visibility/status), same paginated envelope.
export async function getMyJobs(params) {
  const { data } = await api.get('/cleaning-job-posts/mine', { params })
  return data
}

// An employer's public job history (published, non-removed), auth-only.
// `employerId` is the employer's user id. Same paginated envelope, newest-first.
export async function getEmployerJobs(employerId, params) {
  const { data } = await api.get(`/employers/${employerId}/cleaning-job-posts`, { params })
  return data
}

// Single job post. Guest-accessible for published + non-removed posts; the
// owning employer additionally sees their own post in any visibility/status.
export async function getJob(id) {
  const { data } = await api.get(`/cleaning-job-posts/${id}`)
  return data
}

// Create a post (employer-only). Pass FormData when sending media.
export async function createJob(payload) {
  const { data } = await api.post('/cleaning-job-posts', payload)
  return data
}

// Advance a published post's status (employer-only). The backend enforces the
// forward-only flow open → reviewing → closed → completed and rejects anything
// backward, `removed`, or a still-unpublished draft with a 422. Returns the
// updated job.
export async function updateJobStatus(id, status) {
  const { data } = await api.patch(`/cleaning-job-posts/${id}`, { status })
  return data
}

// Publish a draft post (employer-only). Patches `visibility` from `draft` to
// `published`, making the post visible to cleaners and guests. 
// Returns the updated job.
export async function publishJob(id) {
  const { data } = await api.patch(`/cleaning-job-posts/${id}`, { visibility: 'published' })
  return data
}

// Mark a job post as completed with a required proof file (photo or PDF).
// The backend validates the file before accepting the status transition.
// Uses multipart/form-data because of the file upload.
export async function completeJobPost(id, proofFile) {
  const payload = new FormData()
  payload.append('status', 'completed')
  payload.append('completion_proof', proofFile)
  const { data } = await api.patch(`/cleaning-job-posts/${id}`, payload)
  return data
}
