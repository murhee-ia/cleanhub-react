import Badge from '../../components/Badge'

/* Status → { bg, text, border } */
const STATUS_STYLES = {
  open: { background: 'var(--color-primary-subtle)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  reviewing: { background: 'var(--color-highlight-strong)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  closed: { background: 'var(--color-foreground)', color: 'var(--color-surface)', borderColor: 'rgba(0,0,0,0.2)', borderWidth: '2px' },
  removed: { background: 'var(--color-danger)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  completed: { background: 'var(--color-highlight)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
}

export default function JobStatusBadge({ status }) {
  if (!status) return null
  const s = STATUS_STYLES[status] ?? { background: 'var(--color-highlight-muted)', color: 'var(--color-foreground)', borderColor: 'rgba(0,0,0,0.2)' }
  return (
    <Badge style={s}>
      {status}
    </Badge>
  )
}
