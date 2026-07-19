export const ROLES = {
  CLEANER: 'cleaner',
  EMPLOYER: 'employer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
}

// Where each role lands after login. Moderators and admins share the admin area.
export function roleHome(role) {
  switch (role) {
    case ROLES.CLEANER:
      return '/cleaner'
    case ROLES.EMPLOYER:
      return '/employer'
    case ROLES.MODERATOR:
    case ROLES.ADMIN:
      return '/admin'
    default:
      return '/'
  }
}
