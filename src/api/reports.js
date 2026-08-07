import api from './client'

export const reportKeys = {
  all: ['reports'],
  lists: () => [...reportKeys.all, 'list'],
  list: (filters) => [...reportKeys.lists(), filters],
  details: () => [...reportKeys.all, 'detail'],
  detail: (id) => [...reportKeys.details(), id],
}

// Filing a report — reportableType is one of 'user' | 'job_post' | 'rating'.
export async function createReport({ reportableType, reportableId, reason }) {
  const { data } = await api.post('/reports', {
    reportable_type: reportableType,
    reportable_id: reportableId,
    reason,
  })
  return data
}

// Moderation queue (moderator/admin). Paginated { data, links, meta }; params
// accept `type`, `status`, and `page`.
export async function getReports(params) {
  const { data } = await api.get('/moderation/reports', { params })
  return data
}

export async function getReport(id) {
  const { data } = await api.get(`/moderation/reports/${id}`)
  return data
}

// The five handling actions all PATCH the same report and carry an optional
// closing note — the route decides the resulting status.
function handleReport(action) {
  return async ({ id, note }) => {
    const { data } = await api.patch(`/moderation/reports/${id}/${action}`, { note })
    return data
  }
}

export const resolveReport = handleReport('resolve')
export const rejectReport = handleReport('reject')
export const escalateReport = handleReport('escalate')
export const hideReportedContent = handleReport('hide')
export const warnReportedUser = handleReport('warn')
