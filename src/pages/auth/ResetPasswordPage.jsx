import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPasswordSchema } from '../../lib/schemas/auth'
import { applyServerErrors } from '../../lib/formErrors'
import { resetPassword } from '../../api/auth'
import AuthCard from '../../components/AuthCard'
import TextField from '../../components/TextField'
import Button from '../../components/Button'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: searchParams.get('email') ?? '' },
  })

  const mutation = useMutation({
    // token comes from the ?token= query param on the emailed reset link.
    mutationFn: (values) => resetPassword({ ...values, token }),
    onSuccess: () => navigate('/login', { replace: true }),
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', {
          message: 'Could not reset your password. The link may have expired.',
        })
      }
    },
  })

  return (
    <AuthCard
      title="Set a new password"
      footer={
        <Link to="/login" className="text-primary underline">
          Back to sign in
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          id="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          id="password_confirmation"
          type="password"
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Reset password'}
        </Button>
      </form>
    </AuthCard>
  )
}
