import { ROLES } from './roles'

// Job/employer/cleaner detail pages exist both as public top-level routes
// (guests) and mirrored under /cleaner and /employer (so signed-in users keep
// their sidebar layout instead of dropping into the bare public route).
// These helpers pick the right prefix for the current viewer.

export function jobDetailPath(jobId, role) {
  if (role === ROLES.CLEANER) return `/cleaner/jobs/${jobId}`
  if (role === ROLES.EMPLOYER) return `/employer/jobs/${jobId}`
  return `/jobs/${jobId}`
}

export function employerProfilePath(employerId, role) {
  if (role === ROLES.CLEANER) return `/cleaner/employers/${employerId}`
  return `/employers/${employerId}`
}

export function cleanerProfilePath(cleanerId, role) {
  if (role === ROLES.EMPLOYER) return `/employer/cleaners/${cleanerId}`
  return `/cleaners/${cleanerId}`
}
