import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getJobs, jobKeys } from '../../api/jobs'
import Pagination from '../../components/Pagination'
import JobList from './JobList'

// Guests browse published, open posts only — no search, filters, or sorting.
export default function GuestJobFeed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page')
  const filters = page ? { page } : {}

  const { data, isPending, isError } = useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getJobs(filters),
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
    <div className="mt-6">
      <JobList
        isPending={isPending}
        isError={isError}
        jobs={jobs}
        emptyMessage="No jobs available right now."
        hideStatus
      />
      {meta && (
        <div className="mt-8">
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}
