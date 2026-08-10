import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobStatus, publishJob, jobKeys } from '../../api/jobs'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../lib/helpers/roles'
import Button from '../../components/Button'
import CompleteJobPostModal from './CompleteJobPostModal'

// The forward-only flow the backend enforces: a post may skip ahead but never
// move back, and `completed` is terminal. Statuses absent from this map (a
// moderator's `removed`) simply offer no actions.
const NEXT_ACTIONS = {
  open: [
    { status: 'reviewing', label: 'Review now', variant: 'secondary' },
    { status: 'closed', label: 'Close applications', variant: 'dark' },
  ],
  reviewing: [{ status: 'closed', label: 'Close applications', variant: 'dark' }],
  closed: [{ status: 'completed', label: 'Mark as completed', variant: 'complete' }],
  completed: [],
}

const FULL_WIDTH = { width: '100%', padding: '12px' }

// Status transition buttons for the employer who owns the post, rendered inside
// the job detail sidebar's CTA stack. Self-gating like SaveJobButton: it renders
// nothing for anyone else.
//
// For draft posts, shows a "Publish job" button that transitions visibility from
// draft → published. For published posts, shows the forward-only status actions.
// The `completed` transition is special: it opens a modal that requires a proof
// file upload before the status change is submitted.
export default function JobStatusActions({ job }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [completeModalOpen, setCompleteModalOpen] = useState(false)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
    queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
    queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
  }

  const statusMutation = useMutation({
    mutationFn: (status) => updateJobStatus(job.id, status),
    onSettled: invalidate,
  })

  const publishMutation = useMutation({
    mutationFn: () => publishJob(job.id),
    onSettled: invalidate,
  })

  const isOwner = user?.role === ROLES.EMPLOYER && job.employer?.id === user.id
  if (!isOwner) return null

  // Draft: show only the Publish button — status changes are blocked until published.
  if (job.visibility === 'draft') {
    const publishErrorMessage = publishMutation.error
      ? (publishMutation.error.response?.data?.message ?? 'Could not publish this job post. Please try again.')
      : null

    return (
      <>
        <Button
          type="button"
          variant="primary"
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending}
          style={FULL_WIDTH}
        >
          {publishMutation.isPending ? 'Publishing…' : 'Publish job'}
        </Button>
        {publishErrorMessage && <p className="text-sm text-danger">{publishErrorMessage}</p>}
      </>
    )
  }

  const actions = NEXT_ACTIONS[job.status] ?? []
  const statusErrorMessage = statusMutation.error
    ? (statusMutation.error.response?.data?.message ?? 'Could not update this job post. Please try again.')
    : null

  // A fragment, not a container: these buttons are direct children of the
  // sidebar's CTA stack so they share its spacing instead of forming their own
  // boxed section. The post's status is already badged at the top of the page.
  return (
    <>
      {actions.map((action) =>
        action.status === 'completed' ? (
          // Completing requires proof upload — open the dedicated modal instead
          // of firing the status PATCH directly.
          <Button
            key="completed"
            type="button"
            variant={action.variant}
            onClick={() => setCompleteModalOpen(true)}
            style={FULL_WIDTH}
          >
            {action.label}
          </Button>
        ) : (
          <Button
            key={action.status}
            type="button"
            variant={action.variant}
            onClick={() => statusMutation.mutate(action.status)}
            disabled={statusMutation.isPending}
            style={FULL_WIDTH}
          >
            {action.label}
          </Button>
        )
      )}

      {statusErrorMessage && <p className="text-sm text-danger">{statusErrorMessage}</p>}

      <CompleteJobPostModal
        job={job}
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
      />
    </>
  )
}
