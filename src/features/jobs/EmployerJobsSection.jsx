import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getEmployerJobs, getMyJobs, jobKeys } from '../../api/jobs'
import Pagination from '../../components/Pagination'
import JobList from './JobList'

export default function EmployerJobsSection({ employerId, isOwnProfile = false }) {
  const [page, setPage] = useState(1)
  const params = page > 1 ? { page } : {}
  // Employers see their own posts through the private endpoint, so this section
  // carries the same data (applicant counts, every status) as their dashboard.
  const { data, isPending, isError } = useQuery({
    queryKey: isOwnProfile ? jobKeys.mineList({ page }) : jobKeys.employerList(employerId, { page }),
    queryFn: () => (isOwnProfile ? getMyJobs(params) : getEmployerJobs(employerId, params)),
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
