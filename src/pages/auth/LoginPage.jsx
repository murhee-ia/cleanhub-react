import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginSchema } from '../../lib/schemas/auth'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import { useAuth } from '../../hooks/useAuth'
import { isPathAllowedForRole, roleHome } from '../../lib/helpers/roles'
import AuthCard from '../../components/AuthCard'
import TextField from '../../components/TextField'
import Button from '../../components/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      const from = location.state?.from?.pathname
      const dest = from && isPathAllowedForRole(from, user?.role) ? from : roleHome(user?.role)
      navigate(dest, { replace: true })
    },
    onError: (error) => {
      // Bad credentials arrive as 422 under errors.email.
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Unable to sign in. Please try again.' })
      }
    },
  })

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your CleanHub account"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-primary underline">
            Create an account
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
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary underline">
            Forgot password?
          </Link>
        </div>
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
