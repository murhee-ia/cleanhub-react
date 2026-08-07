import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, MessageSquare, StickyNote, Send, UserRound } from 'lucide-react'
import {
  getApplicationDetail,
  updateApplicationNote,
  applicationKeys,
} from '../../api/applications'
import { applicationNoteSchema, DECISION_MESSAGE_MAX } from '../../lib/schemas/applications'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { cleanerProfilePath } from '../../lib/helpers/paths'
import { ROLES } from '../../lib/helpers/roles'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'
import { BoxCard } from '../profile/ProfileLayout'
import RateButton from '../ratings/RateButton'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import ApplicantActions from './ApplicantActions'

// This drawer is about the *application* — message, resume, private note and the
// decision. The cleaner's profile lives on its own page and is linked to rather
// than re-rendered here.
export default function ApplicantDrawer({ applicationId, jobPostId, onClose }) {
  const queryClient = useQueryClient()
  const open = applicationId != null

  const [decisionMessage, setDecisionMessage] = useState('')
  const [prevApplicationId, setPrevApplicationId] = useState(applicationId)

  // Drop a half-typed decision message when a different applicant is opened —
  // React's "adjust state on prop change during render" pattern, same as
  // SaveJobButton, so it costs no extra render pass.
  if (applicationId !== prevApplicationId) {
    setPrevApplicationId(applicationId)
    setDecisionMessage('')
  }

  const detailQuery = useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: () => getApplicationDetail(applicationId),
    enabled: open,
  })

  const application = detailQuery.data

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(applicationNoteSchema), defaultValues: { note: '' } })

  // Seed the note field once the application it belongs to has loaded.
  useEffect(() => {
    reset({ note: application?.private_note ?? '' })
  }, [application?.id, application?.private_note, reset])

  const noteMutation = useMutation({
    mutationFn: (values) => updateApplicationNote(applicationId, values.note || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
      queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(jobPostId) })
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not save the note. Please try again.' })
      }
    },
  })

  const isPendingDecision = application?.status === 'pending'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={application ? `Application · ${application.cleaner.full_name}` : 'Application'}
      footer={
        application ? (
          <>
            <ApplicantActions
              application={application}
              jobPostId={jobPostId}
              message={decisionMessage}
            />
            <RateButton application={application} jobPostId={jobPostId} />
            <Button variant="ghost" type="button" onClick={onClose}>
              Close
            </Button>
          </>
        ) : null
      }
    >
      {detailQuery.isPending ? (
        <p className="text-muted">Loading application…</p>
      ) : detailQuery.isError ? (
        <p className="text-danger">Something went wrong loading this application.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ApplicationStatusBadge status={application.status} />
            <Link
              to={cleanerProfilePath(application.cleaner.id, ROLES.EMPLOYER)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline"
            >
              <UserRound className="size-4 shrink-0" aria-hidden="true" />
              View full profile →
            </Link>
          </div>

          {application.message && (
            <BoxCard icon={MessageSquare} title="Message">
              <p className="text-sm whitespace-pre-line text-foreground">{application.message}</p>
            </BoxCard>
          )}

          <BoxCard icon={FileText} title="Resume">
            {application.resume_url ? (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary underline"
              >
                <FileText className="size-4 shrink-0" aria-hidden="true" />
                Open resume (PDF)
              </a>
            ) : (
              <p className="text-sm text-muted">No resume attached to this application.</p>
            )}
          </BoxCard>

          {isPendingDecision ? (
            <BoxCard icon={Send} title="Message to cleaner (optional)">
              <TextAreaField
                id="decision-message"
                aria-label="Message to cleaner"
                placeholder="Sent to the applicant with your accept or reject decision."
                maxLength={DECISION_MESSAGE_MAX}
                value={decisionMessage}
                onChange={(event) => setDecisionMessage(event.target.value)}
              />
            </BoxCard>
          ) : (
            application.decision_message && (
              <BoxCard icon={Send} title="Message sent to cleaner">
                <p className="text-sm whitespace-pre-line text-foreground">
                  {application.decision_message}
                </p>
              </BoxCard>
            )
          )}

          <BoxCard icon={StickyNote} title="Private note">
            <form
              onSubmit={handleSubmit((values) => noteMutation.mutate(values))}
              className="flex flex-col gap-3"
              noValidate
            >
              <TextAreaField
                id="applicant-note"
                aria-label="Private note"
                placeholder="Only you can see this note."
                error={errors.note?.message}
                {...register('note')}
              />
              {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
              <div className="flex items-center gap-3">
                <Button variant="ghost" type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Saving…' : 'Save note'}
                </Button>
                {noteMutation.isSuccess && !isDirty && (
                  <span className="text-sm text-muted">Saved</span>
                )}
              </div>
            </form>
          </BoxCard>
        </div>
      )}
    </Modal>
  )
}
