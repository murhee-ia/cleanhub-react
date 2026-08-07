export const ROLES = {
  CLEANER: 'cleaner',
  EMPLOYER: 'employer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
}

// Mirrors router.jsx's <ProtectedRoute roles={[...]}> guards — keep in sync when
// a role-guarded route tree is added or its allowed roles change.
const ROLE_ROUTE_GUARDS = [
  { prefix: '/cleaner', roles: [ROLES.CLEANER] },
  { prefix: '/employer', roles: [ROLES.EMPLOYER] },
  { prefix: '/moderator', roles: [ROLES.MODERATOR, ROLES.ADMIN] },
  { prefix: '/admin', roles: [ROLES.ADMIN] },
]

// A remembered `from` location can belong to a different role's area than the
// user who just signed in, which would bounce them straight to /not-allowed.
export function isPathAllowedForRole(urlPath, userRole) {
  const protectedArea = ROLE_ROUTE_GUARDS.find(
    (area) => urlPath === area.prefix || urlPath.startsWith(`${area.prefix}/`),
  )
  return !protectedArea || protectedArea.roles.includes(userRole)
}

// Where each role lands after login. A moderator lands in the moderation area
// (they can't reach the admin-only panel); the admin lands in the admin panel.
export function roleHome(role) {
  switch (role) {
    case ROLES.CLEANER:
      return '/cleaner'
    case ROLES.EMPLOYER:
      return '/employer'
    case ROLES.MODERATOR:
      return '/moderator'
    case ROLES.ADMIN:
      return '/admin'
    default:
      return '/'
  }
}
