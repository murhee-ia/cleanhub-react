import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMyProfile, updateMyProfile, profileKeys } from '../api/profile'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../lib/helpers/roles'
import CleanerProfileForm from '../features/profile/CleanerProfileForm'
import EmployerProfileForm from '../features/profile/EmployerProfileForm'
import CleanerProfileView from '../features/profile/CleanerProfileView'
import EmployerProfileView from '../features/profile/EmployerProfileView'

function StatusMessage({ children }) {
  return (
    <div className="page-content">
      <p style={{ color: 'var(--color-muted)', padding: '40px 0', textAlign: 'center' }}>{children}</p>
    </div>
  )
}

/**
 * OwnProfilePage — handles two views:
 *   view="profile"  → shows the cleaner/employer profile view (read-only display)
 *   view="edit"     → shows the edit form
 */
export default function OwnProfilePage({ view = 'profile' }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useQuery({
    queryKey: profileKeys.me(),
    queryFn: getMyProfile,
  })
  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => queryClient.setQueryData(profileKeys.me(), updated),
  })

  if (isPending) return <StatusMessage>Loading your profile…</StatusMessage>
  if (isError)   return <StatusMessage>Couldn't load your profile. Try again shortly.</StatusMessage>

  const role = user?.role
  const isEmployer = role === ROLES.EMPLOYER

  // ── Edit form view ──
  if (view === 'edit') {
    const breadcrumb = isEmployer ? 'EMPLOYER · EDIT PROFILE' : 'CLEANER · EDIT PROFILE'
    const Form = isEmployer ? EmployerProfileForm : CleanerProfileForm
    return (
      <div className="page-content">
        <p className="page-breadcrumb">{breadcrumb}</p>
        <div className="page-header">
          <h1>Edit profile</h1>
          <Link
            to={isEmployer ? '/employer/profile' : '/cleaner/profile'}
            style={{
              fontFamily: 'var(--heading)',
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius)',
              padding: '6px 14px',
            }}
          >
            ← View profile
          </Link>
        </div>
        <Form initialData={data} onSubmit={(formData) => mutation.mutateAsync(formData)} />
      </div>
    )
  }

  // ── Profile view ──
  const breadcrumb = isEmployer ? 'EMPLOYER · MY PROFILE' : 'CLEANER · MY PROFILE'
  const ProfileView = isEmployer ? EmployerProfileView : CleanerProfileView

  return (
    <div className="page-content">
      <p className="page-breadcrumb">{breadcrumb}</p>
      <ProfileView profile={data} isOwnProfile />
    </div>
  )
}
