import { useState } from 'react'
import { Check, X, ArrowUpCircle, EyeOff, AlertTriangle } from 'lucide-react'
import {
  resolveReport,
  rejectReport,
  escalateReport,
  hideReportedContent,
  warnReportedUser,
} from '../../api/reports'
import { formatTimestampDate } from '../../lib/helpers/datetime'
import { useReportActions } from './useReportActions'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'
import ReportStatusBadge from './ReportStatusBadge'

const TYPE_LABELS = {
  user: 'User',
  job_post: 'Job post',
  rating: 'Review',
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        style={{ fontFamily: 'var(--heading)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-muted)' }}
      >
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
        {children}
      </span>
    </div>
  )
}

/**
 * A report's detail plus the five moderator actions. Hiding is only offered for
 * content that can be hidden (a job post or review, not a user); every action
 * carries the optional note typed here and closes the modal once it lands.
 */
export default function ReportDetailModal({ report, open, onClose }) {
  const [note, setNote] = useState('')
  const actions = useReportActions()

  if (!report) return null

  const isClosed = ['resolved', 'rejected'].includes(report.status)
  const canHide = report.reportable_type !== 'user'

  function run(actionFn) {
    actions.mutate(
      { actionFn, id: report.id, note: note || undefined },
      { onSuccess: () => { setNote(''); onClose() } },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={`Report #${report.id}`} size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <ReportStatusBadge status={report.status} />
          <span className="text-xs text-muted">
            {TYPE_LABELS[report.reportable_type] ?? report.reportable_type} · filed{' '}
            {formatTimestampDate(report.created_at)}
          </span>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
          <Field label="Reported target">
            {report.target?.label || '—'}
            {report.target?.stars ? ` · ${report.target.stars}★` : ''}
          </Field>
          <Field label="Filed by">
            {report.reporter?.name} <span className="text-muted">({report.reporter?.role})</span>
          </Field>
        </div>

        <Field label="Reason">
          <span style={{ whiteSpace: 'pre-wrap' }}>{report.reason}</span>
        </Field>

        {report.resolution_note && <Field label="Note on file">{report.resolution_note}</Field>}

        {!isClosed && (
          <>
            <TextAreaField
              id="report-note"
              label="Note (optional)"
              placeholder="Add context for the audit trail or the warning…"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <Button variant="complete" type="button" disabled={actions.isPending} onClick={() => run(resolveReport)}>
                <Check className="size-4 shrink-0" aria-hidden="true" /> Resolve
              </Button>
              <Button variant="dark" type="button" disabled={actions.isPending} onClick={() => run(rejectReport)}>
                <X className="size-4 shrink-0" aria-hidden="true" /> Reject
              </Button>
              <Button variant="secondary" type="button" disabled={actions.isPending} onClick={() => run(escalateReport)}>
                <ArrowUpCircle className="size-4 shrink-0" aria-hidden="true" /> Escalate
              </Button>
              <Button variant="danger" type="button" disabled={actions.isPending || !canHide} onClick={() => run(hideReportedContent)}>
                <EyeOff className="size-4 shrink-0" aria-hidden="true" /> Hide content
              </Button>
              <Button variant="danger" type="button" disabled={actions.isPending} onClick={() => run(warnReportedUser)}>
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> Warn user
              </Button>
            </div>

            {!canHide && (
              <p className="text-xs text-muted">
                A reported user has no content to hide — warn or resolve instead.
              </p>
            )}
            {actions.isError && (
              <p className="text-sm text-danger">That action didn't go through. Please try again.</p>
            )}
          </>
        )}

        {isClosed && (
          <p className="text-sm text-muted">This report is closed. No further action is needed.</p>
        )}
      </div>
    </Modal>
  )
}
