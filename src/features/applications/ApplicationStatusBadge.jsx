import Badge from '../../components/Badge'

/* Application status → badge colours, mirroring JobStatusBadge's treatment.
   Uses a dashed border (vs. the solid border on JobStatusBadge) as a subtle
   visual cue that this is a different kind of status at a glance. */
const STATUS_STYLES = {
  pending:   { background: 'var(--color-highlight-muted)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)' },
  accepted:  { background: 'var(--color-primary-subtle)',  color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)' },
  rejected:  { background: 'var(--color-danger)',          color: 'var(--color-surface)',     borderColor: 'var(--color-foreground)' },
  withdrawn: { background: 'var(--color-foreground)',      color: 'var(--color-surface)',     borderColor: 'rgba(0,0,0,0.2)' },
  completed: { background: 'var(--color-highlight)',       color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)' },
}

export default function ApplicationStatusBadge({ status, prefix }) {
  if (!status) return null
  const style = STATUS_STYLES[status] ?? {
    background: 'var(--color-highlight-muted)',
    color: 'var(--color-foreground)',
    borderColor: 'rgba(0,0,0,0.2)',
  }
  return (
    <Badge style={{ ...style, borderWidth: '2px', borderStyle: 'dashed' }}>
      {prefix ? `${prefix} ${status}` : status}
    </Badge>
  )
}
