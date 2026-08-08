import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createReport } from '../../api/reports'
import { reportSchema } from '../../lib/schemas/reports'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'

const SUBJECT_LABELS = {
  user: 'this user',
  job_post: 'this job post',
  rating: 'this review',
}

// Files a report against one target. `reportableType` is 'user' | 'job_post' |
// 'rating'; the parent owns the open/close state and is told when a report
// lands so it can show a confirmed state.
export default function ReportModal({ reportableType, reportableId, open, onClose, onReported }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reportSchema), defaultValues: { reason: '' } })

  const mutation = useMutation({
    mutationFn: (values) => createReport({ reportableType, reportableId, reason: values.reason }),
    onSuccess: () => {
      reset()
      onReported?.()
      onClose()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not submit your report. Please try again.' })
      }
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Report ${SUBJECT_LABELS[reportableType] ?? 'this content'}`}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" form="report-form" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </>
      }
    >
      <form
        id="report-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <p className="text-sm text-muted">
          Tell a moderator what's wrong. Reports are reviewed privately — the person you're
          reporting won't see who filed it.
        </p>

        <TextAreaField
          id="report-reason"
          label="What's the problem?"
          placeholder="Describe the issue…"
          rows={5}
          error={errors.reason?.message}
          {...register('reason')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  )
}
