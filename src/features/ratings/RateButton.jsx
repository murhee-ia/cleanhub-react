import { useState } from 'react'
import { Star } from 'lucide-react'
import Button from '../../components/Button'
import RateModal from './RateModal'

// Rendered wherever a completed application is visible to either side. Hidden
// once the current viewer already rated it — `viewer_has_rated` comes straight
// from the backend, since "already rated" can be true from a previous session,
// not just this one.
export default function RateButton({ application, jobPostId, className = '' }) {
  const [open, setOpen] = useState(false)

  if (application.status !== 'completed' || application.viewer_has_rated) return null

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
