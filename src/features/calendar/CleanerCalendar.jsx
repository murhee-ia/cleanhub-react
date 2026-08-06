import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useNavigate } from 'react-router-dom'
import { jobDetailPath } from '../../lib/helpers/paths'
import { ROLES } from '../../lib/helpers/roles'

// Month view of the cleaner's accepted/completed jobs. Clicking an event opens
// the job detail page (Phase 5's view), which already shows the cleaner's own
// application status — no separate detail modal needed.
export default function CleanerCalendar({ events }) {
  const navigate = useNavigate()

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      height="auto"
      events={events}
      eventClick={(info) => {
        navigate(jobDetailPath(info.event.extendedProps.jobId, ROLES.CLEANER))
      }}
    />
  )
}
