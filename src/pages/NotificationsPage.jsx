import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { getNotifications, notificationKeys } from '../api/notifications'
import { useOpenNotification, useMarkAllNotificationsRead } from '../features/notifications/useNotificationActions'
import NotificationItem from '../features/notifications/NotificationItem'
import Button from '../components/Button'
import Pagination from '../components/Pagination'
import { useAuth } from '../hooks/useAuth'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const params = page > 1 ? { page } : {}

  const { data, isPending, isError } = useQuery({
    queryKey: notificationKeys.list({ page }),
    queryFn: () => getNotifications(params),
    placeholderData: keepPreviousData,
  })

  const notifications = data?.data ?? []
  const meta = data?.meta
  const unreadCount = notifications.filter((n) => !n.read_at).length

  const openNotification = useOpenNotification(user?.role)
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="page-content">
      <p className="page-breadcrumb">
        {user?.role === 'employer' ? 'EMPLOYER' : 'CLEANER'} · NOTIFICATIONS
      </p>

      <div className="page-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <CheckCheck className="size-4 shrink-0" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="paper-flat mt-6 flex flex-col">
        {isPending ? (
          <p className="p-4 text-sm text-muted">Loading notifications…</p>
        ) : isError ? (
          <p className="p-4 text-sm text-danger">Couldn't load notifications.</p>
        ) : notifications.length ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => openNotification(notification)}
            />
          ))
        ) : (
          <p className="p-4 text-sm text-muted">You have no notifications yet.</p>
        )}
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
