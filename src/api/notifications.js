import api from './client'

export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), filters],
}

// Paginated envelope { data, links, meta }. `params.unread_only` narrows the
// same endpoint to what the bell's badge/dropdown need.
export async function getNotifications(params) {
  const normalizedParams = {
    ...params,
    ...(params?.unread_only !== undefined && {
      unread_only: params.unread_only ? 1 : 0,
    }),
  }
  const { data } = await api.get('/notifications', { params: normalizedParams })
  return data
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/read-all')
  return data
}
