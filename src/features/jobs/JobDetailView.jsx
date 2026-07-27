import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Banknote, CalendarClock } from 'lucide-react'
import PaperCard from '../../components/PaperCard'
import WashiTape from '../../components/WashiTape'
import Button from '../../components/Button'
import RatingSummary from '../../components/RatingSummary'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../lib/helpers/datetime'
import JobStatusBadge from './JobStatusBadge'
import SaveJobButton from './SaveJobButton'

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        <span className="text-foreground">{children}</span>
      </div>
    </div>
  )
}

function TextSection({ title, body }) {
  if (!body) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 font-serif text-lg text-foreground">{title}</h2>
      <p className="whitespace-pre-line text-foreground">{body}</p>
    </section>
  )
}

export default function JobDetailView({ job }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const location = [job.address, job.city, job.country].filter(Boolean).join(', ')
  const scheduleDate = formatDate(job.schedule_date)
  const timeRange = job.start_time && job.end_time ? `${job.start_time}–${job.end_time}` : null

  function goToLogin() {
    navigate('/login', { state: { from: { pathname: `/jobs/${job.id}` } } })
  }

  return (
    <PaperCard className="relative mx-auto w-full max-w-6xl p-6 sm:p-8">
      <WashiTape className="absolute -top-3 left-10" rotation={-4} />

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {job.category?.name && (
            <span className="rounded-full bg-highlight-muted px-3 py-1 text-sm text-foreground">
              {job.category.name}
            </span>
          )}
          <JobStatusBadge status={job.status} />
        </div>
        <h1 className="m-0 font-serif text-3xl text-foreground">{job.title}</h1>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem] lg:gap-12">
        <div className="flex flex-col gap-6 lg:order-1">
          <TextSection title="Description" body={job.description} />
          <TextSection title="Requirements" body={job.requirements} />
          <TextSection title="Qualifications" body={job.qualifications} />

          {job.media?.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="m-0 font-serif text-lg text-foreground">Media</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.media.map((item) => (
                  <img
                    key={item.url}
                    src={item.url}
                    alt={item.name}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-5 lg:order-2 lg:border-l lg:pl-8" style={{ borderColor: 'var(--border)' }}>
          {location && (
            <Fact icon={MapPin} label="Location">
              {location}
            </Fact>
          )}
          {scheduleDate && (
            <Fact icon={Calendar} label="Schedule">
              {scheduleDate}
            </Fact>
          )}
          {timeRange && (
            <Fact icon={Clock} label="Time">
              {timeRange}
            </Fact>
          )}
          {job.pay_amount != null && (
            <Fact icon={Banknote} label="Pay">
              {job.pay_currency} {job.pay_amount}
            </Fact>
          )}
          {job.cleaners_needed != null && (
            <Fact icon={Users} label="Cleaners needed">
              {job.cleaners_needed}
            </Fact>
          )}
          {job.application_deadline && (
            <Fact icon={CalendarClock} label="Apply by">
              {formatDate(job.application_deadline)}
            </Fact>
          )}

          {job.employer && (
            <div className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs uppercase tracking-wide text-muted">Employer</span>
              <Link to={`/employers/${job.employer.id}`} className="text-primary underline">
                {job.employer.name}
              </Link>
              <RatingSummary
                average={job.employer.rating_average}
                count={job.employer.rating_count}
              />
            </div>
          )}

          {'applications_count' in job && (
            <p className="text-sm text-muted">{job.applications_count} applications</p>
          )}

          {job.status === 'open' &&
            (isAuthenticated ? (
              // Applying is wired in Phase 5; disabled until then rather than a dead button.
              <div className="flex flex-col gap-1">
                <Button type="button" disabled title="Applying opens soon">
                  Apply
                </Button>
                <span className="text-xs text-muted">Applying opens soon.</span>
              </div>
            ) : (
              <Button type="button" onClick={goToLogin}>
                Apply
              </Button>
            ))}

          {(job.status === 'open' || job.is_saved) && (
            <SaveJobButton job={job} withLabel className="w-full" />
          )}
        </aside>
      </div>
    </PaperCard>
  )
}
