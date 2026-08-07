import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { getCleanerRatings, getEmployerRatings, ratingKeys } from '../../api/ratings'
import { formatTimestampDate } from '../../lib/helpers/datetime'
import Pagination from '../../components/Pagination'
import ReportButton from '../reports/ReportButton'

const FETCH_BY_ROLE = {
  cleaner: getCleanerRatings,
  employer: getEmployerRatings,
}

const KEY_BY_ROLE = {
  cleaner: ratingKeys.cleanerList,
  employer: ratingKeys.employerList,
}

function ReviewRow({ rating, isLast }) {
  return (
    <div
      className="flex flex-col gap-1.5 py-4 first:pt-0"
      style={isLast ? undefined : { borderBottom: '1.5px solid rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 text-highlight-strong ${i < rating.stars ? 'fill-highlight-strong' : 'fill-none'}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-muted">{formatTimestampDate(rating.created_at)}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{rating.reviewer.full_name}</p>
      {rating.text && <p className="text-sm whitespace-pre-line text-foreground">{rating.text}</p>}
      <div className="mt-0.5 flex justify-end">
        <ReportButton reportableType="rating" reportableId={rating.id} size="sm" />
      </div>
    </div>
  )
}

// Individual reviews left on a cleaner or employer's completed jobs, embedded
// in a BoxCard on their profile page alongside the aggregate RatingSummary
// badge. `role` picks which of the two public endpoints to read.
export default function ReviewsSection({ role, userId }) {
  const [page, setPage] = useState(1)
  const params = page > 1 ? { page } : {}

  const { data, isPending, isError } = useQuery({
    queryKey: KEY_BY_ROLE[role](userId, { page }),
    queryFn: () => FETCH_BY_ROLE[role](userId, params),
    placeholderData: keepPreviousData,
  })

  const reviews = data?.data ?? []
  const meta = data?.meta

  if (isPending) return <p className="text-sm text-muted">Loading reviews…</p>
  if (isError) return <p className="text-sm text-danger">Couldn't load reviews.</p>
  if (!reviews.length) return <p className="text-sm text-muted">No reviews yet.</p>

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        {reviews.map((rating, index) => (
          <ReviewRow key={rating.id} rating={rating} isLast={index === reviews.length - 1} />
        ))}
      </div>
      {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />}
    </div>
  )
}
