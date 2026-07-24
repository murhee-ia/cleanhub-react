import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import GuestJobFeed from '../features/jobs/GuestJobFeed'
import CleanerJobFeed from '../features/jobs/CleanerJobFeed'

export default function JobsPage() {
  const { user } = useAuth()
  const isCleaner = user?.role === 'cleaner'

  // Only cleaners get the searchable/filterable feed; guests and other roles
  // (employer/moderator/admin) see the plain browse view.
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-3xl text-foreground">Browse cleaning jobs</h1>
        {isCleaner && (
          <Link
            to="/cleaner/saved-jobs"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <Bookmark className="size-4" aria-hidden="true" />
            Saved jobs
          </Link>
        )}
      </div>
      {isCleaner ? <CleanerJobFeed /> : <GuestJobFeed />}
    </main>
  )
}
