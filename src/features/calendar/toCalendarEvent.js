// Colors mirror ApplicationStatusBadge's accepted/completed treatment, so an
// event on the calendar reads the same as its badge everywhere else in the app.
const STATUS_COLORS = {
  accepted: { background: 'var(--color-primary-subtle)', border: 'var(--color-foreground)' },
  completed: { background: 'var(--color-highlight)', border: 'var(--color-foreground)' },
}

// Maps one row of the calendar endpoint (an accepted/completed Application,
// embedding its full job) to a FullCalendar event object. A job without a
// start/end time renders as an all-day event, since there's no sub-day window
// to place it in.
export function toCalendarEvent(application) {
  const job = application.job
  const hasTimes = Boolean(job.start_time && job.end_time)
  const colors = STATUS_COLORS[application.status] ?? STATUS_COLORS.accepted

  return {
    id: String(application.id),
    title: job.title,
    start: hasTimes ? `${job.schedule_date}T${job.start_time}` : job.schedule_date,
    end: hasTimes ? `${job.schedule_date}T${job.end_time}` : job.schedule_date,
    allDay: !hasTimes,
    backgroundColor: colors.background,
    borderColor: colors.border,
    textColor: 'var(--color-foreground)',
    extendedProps: {
      jobId: job.id,
      employer: job.employer.name,
      location: [job.city, job.country].filter(Boolean).join(', '),
      status: application.status,
    },
  }
}
