import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markNotificationRead,
  markAllNotificationsRead,
  notificationKeys,
} from '../../api/notifications'
import { notificationTargetPath } from '../../lib/helpers/notificationTarget'

const unreadNotificationsKey = notificationKeys.list({ unread_only: true })

function removeFromUnreadNotifications(queryClient, notificationId) {
  queryClient.setQueryData(unreadNotificationsKey, (current) => {
    if (!current?.data) return current

    const notifications = current.data.filter(({ id }) => id !== notificationId)
    const removedCount = current.data.length - notifications.length

    if (!removedCount) return current

    return {
      ...current,
      data: notifications,
      meta: current.meta
        ? { ...current.meta, total: Math.max(0, current.meta.total - removedCount) }
        : current.meta,
    }
  })
}

// Shared by the bell dropdown and the full notifications page: clicking a
// notification marks it read (only if it wasn't already) and navigates to
// whatever it's about.
export function useOpenNotification(role) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (notification) => {
      removeFromUnreadNotifications(queryClient, notification.id)
      return queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  return function openNotification(notification) {
    if (!notification.read_at) mutate(notification.id)
    const path = notificationTargetPath(notification, role)
    if (path) navigate(path)
  }
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
  })
}
