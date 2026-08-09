import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getSavedJobs, savedJobKeys } from '../api/savedJobs'
import JobCard from '../features/jobs/JobCard'
import JobList from '../features/jobs/JobList'
import Pagination from '../components/Pagination'

const CLOSED_NOTICE = 'This job is no longer open, so you cannot apply to it.'

export default function SavedJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page')
  const filters = page ? { page } : {}

  const { data, isPending, isError } = useQuery({
    queryKey: savedJobKeys.list(filters),
    queryFn: () => getSavedJobs(filters),
    placeholderData: keepPreviousData,
  })

  const jobs = (data?.data ?? []).map((row) => row.job)
  const meta = data?.meta

  function goToPage(next) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('page', String(next))
      return params
    })
  }

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <p className="page-breadcrumb">CLEANER · SAVED JOBS</p>

      <div className="page-header">
        <h1>Saved jobs</h1>
      </div>

      <div className="mt-6">
        <JobList
          isPending={isPending}
          isError={isError}
          jobs={jobs}
          emptyMessage="You haven't saved any jobs yet."
          renderCard={(job) => (
          <JobCard
              key={job.id}
              job={job}
              hideApplicationStatus
              notice={job.status !== 'open' ? CLOSED_NOTICE : undefined}
            />
          )}
        />
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  )
}
