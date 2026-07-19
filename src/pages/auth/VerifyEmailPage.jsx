import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resendVerification } from '../../api/auth'
import AuthCard from '../../components/AuthCard'
import Button from '../../components/Button'

export default function VerifyEmailPage() {
  const mutation = useMutation({ mutationFn: resendVerification })

  return (
    <AuthCard
      title="Verify your email"
      subtitle="We sent a verification link to your inbox"
      footer={
        <Link to="/login" className="text-primary underline">
          Back to sign in
        </Link>
      }
    >
      <p className="text-muted">
        Click the link in that email to activate your account. You&apos;ll need a verified email
        before you can apply to or post jobs.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Sending…' : 'Resend email'}
        </Button>
        {mutation.isSuccess && <span className="text-sm text-muted">Sent — check your inbox.</span>}
      </div>
    </AuthCard>
  )
}
