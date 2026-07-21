import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, updateMyProfile, profileKeys } from '../api/profile'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../lib/helpers/roles'
import CleanerProfileForm from '../features/profile/CleanerProfileForm'
import EmployerProfileForm from '../features/profile/EmployerProfileForm'

function StatusMessage({ children }) {
  return <main className="mx-auto max-w-3xl p-8 text-center text-muted">{children}</main>
}

export default function OwnProfilePage() {
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

  if (isPending) {
    return <StatusMessage>Loading your profile…</StatusMessage>
  }
  if (isError) {
    return <StatusMessage>Couldn’t load your profile. Try again shortly.</StatusMessage>
  }

  const Form = user?.role === ROLES.EMPLOYER ? EmployerProfileForm : CleanerProfileForm
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Form initialData={data} onSubmit={(formData) => mutation.mutateAsync(formData)} />
    </main>
  )
}
