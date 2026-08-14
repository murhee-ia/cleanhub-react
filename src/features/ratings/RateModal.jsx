import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitRating, ratingKeys } from '../../api/ratings'
import { applicationKeys } from '../../api/applications'
import { profileKeys } from '../../api/profile'
import { ratingSchema } from '../../lib/schemas/ratings'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../lib/helpers/roles'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextAreaField from '../../components/TextAreaField'
import StarInput from './StarInput'

// `jobPostId` is only needed on the employer side, where the application
// object never embeds the job (see ApplicationResource) — the caller already
// has it from its own route/page context, same as ApplicantActions.
export default function RateModal({ application, jobPostId, open, onClose }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isCleaner = user?.role === ROLES.CLEANER

  const revieweeName = isCleaner ? application.job?.employer?.name : application.cleaner?.full_name
  const revieweeId = isCleaner ? application.job?.employer?.id : application.cleaner?.id

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(ratingSchema), defaultValues: { stars: 0, text: '' } })

  const mutation = useMutation({
    mutationFn: (values) =>
      submitRating({
        applicationId: application.id,
        stars: values.stars,
        text: values.text
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: applicationKeys.calendar() })
      const targetJobId = application.job?.id ?? jobPostId
      if (targetJobId) {
        queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(targetJobId) })
      }
      queryClient.invalidateQueries({ queryKey: ratingKeys.lists() })
      if (revieweeId) {
        queryClient.invalidateQueries({
          queryKey: isCleaner ? profileKeys.employer(revieweeId) : profileKeys.cleaner(revieweeId),
        })
      }
      reset()
      onClose()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not send your rating. Please try again.' })
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
      title={revieweeName ? `Rate ${revieweeName}` : 'Rate this job'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="rate-form" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Submit rating'}
          </Button>
        </>
      }
    >
      <form
        id="rate-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-5"
        noValidate
      >
        <Controller
          name="stars"
          control={control}
          render={({ field }) => (
            <StarInput value={field.value} onChange={field.onChange} error={errors.stars?.message} />
          )}
        />

        <TextAreaField
          id="rate-text"
          label="Review (optional)"
          placeholder="How did it go?"
          error={errors.text?.message}
          {...register('text')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  )
}
