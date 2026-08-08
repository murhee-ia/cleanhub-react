/**
 * FilterTabs — a wrapping row of neo-brutalist toggle buttons for a single-
 * select filter (status, type, …). Wraps rather than scrolls so every option
 * stays reachable at 375px. Options are { value, label }.
 */
export default function FilterTabs({ options, value, onChange, ariaLabel }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className="cursor-pointer capitalize"
            style={{
              fontFamily: 'var(--heading)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              background: active ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active ? '#ffffff' : 'var(--color-foreground)',
              boxShadow: active ? 'var(--shadow-btn-sm)' : 'none',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
