import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema } from '../../lib/schemas/auth'
import { applyServerErrors } from '../../lib/formErrors'
import { useAuth } from '../../hooks/useAuth'
import AuthCard from '../../components/AuthCard'
import TextField from '../../components/TextField'
import Button from '../../components/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: '' },
  })

  const mutation = useMutation({
    mutationFn: registerUser,
    // Register returns { token, user }; the session is now stored, so the
    // (still-unverified) user lands on the verification notice.
    onSuccess: () => navigate('/verify-email', { replace: true }),
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Unable to create your account. Please try again.' })
      }
    },
  })

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join CleanHub as a cleaner or an employer"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            I am a…
          </label>
          <select
            id="role"
            className="rounded-md border bg-surface px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            style={{ borderColor: errors.role ? 'var(--color-danger)' : 'var(--border)' }}
            {...register('role')}
          >
            <option value="">Select…</option>
            <option value="cleaner">Cleaner — looking for cleaning work</option>
            <option value="employer">Employer — posting cleaning jobs</option>
          </select>
          {errors.role && <p className="text-sm text-danger">{errors.role.message}</p>}
        </div>
        <TextField
          id="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          id="password_confirmation"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
