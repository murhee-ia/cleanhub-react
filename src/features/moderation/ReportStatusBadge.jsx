import Badge from '../../components/Badge'

/* Report status → badge colours, echoing JobStatusBadge's palette usage. */
const STATUS_STYLES = {
  open: { background: 'var(--color-highlight-strong)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  under_review: { background: 'var(--color-primary-subtle)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  escalated: { background: 'var(--color-danger)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  resolved: { background: 'var(--color-highlight-soft)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' },
  rejected: { background: 'var(--color-foreground)', color: 'var(--color-surface)', borderColor: 'rgba(0,0,0,0.2)', borderWidth: '2px' },
}

const LABELS = {
  open: 'open',
  under_review: 'under review',
  escalated: 'escalated',
  resolved: 'resolved',
  rejected: 'rejected',
}

export default function ReportStatusBadge({ status }) {
  if (!status) return null
  const style = STATUS_STYLES[status] ?? { background: 'var(--color-highlight-muted)', color: 'var(--color-foreground)', borderColor: 'rgba(0,0,0,0.2)' }
  return <Badge style={style}>{LABELS[status] ?? status}</Badge>
}
