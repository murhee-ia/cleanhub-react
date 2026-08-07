// Client-side mirror of ApplicationController::timeWindowsOverlap on the
// backend — a UX nicety only, the backend's 409 is the real enforcement (see
// root CLAUDE.md's "warn client-side, validate server-side" rule). A missing
// start/end time on either side means that job isn't scoped to a sub-day
// window, so it's treated as occupying the whole day.
function timeWindowsOverlap(a, b) {
  if (!a.start_time || !a.end_time || !b.start_time || !b.end_time) return true
  return a.start_time < b.end_time && b.start_time < a.end_time
}

// Finds the cleaner's already-accepted job (if any) whose schedule overlaps
// the target job, from the calendar endpoint's application list.
export function findAcceptedScheduleConflict(targetJob, calendarApplications) {
  return calendarApplications.find(
    (application) =>
      application.status === 'accepted' &&
      application.job.id !== targetJob.id &&
      application.job.schedule_date === targetJob.schedule_date &&
      timeWindowsOverlap(application.job, targetJob),
  )
}
