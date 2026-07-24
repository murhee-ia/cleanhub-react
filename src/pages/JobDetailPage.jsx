import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJob, jobKeys } from '../api/jobs'
import JobDetailView from '../features/jobs/JobDetailView'

function StatusMessage({ children }) {
  return <main className="mx-auto max-w-3xl p-8 text-center text-muted">{children}</main>
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { data, isPending, isError, error } = useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => getJob(id),
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  })

  if (isPending) {
    return <StatusMessage>Loading job…</StatusMessage>
  }
  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <StatusMessage>
        {notFound ? 'Job post not found.' : 'Something went wrong loading this job.'}
      </StatusMessage>
    )
  }
  return (
    <main className="p-4 sm:p-6">
      <JobDetailView job={data} />
    </main>
  )
}
