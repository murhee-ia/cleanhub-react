import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../lib/helpers/roles'
import Button from '../../components/Button'
import RateModal from './RateModal'

// Shown to either party once their own side of the job is completed:
//   - Cleaner: visible when application.status === 'completed' (cleaner marked their side done)
//   - Employer: visible when the job post status is 'completed' (employer marked their side done)
//
// Hidden once the viewer has already submitted a rating (viewer_has_rated).
// `viewer_has_rated` comes from the backend so it persists across sessions.
export default function RateButton({ application, jobPostId, className = '' }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const isCleaner = user?.role === ROLES.CLEANER

  // Determine whether the current viewer has unlocked their rating side.
  const canRate = isCleaner
    ? application.status === 'completed'
    // Employer side: backend sends viewer_has_rated only when job post is completed;
    // presence of the field (even false) means the employer's side is done.
    : application.viewer_has_rated !== undefined

  if (!canRate || application.viewer_has_rated) return null

  return (
    <>
      <Button variant="secondary" type="button" onClick={() => setOpen(true)} className={className}>
        <Star className="size-4 shrink-0" aria-hidden="true" />
        Rate this job
      </Button>
      <RateModal
        application={application}
        jobPostId={jobPostId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
