import api from './client'

// One key factory for the whole admin panel, sub-namespaced per resource so a
// mutation can invalidate just its own list (e.g. adminKeys.users()).
export const adminKeys = {
  all: ['admin'],
  overview: () => [...adminKeys.all, 'overview'],
  users: (filters) => [...adminKeys.all, 'users', filters],
  jobs: (filters) => [...adminKeys.all, 'jobs', filters],
  categories: () => [...adminKeys.all, 'categories'],
  moderators: () => [...adminKeys.all, 'moderators'],
  settings: () => [...adminKeys.all, 'settings'],
  auditLogs: (filters) => [...adminKeys.all, 'audit-logs', filters],
}

export async function getOverview() {
  const { data } = await api.get('/admin/overview')
  return data
}

// Users — paginated { data, links, meta }; params accept search/role/status/page.
export async function getAdminUsers(params) {
  const { data } = await api.get('/admin/users', { params })
  return data
}

export async function suspendUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/suspend`)
  return data
}

export async function reactivateUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/reactivate`)
  return data
}

export async function changeUserRole({ id, role }) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role })
  return data
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}

export async function restoreUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/restore`)
  return data
}

// Jobs — paginated; params accept search/status/page.
export async function getAdminJobs(params) {
  const { data } = await api.get('/admin/jobs', { params })
  return data
}

export async function hideJob(id) {
  const { data } = await api.patch(`/admin/jobs/${id}/hide`)
  return data
}

export async function unhideJob(id) {
  const { data } = await api.patch(`/admin/jobs/${id}/unhide`)
  return data
}

// Categories — a bare array (unpaginated), like the public categories endpoint.
export async function getAdminCategories() {
  const { data } = await api.get('/admin/categories')
  return data
}

export async function createCategory(payload) {
  const { data } = await api.post('/admin/categories', payload)
  return data
}

export async function updateCategory({ id, ...payload }) {
  const { data } = await api.patch(`/admin/categories/${id}`, payload)
  return data
}

// Moderators — a bare array.
export async function getModerators() {
  const { data } = await api.get('/admin/moderators')
  return data
}

export async function createModerator(payload) {
  const { data } = await api.post('/admin/moderators', payload)
  return data
}

export async function revokeModerator(id) {
  const { data } = await api.delete(`/admin/moderators/${id}`)
  return data
}

// Settings — a flat key/value object.
export async function getSettings() {
  const { data } = await api.get('/admin/settings')
  return data
}

export async function updateSettings(payload) {
  const { data } = await api.patch('/admin/settings', payload)
  return data
}

// Audit logs — paginated; params accept action/actor_id/page.
export async function getAuditLogs(params) {
  const { data } = await api.get('/admin/audit-logs', { params })
  return data
}
