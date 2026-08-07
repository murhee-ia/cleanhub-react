import { Link } from 'react-router-dom'
import { StickyNote } from 'lucide-react'
import Button from '../../components/Button'
import RatingSummary from '../../components/RatingSummary'
import { Avatar } from '../profile/ProfileLayout'
import { formatTimestampDate } from '../../lib/helpers/datetime'
import { cleanerProfilePath } from '../../lib/helpers/paths'
import { ROLES } from '../../lib/helpers/roles'
import RateButton from '../ratings/RateButton'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import ApplicantActions from './ApplicantActions'

// One applicant on the employer's per-job list. Identity, status/actions and the
// accept/reject pair stack vertically until `lg`, where there's finally room for
// all three side by side without squeezing the name column.
//
// Two deliberately distinct affordances: "View profile" navigates to the real
// profile page, "Review" opens the drawer for this application's own message,
// resume and private note.
export default function ApplicantRow({ application, jobPostId, onReview }) {
  const { cleaner } = application
  const profilePath = cleanerProfilePath(cleaner.id, ROLES.EMPLOYER)

  return (
    <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={cleaner.photo_url} name={cleaner.full_name} size={44} />
        <div className="min-w-0">
          <Link
            to={profilePath}
            className="block truncate font-semibold text-foreground hover:underline"
          >
            {cleaner.full_name}
          </Link>
          <RatingSummary
            average={cleaner.rating_average}
            count={cleaner.rating_count}
            variant="stars"
          />
          <p className="mt-0.5 text-xs text-muted">
            Applied {formatTimestampDate(application.created_at)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <ApplicationStatusBadge status={application.status} />
        {application.private_note && (
          <StickyNote className="size-4 text-muted" aria-label="Has a private note" role="img" />
        )}
        <Link to={profilePath} className="py-1 text-sm font-medium text-primary underline">
          View profile
        </Link>
        <Button variant="ghost" type="button" onClick={onReview}>
          Review
        </Button>
      </div>

      <ApplicantActions application={application} jobPostId={jobPostId} className="shrink-0" />
      <RateButton application={application} jobPostId={jobPostId} className="shrink-0" />
    </div>
  )
}
