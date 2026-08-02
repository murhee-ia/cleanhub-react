import { useAuth } from '../hooks/useAuth'
import PublicNavbar from '../components/PublicNavbar'
import GuestJobFeed from '../features/jobs/GuestJobFeed'
import CleanerJobFeed from '../features/jobs/CleanerJobFeed'

export default function JobsPage() {
  const { user } = useAuth()
  const isCleaner = user?.role === 'cleaner'
  const isGuest = !user

  return (
    <>
      {/* Public navbar only for unauthenticated / non-cleaner visitors */}
      {isGuest && <PublicNavbar />}

      <div className="page-content">
        {/* Breadcrumb */}
        <p className="page-breadcrumb">
          {isCleaner ? 'CLEANER · HOME FEED' : 'PUBLIC · GUEST ACCESS'}
        </p>

        <div className="page-header">
          <h1>Browse cleaning jobs</h1>
        </div>

        {isCleaner ? <CleanerJobFeed /> : <GuestJobFeed />}
      </div>
    </>
  )
}
