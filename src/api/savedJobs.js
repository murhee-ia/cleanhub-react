import api from './client'

export const savedJobKeys = {
  all: ['saved-jobs'],
  lists: () => [...savedJobKeys.all, 'list'],
  list: (filters) => [...savedJobKeys.lists(), filters],
}

// Cleaner's saved jobs (newest first). Returns the paginated envelope
// { data, links, meta } where each row is { id, saved_at, job }.
export async function getSavedJobs(params) {
  const { data } = await api.get('/saved-jobs', { params })
  return data
}

// Save an open, published job. Returns the created { id, saved_at, job }.
export async function saveJob(cleaningJobPostId) {
  const { data } = await api.post('/saved-jobs', { cleaning_job_post_id: cleaningJobPostId })
  return data
}

// Unsave a job. The route param is the job-post id (not the saved-row id),
// so a card/detail can unsave knowing only job.id.
export async function unsaveJob(cleaningJobPostId) {
  await api.delete(`/saved-jobs/${cleaningJobPostId}`)
}
