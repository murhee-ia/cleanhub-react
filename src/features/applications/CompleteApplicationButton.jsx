import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Button from '../../components/Button'
import CompleteApplicationModal from './CompleteApplicationModal'

// Shown on accepted applications in MyApplications. The cleaner triggers
// this to submit proof and mark their side of the job as complete, which
// then unlocks their ability to leave a rating.
export default function CompleteApplicationButton({ application, className = '' }) {
  const [open, setOpen] = useState(false)

  if (application.status !== 'accepted') return null

  return (
    <>
      <Button
        variant="complete"
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
        Mark as complete
      </Button>
      <CompleteApplicationModal
        application={application}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
