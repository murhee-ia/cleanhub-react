import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import { applyToJob, getCalendarEvents, applicationKeys } from '../../api/applications'
import { jobKeys } from '../../api/jobs'
import { savedJobKeys } from '../../api/savedJobs'
import { applySchema, MESSAGE_WORD_LIMIT } from '../../lib/schemas/applications'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { MAX_DOCUMENT_MB } from '../../lib/helpers/fileLimits'
import { findAcceptedScheduleConflict } from '../../lib/helpers/scheduleConflict'
import { formatDate } from '../../lib/helpers/datetime'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'
import FileInput from '../../components/FileInput'
import WordCounter from '../../components/WordCounter'

// The backend reports the closed-job and duplicate-apply rejections on
// `cleaning_job_post_id` — a field this form never renders — so they surface
// as a form-level error, distinguished only by message text (no
// machine-readable code exists anywhere in this API for those two). A
// schedule conflict with an already-accepted job is reported separately, as
// its own 409, so it gets its own state and a caution-styled banner instead
// of sharing the plain danger-colored root error.
export default function ApplyModal({ job, open, onClose }) {
  const queryClient = useQueryClient()

  const [messageText, setMessageText] = useState('')
  const [scheduleConflictMessage, setScheduleConflictMessage] = useState(null)

  // Fetched only while the modal is open, so a cleaner who never applies never
  // pays for it. This is the client-side half of the overlap warning — a UX
  // nicety only, the backend's 409 on submit is the real enforcement.
  const { data: calendarApplications } = useQuery({
    queryKey: applicationKeys.calendar(),
    queryFn: getCalendarEvents,
    enabled: open,
  })
  const acceptedConflict = open
    ? findAcceptedScheduleConflict(job, calendarApplications ?? [])
    : null

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(applySchema), defaultValues: { message: '' } })

  const messageField = register('message')

  const mutation = useMutation({
    mutationFn: (values) =>
      applyToJob({
        cleaningJobPostId: job.id,
        message: values.message,
        resume: values.resume?.[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
      queryClient.invalidateQueries({ queryKey: savedJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(job.id) })
      reset()
      setMessageText('')
      onClose()
    },
    onError: (error) => {
      const fieldErrors = error?.response?.data?.errors
      const jobError = fieldErrors?.cleaning_job_post_id
      if (error?.response?.status === 409 && jobError) {
        setScheduleConflictMessage(Array.isArray(jobError) ? jobError[0] : String(jobError))
        return
      }
      if (jobError) {
        setError('root', { message: Array.isArray(jobError) ? jobError[0] : String(jobError) })
        return
      }
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not send your application. Please try again.' })
      }
    },
  })

  function handleClose() {
    reset()
    setMessageText('')
    setScheduleConflictMessage(null)
    onClose()
  }

  function handleFormSubmit(values) {
    setScheduleConflictMessage(null)
    mutation.mutate(values)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Apply to ${job.title}`}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="apply-form" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send application'}
          </Button>
        </>
      }
    >
      <form
        id="apply-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {(scheduleConflictMessage || acceptedConflict) && (
          <div
            className="flex items-start gap-2 text-sm"
            style={{
              background: 'var(--color-highlight-muted)',
              border: '1.5px solid var(--color-caution)',
              borderRadius: 'var(--radius)',
              padding: '0.625rem 0.875rem',
              color: 'var(--color-foreground)',
            }}
          >
            <TriangleAlert
              className="mt-0.5 shrink-0"
              style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-caution)' }}
              aria-hidden="true"
            />
            <span>
              {scheduleConflictMessage ?? (
                <>
                  This overlaps <strong>{acceptedConflict.job.title}</strong> on{' '}
                  {formatDate(acceptedConflict.job.schedule_date)}, which you're already accepted
                  for. You can still apply, but the schedule may conflict.
                </>
              )}
            </span>
          </div>
        )}

        <TextAreaField
          id="apply-message"
          label="Message to the employer (optional)"
          placeholder="Tell them why you're a good fit for this job."
          error={errors.message?.message}
          footer={<WordCounter text={messageText} limit={MESSAGE_WORD_LIMIT} />}
          {...messageField}
          onChange={(event) => {
            messageField.onChange(event)
            setMessageText(event.target.value)
          }}
        />

        <FileInput
          id="apply-resume"
          label="Resume / CV (optional)"
          hint={`PDF only, up to ${MAX_DOCUMENT_MB} MB.`}
          accept="application/pdf"
          maxSizeMb={MAX_DOCUMENT_MB}
          invalidMessage="Resume must be a PDF."
          error={errors.resume?.message}
          {...register('resume')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  )
}
