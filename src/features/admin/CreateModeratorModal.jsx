import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createModerator, adminKeys } from '../../api/admin'
import { moderatorSchema } from '../../lib/schemas/admin'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextField from '../../components/TextField'

// The only place a moderator account is created. The new account is pre-verified
// server-side, so there's no email verification step to surface here.
export default function CreateModeratorModal({ open, onClose }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(moderatorSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
  })

  const mutation = useMutation({
    mutationFn: createModerator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.moderators() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
      reset()
      onClose()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not create the moderator. Please try again.' })
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
      title="New moderator"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="moderator-form" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create moderator'}
          </Button>
        </>
      }
    >
      <form
        id="moderator-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextField id="moderator-name" label="Name" error={errors.name?.message} {...register('name')} />
        <TextField id="moderator-email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <TextField id="moderator-password" label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <TextField
          id="moderator-password-confirmation"
          label="Confirm password"
          type="password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  )
}
