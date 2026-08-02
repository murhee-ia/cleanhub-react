// Small presentational atoms shared by the cleaner and employer profile views.

/* Inner bordered box used for each right-column section on a profile page */
export function BoxCard({ icon: Icon, title, children }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1.5px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
        <Icon style={{ width: '16px', height: '16px', color: 'var(--color-foreground)' }} />
        <h2 style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-foreground)', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 88 }) {
  const box = { width: `${size}px`, height: `${size}px`, flexShrink: 0 }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          ...box,
          borderRadius: 'var(--radius)',
          objectFit: 'cover',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
    )
  }
  return (
    <div
      style={{
        ...box,
        borderRadius: 'var(--radius)',
        background: 'var(--color-highlight-muted)',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--heading)',
        fontWeight: 700,
        fontSize: `${Math.round(size * 0.3)}px`,
        color: 'var(--color-primary)',
      }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </div>
  )
}

export function Stat({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        background: 'var(--color-highlight)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        padding: '10px 16px',
        textAlign: 'center',
        minWidth: '80px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--heading)',
          fontWeight: 700,
          fontSize: '26px',
          color: 'var(--color-foreground)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--heading)',
          fontWeight: 500,
          fontSize: '11px',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2
        style={{
          fontFamily: 'var(--heading)',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--color-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          margin: 0,
          paddingBottom: '8px',
          borderBottom: '2px solid var(--border)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

// Renders snake_case string values (categories/languages) as readable chips.
export function TagList({ items = [], emptyLabel = '—' }) {
  if (!items.length) {
    return (
      <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
        {emptyLabel}
      </p>
    )
  }
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            background: 'var(--color-highlight-muted)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            padding: '4px 12px',
            fontFamily: 'var(--heading)',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'capitalize',
            color: 'var(--color-foreground)',
          }}
        >
          {item.replace(/_/g, ' ')}
        </li>
      ))}
    </ul>
  )
}
