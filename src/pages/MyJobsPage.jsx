import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getMyJobs, jobKeys } from '../api/jobs'
import JobCard from '../features/jobs/JobCard'
import Pagination from '../components/Pagination'

export default function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page')
  const filters = page ? { page } : {}

  const { data, isPending, isError } = useQuery({
    queryKey: jobKeys.mineList(filters),
    queryFn: () => getMyJobs(filters),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  function goToPage(next) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('page', String(next))
      return params
    })
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-3xl text-foreground">My job posts</h1>
        <Link
          to="/employer/jobs/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-hover"
        >
          New job post
        </Link>
      </div>

      <div className="mt-8">
        {isPending ? (
          <p className="text-muted">Loading your job posts…</p>
        ) : isError ? (
          <p className="text-danger">Something went wrong loading your job posts.</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted">You haven’t posted any jobs yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} showVisibility />
            ))}
          </div>
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
    </main>
  )
}
