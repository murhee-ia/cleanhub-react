import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getNotifications, notificationKeys } from '../../api/notifications'
import { notificationsPath } from '../../lib/helpers/paths'
import { useOpenNotification, useMarkAllNotificationsRead } from './useNotificationActions'
import NotificationItem from './NotificationItem'

const POLL_MS = 30000

// The sidebar that renders this has `overflow: hidden` (it clips its own
// mobile-collapse animation), so the panel is portaled to the body and
// positioned from the trigger's own bounding rect — the same reason Modal
// uses a portal, just fixed-positioned instead of centered.
export default function NotificationBell({ role }) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const unreadQuery = useQuery({
    queryKey: notificationKeys.list({ unread_only: true }),
    queryFn: () => getNotifications({ unread_only: true }),
    refetchInterval: POLL_MS,
  })
  const unreadCount = unreadQuery.data?.meta?.total ?? 0
  const notifications = unreadQuery.data?.data ?? []

  const openNotification = useOpenNotification(role)
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (
        !panelRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggleOpen() {
    if (!open) setAnchor(buttonRef.current.getBoundingClientRect())
    setOpen((value) => !value)
  }

  function handleItemClick(notification) {
    setOpen(false)
    openNotification(notification)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={open}
        className="sidebar-link"
        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', position: 'relative' }}
      >
        <Bell className="sidebar-icon" aria-hidden="true" />
        <span className="sidebar-label">Notifications</span>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '4px',
              left: '28px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '999px',
              background: 'var(--color-highlight-strong)',
              color: 'var(--color-primary)',
              fontSize: '10px',
              fontWeight: 700,
              lineHeight: '16px',
              textAlign: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label="Notifications"
            className="paper-flat"
            style={{
              position: 'fixed',
              left: `${anchor.right + 8}px`,
              bottom: `${window.innerHeight - anchor.bottom}px`,
              width: '22rem',
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: '28rem',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 60,
            }}
          >
            <div
              className="flex items-center justify-between gap-2"
              style={{ padding: '12px 14px', borderBottom: '2px solid var(--border)' }}
            >
              <span style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '14px' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent text-xs font-medium text-primary"
                >
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto' }}>
              {unreadQuery.isPending ? (
                <p className="p-4 text-sm text-muted">Loading…</p>
              ) : notifications.length ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleItemClick(notification)}
                  />
                ))
              ) : (
                <p className="p-4 text-sm text-muted">You're all caught up.</p>
              )}
            </div>

            <Link
              to={notificationsPath(role)}
              onClick={() => setOpen(false)}
              className="text-center text-sm font-medium text-primary underline"
              style={{ padding: '10px', borderTop: '2px solid var(--border)' }}
            >
              View all
            </Link>
          </div>,
          document.body,
        )}
    </>
  )
}
