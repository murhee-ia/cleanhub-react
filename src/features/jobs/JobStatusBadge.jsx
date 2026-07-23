const STATUS_STYLES = {
  open: 'bg-primary-subtle text-white',
  reviewing: 'bg-highlight text-foreground',
  closed: 'bg-highlight-muted text-foreground',
  removed: 'bg-danger text-white',
  completed: 'bg-primary text-white',
}

export default function JobStatusBadge({ status }) {
  if (!status) return null
  const style = STATUS_STYLES[status] ?? 'bg-highlight-muted text-foreground'
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${style}`}>
      {status}
    </span>
  )
}
