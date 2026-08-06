import api from './client'

export const applicationKeys = {
  all: ['applications'],
  lists: () => [...applicationKeys.all, 'list'],
  list: (filters) => [...applicationKeys.lists(), filters],
  // Ids arrive both as route params (strings) and payload fields (numbers), so
  // they're normalised — see the same note on jobKeys.
  byJob: (jobId) => [...applicationKeys.all, 'by-job', String(jobId)],
  byJobList: (jobId, filters) => [...applicationKeys.byJob(jobId), filters],
  details: () => [...applicationKeys.all, 'detail'],
  detail: (id) => [...applicationKeys.details(), String(id)],
}

// Cleaner's own applications (newest first). Returns the paginated envelope
// { data, links, meta } where each row embeds the full `job` it targets.
// `params.status` narrows to one of the five status tabs.
export async function getMyApplications(params) {
  const { data } = await api.get('/applications', { params })
  return data
}

// Apply to an open, published job. The resume is optional, so the payload is
// only multipart when a file is actually attached — a plain JSON body otherwise.
export async function applyToJob({ cleaningJobPostId, message, resume }) {
  let payload
  if (resume) {
    payload = new FormData()
    payload.append('cleaning_job_post_id', cleaningJobPostId)
    if (message) payload.append('message', message)
    payload.append('resume', resume)
  } else {
    payload = { cleaning_job_post_id: cleaningJobPostId, message: message || null }
  }
  const { data } = await api.post('/applications', payload)
  return data
}

// Withdraw a pending application. The backend transitions the row's status
// rather than deleting it, so re-applying stays blocked afterwards.
export async function withdrawApplication(id) {
  const { data } = await api.delete(`/applications/${id}`)
  return data
}

// Applicants of one of the employer's own job posts. Same paginated envelope,
// each row embeds a `cleaner` summary plus the employer-only `private_note`.
export async function getJobApplicants(jobPostId, params) {
  const { data } = await api.get(`/cleaning-job-posts/${jobPostId}/applications`, { params })
  return data
}

// Single application, readable by both the owning cleaner and owning employer.
// The `/detail` suffix is the backend's way of avoiding a collision with the
// flat `GET /applications` collection route.
export async function getApplicationDetail(id) {
  const { data } = await api.get(`/applications/${id}/detail`)
  return data
}

// `message` is the optional note sent to the cleaner alongside the decision.
// Unlike the private note, the applicant can read it — so it is only ever sent
// when the employer actually wrote one.
export async function acceptApplication(id, message) {
  const { data } = await api.patch(`/applications/${id}/accept`, { message: message || null })
  return data
}

export async function rejectApplication(id, message) {
  const { data } = await api.patch(`/applications/${id}/reject`, { message: message || null })
  return data
}

// `note` may be null, which is how the employer clears a saved note.
export async function updateApplicationNote(id, note) {
  const { data } = await api.patch(`/applications/${id}/note`, { note })
  return data
}
