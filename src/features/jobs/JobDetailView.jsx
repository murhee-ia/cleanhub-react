import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  CalendarClock,
  Users,
  FileText,
  CheckSquare,
  Star,
  Image as ImageIcon,
} from 'lucide-react'
import PaperCard from '../../components/PaperCard'
import Button from '../../components/Button'
import RatingSummary from '../../components/RatingSummary'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../lib/helpers/datetime'
import { employerProfilePath } from '../../lib/helpers/paths'
import { ROLES } from '../../lib/helpers/roles'
import JobStatusBadge from './JobStatusBadge'
import SaveJobButton from './SaveJobButton'
import JobStatusActions from './JobStatusActions'
import ApplyModal from '../applications/ApplyModal'

function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <Icon style={{ width: '16px', height: '16px', color: 'var(--color-foreground)' }} />
      <h2 style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '15px', color: 'var(--color-foreground)', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

function DashedDivider() {
  return (
    <div style={{ borderTop: '2px dashed var(--border)', margin: '24px 0', opacity: 0.5 }} />
  )
}

function BulletList({ text }) {
  if (!text) return null
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  return (
    <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, i) => (
        <li key={i} style={{ fontSize: '15px', color: 'var(--color-foreground)', lineHeight: 1.6 }}>
          {line.replace(/^[-•*]\s*/, '')}
        </li>
      ))}
    </ul>
  )
}

export default function JobDetailView({ job }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [applyOpen, setApplyOpen] = useState(false)

  // Applying is cleaner-only. Employers (including on their own post) and
  // moderators/admins get no Apply button — the backend policy is the real gate.
  const isCleaner = isAuthenticated && user?.role === ROLES.CLEANER

  const location = [job.address, job.city, job.country].filter(Boolean).join(', ')
  const scheduleDate = formatDate(job.schedule_date)
  const timeRange = job.start_time && job.end_time ? `${job.start_time}–${job.end_time}` : null

  function goToLogin() {
    navigate('/login', { state: { from: { pathname: `/jobs/${job.id}` } } })
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
            Job Post Detail
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--color-foreground)', margin: '0 0 12px', lineHeight: 1.1 }}>
          {job.title}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--color-muted)' }}>
          <JobStatusBadge status={job.status} />
          {job.category?.name && (
            <span style={{ fontFamily: 'var(--heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              {job.category.name}
            </span>
          )}
          {location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin style={{ width: '14px', height: '14px' }} /> {location}
            </span>
          )}
          {scheduleDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar style={{ width: '14px', height: '14px' }} /> {scheduleDate}{timeRange ? ` · ${timeRange}` : ''}
            </span>
          )}
          {job.cleaners_needed != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users style={{ width: '14px', height: '14px' }} /> {job.cleaners_needed} {job.cleaners_needed === 1 ? 'cleaner' : 'cleaners'} needed
            </span>
          )}
          {job.application_deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CalendarClock style={{ width: '14px', height: '14px' }} /> Apply by {formatDate(job.application_deadline)}
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* ── Left: Main Content Card ── */}
        <PaperCard style={{ padding: '24px 28px', height: 'fit-content' }}>
          {job.description && (
            <div>
              <SectionHeader icon={FileText} title="Description" />
              <p style={{ whiteSpace: 'pre-line', color: 'var(--color-foreground)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                {job.description}
              </p>
            </div>
          )}

          {job.requirements && (
            <>
              {job.description && <DashedDivider />}
              <SectionHeader icon={CheckSquare} title="Requirements" />
              <BulletList text={job.requirements} />
            </>
          )}

          {job.qualifications && (
            <>
              {(job.description || job.requirements) && <DashedDivider />}
              <SectionHeader icon={Star} title="Qualifications" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.qualifications.split('\n').map(q => q.trim()).filter(Boolean).map((q, i) => (
                  <span key={i} style={{ padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 600, color: 'var(--color-foreground)' }}>
                    {q.replace(/^[-•*]\s*/, '')}
                  </span>
                ))}
              </div>
            </>
          )}

          {job.media?.length > 0 && (
            <>
              {(job.description || job.requirements || job.qualifications) && <DashedDivider />}
              <SectionHeader icon={ImageIcon} title="Photos" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {job.media.map((item) => (
                  <img
                    key={item.url}
                    src={item.url}
                    alt={item.name}
                    style={{ aspectRatio: '1', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }}
                  />
                ))}
              </div>
            </>
          )}
        </PaperCard>

        {/* ── Right: Sidebar Card ── */}
        <aside>
          <div style={{ position: 'sticky', top: '24px' }}>
            <PaperCard style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Pay highlight */}
              {job.pay_amount != null && (
                <div style={{ background: 'var(--color-highlight)', border: '2px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '24px', color: 'var(--color-foreground)', margin: 0, lineHeight: 1 }}>
                    {job.pay_currency} {Number(job.pay_amount).toLocaleString()}
                  </p>
                  <p style={{ fontFamily: 'var(--heading)', fontWeight: 600, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted)', margin: '6px 0 0' }}>
                    Rate offered
                  </p>
                </div>
              )}

              {/* Employer info (if available) */}
              {job.employer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--color-primary-subtle)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '12px', color: 'var(--color-foreground)', flexShrink: 0 }}>
                    {(job.employer.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Link to={employerProfilePath(job.employer.id, user?.role)} style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '13px', color: 'var(--color-foreground)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.employer.name}
                    </Link>
                    <RatingSummary average={job.employer.rating_average} count={job.employer.rating_count} />
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Owner-only status controls (renders nothing for anyone else) */}
                <JobStatusActions job={job} />

                {job.status === 'open' && !isAuthenticated && (
                  <Button type="button" onClick={goToLogin} style={{ width: '100%', padding: '12px' }}>
                    Apply to this job
                  </Button>
                )}
                {job.status === 'open' && isCleaner && (
                  job.has_applied ? (
                    <Button
                      type="button"
                      disabled
                      className="capitalize"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      Applied · {job.application_status}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setApplyOpen(true)}
                      style={{ width: '100%', padding: '12px' }}
                    >
                      Apply to this job
                    </Button>
                  )
                )}
                {(job.status === 'open' || job.is_saved) && (
                  <SaveJobButton job={job} withLabel style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--color-foreground)' }} />
                )}
              </div>
            </PaperCard>
          </div>
        </aside>
      </div>

      {isCleaner && (
        <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  )
}
