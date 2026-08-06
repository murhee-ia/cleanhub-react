import JobCard from './JobCard'

export default function JobList({
  isPending,
  isError,
  jobs,
  emptyMessage = 'No jobs found.',
  showEmployer = true,
  hideStatus = false,
  renderCard,
}) {
  if (isPending) {
    return <p className="text-muted">Loading jobs…</p>
  }
  if (isError) {
    return <p className="text-danger">Something went wrong loading jobs. Please try again.</p>
  }
  if (jobs.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
      {jobs.map((job) =>
        renderCard ? (
          renderCard(job)
        ) : (
          <JobCard key={job.id} job={job} showEmployer={showEmployer} hideStatus={hideStatus} />
        ),
      )}
    </div>
  )
}
