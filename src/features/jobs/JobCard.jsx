import { Link } from 'react-router-dom'
import { MapPin, Calendar, TriangleAlert } from 'lucide-react'
import PaperCard from '../../components/PaperCard'
import RatingSummary from '../../components/RatingSummary'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../lib/helpers/datetime'
import { jobDetailPath } from '../../lib/helpers/paths'
import JobStatusBadge from './JobStatusBadge'
import SaveJobButton from './SaveJobButton'

/* Small employer/company initials avatar */
function EmployerAvatar({ name = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  // derive a deterministic hue from the name
  const hue = (name.charCodeAt(0) ?? 65) % 360
  const bg = `hsl(${hue}, 55%, 90%)`
  const fg = `hsl(${hue}, 55%, 30%)`

  return (
    <div
      aria-hidden="true"
      style={{
        width: '1.625rem',
        height: '1.625rem',
        borderRadius: 'var(--radius)',
        background: bg,
        color: fg,
        fontFamily: 'var(--heading)',
        fontWeight: 700,
        fontSize: '0.625rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1.5px solid rgba(0,0,0,0.12)',
      }}
    >
      {initials}
    </div>
  )
}

export default function JobCard({ job, showEmployer = true, notice }) {
  const { user } = useAuth()
  const location = [job.city, job.country].filter(Boolean).join(', ')
  const detailPath = jobDetailPath(job.id, user?.role)

  return (
    <PaperCard className="p-5 flex flex-col gap-3">
      {/* Closed notice banner */}
      {notice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            background: 'var(--color-highlight-muted)',
            border: '1.5px solid var(--color-highlight-strong)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8125rem',
            color: 'var(--color-foreground)',
          }}
        >
          <TriangleAlert
            className="mt-0.5 shrink-0"
            style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-caution)' }}
            aria-hidden="true"
          />
          <span>{notice}</span>
        </div>
      )}

      {/* Top row: status badge + category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <JobStatusBadge status={job.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {job.category?.name && (
            <span
              style={{
                fontFamily: 'var(--heading)',
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--color-foreground)',
              }}
            >
              {job.category.name}
            </span>
          )}
          {(job.status === 'open' || job.is_saved) && (
            <SaveJobButton job={job} className="-mr-1 shrink-0" />
          )}
        </div>
      </div>

      {/* Job title */}
      <h3
        style={{
          fontFamily: 'var(--heading)',
          fontWeight: 700,
          fontSize: '1rem',
          lineHeight: 1.25,
          color: 'var(--color-foreground)',
          margin: 0,
        }}
      >
        <Link
          to={detailPath}
          style={{ color: 'inherit', textDecoration: 'none' }}
          className="hover:underline"
        >
          {job.title}
        </Link>
      </h3>

      {/* Meta row: location + date */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
        {location && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
            }}
          >
            <MapPin style={{ width: '0.75rem', height: '0.75rem' }} aria-hidden="true" />
            {location}
          </span>
        )}
        {job.schedule_date && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
            }}
          >
            <Calendar style={{ width: '0.75rem', height: '0.75rem' }} aria-hidden="true" />
            {formatDate(job.schedule_date)}
          </span>
        )}
      </div>

      {/* Employer row (avatar + name, rating on its own line below) */}
      {showEmployer && job.employer && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <EmployerAvatar name={job.employer.name} />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--heading)',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--color-foreground)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                margin: 0,
              }}
            >
              {job.employer.name}
            </p>
            <RatingSummary
              average={job.employer.rating_average}
              count={job.employer.rating_count}
              variant="stars"
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1.5px dashed rgba(0,0,0,0.10)', marginTop: '2px' }} />

      {/* Bottom row: pay (left) + View job CTA (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
        {job.pay_amount != null ? (
          <span
            style={{
              fontFamily: 'var(--heading)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'var(--color-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {job.pay_currency} {Number(job.pay_amount).toLocaleString()}
          </span>
        ) : (
          <span />
        )}

        <Link
          to={detailPath}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            background: 'var(--color-primary)',
            color: '#ffffff',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-btn-sm)',
            padding: '0.4375rem 0.875rem',
            fontFamily: 'var(--heading)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textDecoration: 'none',
            transition: 'box-shadow 0.1s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '1px 1px 0 #1a1a1a'
            e.currentTarget.style.transform = 'translate(1px,1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-btn-sm)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          View job →
        </Link>
      </div>
    </PaperCard>
  )
}
