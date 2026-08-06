import api from './client'

export const profileKeys = {
  all: ['profile'],
  me: () => [...profileKeys.all, 'me'],
  publics: () => [...profileKeys.all, 'public'],
  cleaner: (id) => [...profileKeys.publics(), 'cleaner', String(id)],
  employer: (id) => [...profileKeys.publics(), 'employer', String(id)],
}

export async function getMyProfile() {
  const { data } = await api.get('/profile')
  return data
}

// Profiles carry files (photo/logo, PDFs) alongside text, so the caller passes a
// FormData with `_method=PATCH` appended; PHP can't parse multipart on PUT/PATCH,
// hence the POST + method spoof.
export async function updateMyProfile(formData) {
  const { data } = await api.post('/profile', formData)
  return data
}

// `id` is the user id (same as user.id elsewhere), not a separate profile id.
export async function getCleanerProfile(id) {
  const { data } = await api.get(`/cleaners/${id}`)
  return data
}

export async function getEmployerProfile(id) {
  const { data } = await api.get(`/employers/${id}`)
  return data
}
