import api from './client'

export const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), filters],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), id],
}

// Single job post. Guest-accessible for published + non-removed posts; the
// owning employer additionally sees their own post in any visibility/status.
export async function getJob(id) {
  const { data } = await api.get(`/cleaning-job-posts/${id}`)
  return data
}
