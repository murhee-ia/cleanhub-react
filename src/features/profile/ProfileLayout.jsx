import PaperCard from '../../components/PaperCard'
import WashiTape from '../../components/WashiTape'

// Small presentational atoms shared by the cleaner and employer profile views.

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name }) {
  if (src) {
    return <img src={src} alt={name} className="size-24 rounded-full object-cover" />
  }
  return (
    <div
      className="flex size-24 items-center justify-center rounded-full bg-primary-subtle text-2xl font-medium text-white"
      aria-hidden="true"
    >
      {initialsOf(name)}
    </div>
  )
}

export function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="font-serif text-2xl text-foreground">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 font-serif text-lg text-foreground">{title}</h2>
      {children}
    </section>
  )
}

// Renders snake_case string values (categories/languages) as readable chips.
export function TagList({ items = [], emptyLabel = '—' }) {
  if (!items.length) {
    return <p className="text-sm text-muted">{emptyLabel}</p>
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-highlight-muted px-3 py-1 text-sm capitalize text-foreground"
        >
          {item.replace(/_/g, ' ')}
        </li>
      ))}
    </ul>
  )
}

// Two-column profile frame: an identity/stats sidebar beside a content column
// on wide screens, collapsing to a single stacked column on mobile so the card
// fills desktop width instead of floating with large empty gutters.
export function ProfileShell({ header, stats, children }) {
  return (
    <PaperCard className="relative mx-auto w-full max-w-6xl p-6 sm:p-8">
      <WashiTape className="absolute -top-3 left-10" rotation={-4} />
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-12">
        <aside
          className="flex flex-col gap-6 lg:border-r lg:pr-10"
          style={{ borderColor: 'var(--border)' }}
        >
          {header}
          {stats && (
            <div className="flex gap-10 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              {stats}
            </div>
          )}
        </aside>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </PaperCard>
  )
}
