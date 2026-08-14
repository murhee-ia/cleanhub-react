import { Star } from 'lucide-react'

// variant controls rendering:
//   'label' (default) — single star + average + "(N reviews)", or "No ratings yet"
//   'stars' — five stars with dynamic fill (floor of the average), used by JobCard
export default function RatingSummary({ average, count, variant = 'label' }) {
  if (variant === 'stars') {
    const value = count ? Number(average) : 0
    const filled = Math.floor(value)
    return (
      <div className="flex items-center gap-1">
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
    return (
      <div className="flex items-center gap-1">
        <Star className='size-3 text-highlight-strong fill-none'/>
        <small className="text-muted">No ratings yet</small>
      </div>
    )
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
