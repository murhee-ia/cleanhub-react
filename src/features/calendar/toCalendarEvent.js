const CALENDAR_EVENT_STATUSES = new Set(['accepted', 'completed'])

// Maps one row of the calendar endpoint (an accepted/completed Application,
// embedding its full job) to a FullCalendar event object. A job without a
// start/end time renders as an all-day event, since there's no sub-day window
// to place it in.
export function toCalendarEvent(application) {
  const job = application.job
  const hasTimes = Boolean(job.start_time && job.end_time)
  const status = CALENDAR_EVENT_STATUSES.has(application.status) ? application.status : 'accepted'

  return {
    id: String(application.id),
    title: job.title,
    start: hasTimes ? `${job.schedule_date}T${job.start_time}` : job.schedule_date,
    end: hasTimes ? `${job.schedule_date}T${job.end_time}` : job.schedule_date,
    allDay: !hasTimes,
    // Timed events default to FullCalendar's transparent "dot" rendering in
    // month view. A block display lets the status class paint the whole event.
    display: 'block',
    classNames: [`calendar-event--${status}`],
    extendedProps: {
      jobId: job.id,
      employer: job.employer?.name ?? 'Employer not listed',
      location: [job.city, job.country].filter(Boolean).join(', '),
      scheduleDate: job.schedule_date,
      timeRange: hasTimes ? `${job.start_time}–${job.end_time}` : 'Time not specified',
      status,
    },
  }
}
