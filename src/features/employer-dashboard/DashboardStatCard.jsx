import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardStatCard({ label, value, detail, icon: Icon, to, accent = 'surface' }) {
  const content = (
    <>
      <span className="employer-stat-card__topline">
        <span className="employer-stat-card__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2.25} />
        </span>
        {to && <ArrowUpRight size={17} aria-hidden="true" />}
      </span>
      <strong>{value ?? '—'}</strong>
      <span className="employer-stat-card__label">{label}</span>
      <span className="employer-stat-card__detail">{detail}</span>
    </>
  )

  const className = `employer-stat-card employer-stat-card--${accent}`

  return to ? (
    <Link to={to} className={className} aria-label={`${label}: ${value}. ${detail}`}>
      {content}
    </Link>
  ) : (
    <article className={className}>
      {content}
    </article>
  )
}
