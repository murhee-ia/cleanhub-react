import api from './client'

export const ratingKeys = {
  all: ['ratings'],
  lists: () => [...ratingKeys.all, 'list'],
  cleanerList: (id, filters) => [...ratingKeys.lists(), 'cleaner', String(id), filters],
  employerList: (id, filters) => [...ratingKeys.lists(), 'employer', String(id), filters],
}

// A cleaner's public reviews, newest first — paginated envelope { data, links, meta }.
export async function getCleanerRatings(id, params) {
  const { data } = await api.get(`/cleaners/${id}/ratings`, { params })
  return data
}

// An employer's public reviews, same shape.
export async function getEmployerRatings(id, params) {
  const { data } = await api.get(`/employers/${id}/ratings`, { params })
  return data
}

// Rate the other party of a completed application. Either the cleaner or the
// employer on that application may call this once — the backend derives the
// reviewee from whichever side the caller isn't.
export async function submitRating({ applicationId, stars, text }) {
  const { data } = await api.post('/ratings', {
    application_id: applicationId,
    stars,
    text: text || null,
  })
  return data
}
