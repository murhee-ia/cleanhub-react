import { FileText, MessageSquare } from 'lucide-react'
import { formatTimestampDate } from '../../lib/helpers/datetime'
import WithdrawButton from './WithdrawButton'

// The application-side detail shown under a JobCard on the cleaner's list: what
// they sent, and the withdraw action while the application is still pending.
// The status itself is already on the card's badge row.
export default function ApplicationCardFooter({ application }) {
  if (!application) return null

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-muted">Applied {formatTimestampDate(application.created_at)}</p>

      {application.message && (
        <p className="text-sm whitespace-pre-line text-foreground">{application.message}</p>
      )}

      {application.resume_url && (
        <a
          href={application.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary underline"
        >
          <FileText className="size-4 shrink-0" aria-hidden="true" />
          Resume sent
        </a>
      )}

      {application.decision_message && (
        <div className="border-l-2 border-primary pl-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase">
            <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" />
            From the employer
          </p>
          <p className="mt-1 text-sm whitespace-pre-line text-foreground">
            {application.decision_message}
          </p>
        </div>
      )}

      {application.status === 'pending' && <WithdrawButton application={application} />}
    </div>
  )
}
