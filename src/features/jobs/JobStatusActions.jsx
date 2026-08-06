import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobStatus, jobKeys } from '../../api/jobs'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../lib/helpers/roles'
import Button from '../../components/Button'

// The forward-only flow the backend enforces: a post may skip ahead but never
// move back, and `completed` is terminal. Statuses absent from this map (a
// moderator's `removed`) simply offer no actions.
const NEXT_ACTIONS = {
  open: [
    { status: 'reviewing', label: 'Review now', variant: 'secondary' },
    { status: 'closed', label: 'Close applications', variant: 'ghost' },
  ],
  reviewing: [{ status: 'closed', label: 'Close applications', variant: 'ghost' }],
  closed: [{ status: 'completed', label: 'Mark as completed', variant: 'primary' }],
  completed: [],
}

const FULL_WIDTH = { width: '100%', padding: '12px' }

// Status transition buttons for the employer who owns the post, rendered inside
// the job detail sidebar's CTA stack. Self-gating like SaveJobButton: it renders
// nothing for anyone else.
export default function JobStatusActions({ job }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: (status) => updateJobStatus(job.id, status),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })

  const isOwner = user?.role === ROLES.EMPLOYER && job.employer?.id === user.id
  // A draft's status is locked server-side until it is published.
  if (!isOwner || job.visibility !== 'published') return null

  const actions = NEXT_ACTIONS[job.status] ?? []
  const errorMessage = error
    ? (error.response?.data?.message ?? 'Could not update this job post. Please try again.')
    : null

  // A fragment, not a container: these buttons are direct children of the
  // sidebar's CTA stack so they share its spacing instead of forming their own
  // boxed section. The post's status is already badged at the top of the page.
  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          variant={action.variant}
          onClick={() => mutate(action.status)}
          disabled={isPending}
          style={FULL_WIDTH}
        >
          {action.label}
        </Button>
      ))}

      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
    </>
  )
}
