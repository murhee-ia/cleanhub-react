import { formatTimestampDate } from '../../lib/helpers/datetime'

// One row, shared by the bell dropdown and the full notifications page.
export default function NotificationItem({ notification, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent p-3 text-left hover:bg-highlight-soft"
      style={{ borderBottom: '1.5px solid rgba(0,0,0,0.1)' }}
    >
      <span
        aria-hidden="true"
        className="mt-1.5 size-2 shrink-0 rounded-full"
        style={{ background: notification.read_at ? 'transparent' : 'var(--color-primary)' }}
      />
      <span className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{notification.message}</p>
        <p className="mt-0.5 text-xs text-muted">{formatTimestampDate(notification.created_at)}</p>
      </span>
    </button>
  )
}
