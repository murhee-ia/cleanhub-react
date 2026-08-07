import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markNotificationRead,
  markAllNotificationsRead,
  notificationKeys,
} from '../../api/notifications'
import { notificationTargetPath } from '../../lib/helpers/notificationTarget'

// Shared by the bell dropdown and the full notifications page: clicking a
// notification marks it read (only if it wasn't already) and navigates to
// whatever it's about.
export function useOpenNotification(role) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
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
