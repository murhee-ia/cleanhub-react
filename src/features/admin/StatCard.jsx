/**
 * StatCard — a single neo-brutalist overview tile: a big number over an
 * uppercase label, with an optional accent background for the headline cards.
 */
export default function StatCard({ label, value, accent = false }) {
  return (
    <div
      className="paper-flat"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: accent ? 'var(--color-highlight)' : 'var(--color-surface)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--heading)',
          fontWeight: 700,
          fontSize: '30px',
          lineHeight: 1,
          color: 'var(--color-foreground)',
        }}
      >
        {value ?? '—'}
      </span>
      <span
        style={{
          fontFamily: 'var(--heading)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--color-muted)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
