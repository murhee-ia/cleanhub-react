import { Link } from 'react-router-dom'
import { MapPin, Calendar, Banknote } from 'lucide-react'
import PaperCard from '../../components/PaperCard'
import RatingSummary from '../../components/RatingSummary'
import { formatDate } from '../../lib/helpers/datetime'
import JobStatusBadge from './JobStatusBadge'
import JobVisibilityBadge from './JobVisibilityBadge'

export default function JobCard({ job, showVisibility = false }) {
  const location = [job.city, job.country].filter(Boolean).join(', ')
  return (
    <PaperCard className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        {job.category?.name && (
          <span className="rounded-full bg-highlight-muted px-3 py-1 text-sm text-foreground">
            {job.category.name}
          </span>
        )}
        <JobStatusBadge status={job.status} />
        {showVisibility && <JobVisibilityBadge visibility={job.visibility} />}
      </div>

      <h3 className="mt-2 font-serif text-xl text-foreground">
        <Link to={`/jobs/${job.id}`} className="hover:underline">
          {job.title}
        </Link>
      </h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden="true" />
            {location}
          </span>
        )}
        {job.schedule_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-4" aria-hidden="true" />
            {formatDate(job.schedule_date)}
          </span>
        )}
        {job.pay_amount != null && (
          <span className="inline-flex items-center gap-1">
            <Banknote className="size-4" aria-hidden="true" />
            {job.pay_currency} {job.pay_amount}
          </span>
        )}
      </div>

      {job.employer && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-foreground">{job.employer.name}</span>
          <RatingSummary average={job.employer.rating_average} count={job.employer.rating_count} />
        </div>
      )}
    </PaperCard>
  )
}
