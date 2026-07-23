import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getEmployerJobs, jobKeys } from '../../api/jobs'
import Pagination from '../../components/Pagination'
import JobCard from './JobCard'

export default function EmployerJobsSection({ employerId }) {
  const [page, setPage] = useState(1)
  const { data, isPending, isError } = useQuery({
    queryKey: jobKeys.employerList(employerId, { page }),
    queryFn: () => getEmployerJobs(employerId, page > 1 ? { page } : {}),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  if (isPending) {
    return <p className="text-muted">Loading job posts…</p>
  }
  if (isError) {
    return <p className="text-danger">Couldn’t load this employer’s job posts.</p>
  }
  if (jobs.length === 0) {
    return <p className="text-muted">This employer hasn’t posted any jobs yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <Pagination
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        onPageChange={setPage}
      />
    </div>
  )
}
