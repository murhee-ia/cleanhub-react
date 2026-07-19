import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// UX-only guard. The backend policies are the real authorization gate.
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/not-allowed" replace />
  }

  return <Outlet />
}
