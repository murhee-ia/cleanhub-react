import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getJobApplicants, applicationKeys } from '../api/applications'
import { getJob, jobKeys } from '../api/jobs'
import ApplicantRow from '../features/applications/ApplicantRow'
import ApplicantDrawer from '../features/applications/ApplicantDrawer'
import PaperCard from '../components/PaperCard'
import Pagination from '../components/Pagination'

export default function JobApplicantsPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page')
  const filters = page ? { page } : {}

  const [openApplicationId, setOpenApplicationId] = useState(null)

  const jobQuery = useQuery({ queryKey: jobKeys.detail(id), queryFn: () => getJob(id) })

  const { data, isPending, isError } = useQuery({
    queryKey: applicationKeys.byJobList(id, filters),
    queryFn: () => getJobApplicants(id, filters),
    placeholderData: keepPreviousData,
  })

  const applicants = data?.data ?? []
  const meta = data?.meta
  // Withdrawn applications are excluded from `data` by the backend and reported
  // only as a count, so the employer still knows they happened.
  const withdrawnCount = meta?.withdrawn_count ?? 0

  const countLabel = meta
    ? `${meta.total} ${meta.total === 1 ? 'applicant' : 'applicants'}` +
      (withdrawnCount > 0 ? ` · ${withdrawnCount} withdrawn` : '')
    : ''

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
      <p className="page-breadcrumb">EMPLOYER · APPLICANTS</p>

      <div className="page-header">
        <h1>Applicants</h1>
      </div>

      {jobQuery.data && (
        <p className="mt-2 text-sm text-muted">
          for{' '}
          <Link to={`/employer/jobs/${id}`} className="text-primary underline">
            {jobQuery.data.title}
          </Link>
        </p>
      )}

      <p className="mt-6 min-h-5 text-sm text-muted" aria-live="polite">
        {countLabel}
      </p>

      <div className="mt-2">
        {isPending ? (
          <p className="text-muted">Loading applicants…</p>
        ) : isError ? (
          <p className="text-danger">Something went wrong loading applicants. Please try again.</p>
        ) : applicants.length === 0 ? (
          <p className="text-muted">
            {withdrawnCount > 0
              ? 'No active applicants — everyone who applied has withdrawn.'
              : 'No one has applied to this job yet.'}
          </p>
        ) : (
          <PaperCard flat className="flex flex-col divide-y-2 divide-[var(--border)] p-2 sm:p-4">
            {applicants.map((application) => (
              <ApplicantRow
                key={application.id}
                application={application}
                jobPostId={id}
                onReview={() => setOpenApplicationId(application.id)}
              />
            ))}
          </PaperCard>
        )}
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

      <ApplicantDrawer
        applicationId={openApplicationId}
        jobPostId={id}
        onClose={() => setOpenApplicationId(null)}
      />
    </div>
  )
}
