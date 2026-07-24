import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getEmployerJobs, jobKeys } from '../../api/jobs'
import Pagination from '../../components/Pagination'
import JobList from './JobList'

export default function EmployerJobsSection({ employerId }) {
  const [page, setPage] = useState(1)
  const { data, isPending, isError } = useQuery({
    queryKey: jobKeys.employerList(employerId, { page }),
    queryFn: () => getEmployerJobs(employerId, page > 1 ? { page } : {}),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-4">
      <JobList
        isPending={isPending}
        isError={isError}
        jobs={jobs}
        emptyMessage="This employer hasn’t posted any jobs yet."
        showEmployer={false}
      />
      {meta && <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />}
    </div>
  )
}
