import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema } from '../../lib/schemas/auth'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { forgotPassword } from '../../api/auth'
import AuthCard from '../../components/AuthCard'
import TextField from '../../components/TextField'
import Button from '../../components/Button'

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    },
  })

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new one"
      footer={
        <Link to="/login" className="text-primary underline">
          Back to sign in
        </Link>
      }
    >
      {mutation.isSuccess ? (
        <p className="text-muted">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
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
          {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
