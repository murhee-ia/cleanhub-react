import Badge from '../../components/Badge'

const VISIBILITY_STYLES = {
  draft: 'bg-highlight-muted text-foreground',
  published: 'bg-primary-subtle text-white',
}

export default function JobVisibilityBadge({ visibility }) {
  if (!visibility) return null
  return (
    <Badge className={VISIBILITY_STYLES[visibility] ?? 'bg-highlight-muted text-foreground'}>
      {visibility}
    </Badge>
  )
}
