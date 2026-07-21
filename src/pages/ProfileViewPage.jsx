import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCleanerProfile, getEmployerProfile, profileKeys } from '../api/profile'
import CleanerProfileView from '../features/profile/CleanerProfileView'
import EmployerProfileView from '../features/profile/EmployerProfileView'

// Authenticated view of another user's profile, for /cleaners/:id and
// /employers/:id. `:id` is the user id. One component keeps the
// loading/error/not-found scaffolding DRY across both roles.
const CONFIG = {
  cleaner: { key: profileKeys.cleaner, fetch: getCleanerProfile, View: CleanerProfileView, noun: 'Cleaner' },
  employer: { key: profileKeys.employer, fetch: getEmployerProfile, View: EmployerProfileView, noun: 'Employer' },
}

function StatusMessage({ children }) {
  return <main className="mx-auto max-w-3xl p-8 text-center text-muted">{children}</main>
}

export default function ProfileViewPage({ role }) {
  const { id } = useParams()
  const { key, fetch, View, noun } = CONFIG[role]
  const { data, isPending, isError, error } = useQuery({
    queryKey: key(id),
    queryFn: () => fetch(id),
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  })

  if (isPending) {
    return <StatusMessage>Loading profile…</StatusMessage>
  }
  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <StatusMessage>
        {notFound ? `${noun} profile not found.` : 'Something went wrong loading this profile.'}
      </StatusMessage>
    )
  }
  return (
    <main className="p-4 sm:p-6">
      <View profile={data} />
    </main>
  )
}
