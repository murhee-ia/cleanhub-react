import { Check, X } from 'lucide-react'
import Button from '../../components/Button'
import { useApplicationDecision } from './useApplicationDecision'

// Accept/reject pair, rendered wherever a still-pending applicant can be
// decided. Renders nothing once the application has left `pending`.
// `message` is the optional note the cleaner will see with the decision — the
// list's quick actions leave it undefined, the drawer supplies its textarea.
export default function ApplicantActions({ application, jobPostId, message, className = '' }) {
  const { accept, reject, isDeciding, decisionError } = useApplicationDecision(
    application.id,
    jobPostId,
  )

  if (application.status !== 'pending') return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => accept(message)} disabled={isDeciding}>
          <Check className="size-4 shrink-0" aria-hidden="true" />
          Accept
        </Button>
        <Button variant="danger" type="button" onClick={() => reject(message)} disabled={isDeciding}>
          <X className="size-4 shrink-0" aria-hidden="true" />
          Reject
        </Button>
      </div>
      {decisionError && <p className="text-sm text-danger">{decisionError}</p>}
    </div>
  )
}
