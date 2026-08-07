import Badge from '../../components/Badge'

const STYLES = {
  active: { background: 'var(--color-primary-subtle)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  suspended: { background: 'var(--color-highlight-strong)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  deleted: { background: 'var(--color-foreground)', color: 'var(--color-surface)', borderColor: 'rgba(0,0,0,0.2)', borderWidth: '2px' },
}

// Derives the single lifecycle state from the user's flags — deleted wins over
// suspended, suspended over active.
function userStatus(user) {
  if (user.is_deleted) return 'deleted'
  if (user.is_suspended) return 'suspended'
  return 'active'
}

export default function UserStatusBadge({ user }) {
  const status = userStatus(user)
  return <Badge style={STYLES[status]}>{status}</Badge>
}
