import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { roleHome } from '../lib/helpers/roles'

// Inverse of ProtectedRoute: keeps an already-signed-in user off guest-only
// pages (landing page, login, register, forgot/reset password) by sending
// them straight to their role's home instead. Route-level, so it catches
// direct navigation and every CTA/link that points at one of these paths.
// The query string is forwarded (e.g. the verify-email redirect's
// `?verified=1`) so a page reachable at the redirect target can still read it.
export default function GuestOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={`${roleHome(user?.role)}${location.search}`} replace />
  }

  return <Outlet />
}
