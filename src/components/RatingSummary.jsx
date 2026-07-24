import { Star } from 'lucide-react'

// rating_average is null and rating_count 0 until the Phase 7 ratings work
// lands; the resource shape won't change, so this just swaps its own copy then.
export default function RatingSummary({ average, count }) {
  if (!count) {
    return <p className="text-sm text-muted">No ratings yet</p>
  }
  return (
    <div className="flex items-center gap-1.5">
      <Star className="size-4 fill-highlight-strong text-highlight-strong" aria-hidden="true" />
      <span className="font-medium text-foreground">{Number(average).toFixed(1)}</span>
      <span className="text-sm text-muted">
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  )
}
