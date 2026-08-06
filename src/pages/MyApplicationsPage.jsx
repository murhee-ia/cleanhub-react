import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getMyApplications, applicationKeys } from '../api/applications'
import { APPLICATION_STATUSES } from '../lib/helpers/applicationStatus'
import ApplicationStatusTabs from '../features/applications/ApplicationStatusTabs'
import ApplicationCardFooter from '../features/applications/ApplicationCardFooter'
import JobCard from '../features/jobs/JobCard'
import JobList from '../features/jobs/JobList'
import Pagination from '../components/Pagination'

function paramsToFilters(searchParams) {
  const filters = {}
  for (const key of ['status', 'page']) {
    const value = searchParams.get(key)
    if (value) filters[key] = value
  }
  // An unrecognised status would 422 the API, so fall back to "all".
  if (filters.status && !APPLICATION_STATUSES.includes(filters.status)) delete filters.status
  return filters
}

export default function MyApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

  const { data, isPending, isError } = useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => getMyApplications(filters),
    placeholderData: keepPreviousData,
  })

  const applications = data?.data ?? []
  const meta = data?.meta
  const jobs = applications.map((application) => application.job)
  const byJobId = new Map(applications.map((application) => [application.job.id, application]))

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <p className="page-breadcrumb">CLEANER · MY APPLICATIONS</p>

      <div className="page-header">
        <h1>My applications</h1>
      </div>

      <div className="mt-6">
        <ApplicationStatusTabs
          value={filters.status ?? ''}
          onChange={(status) => setParam('status', status)}
        />
      </div>

      <p className="mt-6 min-h-5 text-sm text-muted" aria-live="polite">
        {meta ? `${meta.total} ${meta.total === 1 ? 'application' : 'applications'}` : ''}
      </p>

      <div className="mt-2">
        <JobList
          isPending={isPending}
          isError={isError}
          jobs={jobs}
          emptyMessage={
            filters.status
              ? `You have no ${filters.status} applications.`
              : "You haven't applied to any jobs yet."
          }
          renderCard={(job) => (
            <JobCard
              key={job.id}
              job={job}
              footer={<ApplicationCardFooter application={byJobId.get(job.id)} />}
            />
          )}
        />
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={(page) => setParam('page', String(page))}
          />
        </div>
      )}
    </div>
  )
}
