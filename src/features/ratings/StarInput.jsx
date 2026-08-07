import { useState } from 'react'
import { Star } from 'lucide-react'

// Five-star picker. Hovering/focusing a star previews the value it would set
// without committing it, so the visible fill is "hover if present, else the
// committed value" rather than the value itself.
export default function StarInput({ value = 0, onChange, disabled = false, error }) {
  const [hovered, setHovered] = useState(null)
  const display = hovered ?? value

  return (
    <div className="flex flex-col gap-1.5">
      <div role="radiogroup" aria-label="Star rating" className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            className="cursor-pointer border-none bg-transparent p-0.5 disabled:cursor-not-allowed"
          >
            <Star
              className={`size-8 text-highlight-strong ${star <= display ? 'fill-highlight-strong' : 'fill-none'}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
