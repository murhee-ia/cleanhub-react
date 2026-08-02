import { Star } from 'lucide-react'

function formatRating(value) {
  return value.toFixed(1).replace(/\.0$/, '')
}

// rating_average is null and rating_count 0 until the Phase 7 ratings work
// lands; the resource shape won't change, so this just swaps its own copy then.
// variant controls rendering:
//   'label' (default) — single star + average + "(N reviews)", or "No ratings yet"
//   'stars' — number • five stars with dynamic fill (floor of the average), used by JobCard
export default function RatingSummary({ average, count, variant = 'label' }) {
  if (variant === 'stars') {
    const value = count ? Number(average) : 0
    const filled = Math.floor(value)
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-highlight-strong">{formatRating(value)}</span>
        <span className="text-xs text-highlight-strong" aria-hidden="true">•</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3 text-highlight-strong ${i < filled ? 'fill-highlight-strong' : 'fill-none'}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    )
  }

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
