import Badge from '../../components/Badge'

const STATUS_STYLES = {
  open: 'bg-primary-subtle text-white',
  reviewing: 'bg-highlight text-foreground',
  closed: 'bg-highlight-muted text-foreground',
  removed: 'bg-danger text-white',
  completed: 'bg-primary text-white',
}

export default function JobStatusBadge({ status }) {
  if (!status) return null
  return <Badge className={STATUS_STYLES[status] ?? 'bg-highlight-muted text-foreground'}>{status}</Badge>
}
