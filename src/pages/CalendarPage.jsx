import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents, applicationKeys } from '../api/applications'
import { toCalendarEvent } from '../features/calendar/toCalendarEvent'
import CleanerCalendar from '../features/calendar/CleanerCalendar'
import PaperCard from '../components/PaperCard'

export default function CalendarPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: applicationKeys.calendar(),
    queryFn: getCalendarEvents,
  })

  const events = (data ?? []).map(toCalendarEvent)

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <p className="page-breadcrumb">CLEANER · CALENDAR</p>

      <div className="page-header">
        <h1>Calendar</h1>
      </div>

      <p className="text-sm text-muted">Jobs you've been accepted for, and jobs you've completed.</p>

      <div className="mt-2">
        {isPending ? (
          <p className="text-muted">Loading your calendar…</p>
        ) : isError ? (
          <p className="text-danger">Something went wrong loading your calendar. Please try again.</p>
        ) : (
          <PaperCard flat className="p-3 sm:p-5">
            <CleanerCalendar events={events} />
          </PaperCard>
        )}
      </div>
    </div>
  )
}
