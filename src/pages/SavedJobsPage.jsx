import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getSavedJobs, savedJobKeys } from '../api/savedJobs'
import JobCard from '../features/jobs/JobCard'
import JobList from '../features/jobs/JobList'
import Pagination from '../components/Pagination'

const STATUS_NOTICES = {
  reviewing: 'This job is now under review and is no longer accepting applications.',
  closed: 'This job is closed and is no longer accepting applications.',
  completed: 'This job has been completed and is no longer accepting applications.',
  removed: 'This job is no longer available.',
}

const FALLBACK_NOTICE = 'This job is no longer open, so you cannot apply to it.'

function SavedJobSection({ title, description, jobs, showNotices = false, divided = false }) {
  return (
    <section
      className={divided ? 'border-t-2 pt-8' : undefined}
      style={divided ? { borderColor: 'var(--border)' } : undefined}
    >
      <div className="mb-4">
        <h2
          className="text-sm font-bold uppercase tracking-wider text-foreground"
          style={{ fontFamily: 'var(--heading)' }}
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      <JobList
        jobs={jobs}
        renderCard={(job) => (
          <JobCard
            key={job.id}
            job={job}
            hideApplicationStatus
            notice={showNotices ? (STATUS_NOTICES[job.status] ?? FALLBACK_NOTICE) : undefined}
          />
        )}
      />
    </section>
  )
}

function SavedJobSections({ jobs, isPending, isError }) {
  if (isPending || isError || jobs.length === 0) {
    return (
      <JobList
        isPending={isPending}
        isError={isError}
        jobs={jobs}
        emptyMessage="You haven't saved any jobs yet."
      />
    )
  }

  const changedJobs = jobs.filter((job) => job.status !== 'open')

  const sections = [
    {
      key: 'not-applied',
      title: 'No longer accepting applications',
      description: 'These saved jobs changed status before you applied.',
      jobs: changedJobs.filter((job) => !job.has_applied),
      showNotices: true,
    },
    {
      key: 'applied',
      title: 'Previously applied',
      description: 'You applied to these saved jobs before when still open. Track them at My Applications.',
      jobs: changedJobs.filter((job) => job.has_applied),
    },
    {
      key: 'open',
      title: 'Still open',
      description: 'These saved jobs are still accepting applications.',
      jobs: jobs.filter((job) => job.status === 'open'),
    },
  ].filter((section) => section.jobs.length > 0)

  return (
    <div className="flex flex-col gap-8">
      {sections.map(({ key, ...section }, index) => (
        <SavedJobSection key={key} {...section} divided={index > 0} />
      ))}
    </div>
  )
}

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
        <SavedJobSections
          isPending={isPending}
          isError={isError}
          jobs={jobs}
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
