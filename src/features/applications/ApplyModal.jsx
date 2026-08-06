import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applyToJob, applicationKeys } from '../../api/applications'
import { jobKeys } from '../../api/jobs'
import { savedJobKeys } from '../../api/savedJobs'
import { applySchema, MESSAGE_WORD_LIMIT } from '../../lib/schemas/applications'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { MAX_DOCUMENT_MB } from '../../lib/helpers/fileLimits'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'
import FileInput from '../../components/FileInput'
import WordCounter from '../../components/WordCounter'

// The backend reports both apply rejections on `cleaning_job_post_id` — a field
// this form never renders — so they surface as a form-level error. Duplicate and
// closed-job differ only by message text (no machine-readable code exists
// anywhere in this API), which is enough because the two only differ in copy.
export default function ApplyModal({ job, open, onClose }) {
  const queryClient = useQueryClient()

  const [messageText, setMessageText] = useState('')

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
    onClose()
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
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-5"
        noValidate
      >
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
