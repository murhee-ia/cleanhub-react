import { useAuth } from '../hooks/useAuth'
import GuestJobFeed from '../features/jobs/GuestJobFeed'
import CleanerJobFeed from '../features/jobs/CleanerJobFeed'

export default function JobsPage() {
  const { user } = useAuth()

  // Only cleaners get the searchable/filterable feed; guests and other roles
  // (employer/moderator/admin) see the plain browse view.
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="m-0 font-serif text-3xl text-foreground">Browse cleaning jobs</h1>
      {user?.role === 'cleaner' ? <CleanerJobFeed /> : <GuestJobFeed />}
    </main>
  )
}
