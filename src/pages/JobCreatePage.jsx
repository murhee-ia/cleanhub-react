import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJob, jobKeys } from '../api/jobs'
import JobPostForm from '../features/jobs/JobPostForm'

export default function JobCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
      navigate(`/employer/jobs/${created.id}`)
    },
  })

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <JobPostForm onSubmit={(formData) => mutation.mutateAsync(formData)} />
    </main>
  )
}
