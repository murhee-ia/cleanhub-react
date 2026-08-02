import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJob, jobKeys } from '../api/jobs'
import { useAuth } from '../hooks/useAuth'
import PublicNavbar from '../components/PublicNavbar'
import JobDetailView from '../features/jobs/JobDetailView'

function StatusMessage({ children }) {
  return <div className="page-content"><p style={{ color: 'var(--color-muted)', padding: '40px 0' }}>{children}</p></div>
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const isGuest = !user

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
    return <StatusMessage>{notFound ? 'Job post not found.' : 'Something went wrong loading this job.'}</StatusMessage>
  }

  return (
    <>
      {isGuest && <PublicNavbar />}
      <div className="page-content">
        <JobDetailView job={data} />
      </div>
    </>
  )
}
