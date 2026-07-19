import api from './client'

// Endpoints and shapes per the confirmed backend API.
// Register/login return { token, user }.
// There is no current-user endpoint — the SPA hydrates the user from
// localStorage (see AuthProvider). Email verification links are opened
// directly from the email, not called from here.

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function logout() {
  const { data } = await api.post('/auth/logout')
  return data
}

export async function resendVerification() {
  const { data } = await api.post('/auth/email/verification-notification')
  return data
}

export async function forgotPassword(payload) {
  const { data } = await api.post('/auth/forgot-password', payload)
  return data
}

export async function resetPassword(payload) {
  const { data } = await api.post('/auth/reset-password', payload)
  return data
}
