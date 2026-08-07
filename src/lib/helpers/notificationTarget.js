import { jobDetailPath } from './paths'

// Maps a notification's `type` (set by the backend's ApplicationNotification
// subclasses) to the page it should open. Accepted/rejected/reminder always
// go to a cleaner, new-applicant/withdrawn always go to an employer — see
// NotificationController's dispatch sites — so `role` here is just the
// current viewer's own role, not something read off the notification.
export function notificationTargetPath(notification, role) {
  switch (notification.type) {
    case 'application_accepted':
    case 'application_rejected':
    case 'job_reminder':
      return jobDetailPath(notification.cleaning_job_post_id, role)
    case 'new_applicant':
    case 'application_withdrawn':
      return `/employer/jobs/${notification.cleaning_job_post_id}/applicants`
    default:
      return null
  }
}
