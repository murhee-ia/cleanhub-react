import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Building2, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../lib/helpers/datetime'
import { jobDetailPath } from '../../lib/helpers/paths'
import { ROLES } from '../../lib/helpers/roles'

const TOOLTIP_ID = 'calendar-event-tooltip'
const TOOLTIP_HALF_WIDTH = 152

function eventDetails(event) {
  return {
    id: event.id,
    title: event.title,
    ...event.extendedProps,
  }
}

function tooltipPosition(element) {
  const rect = element.getBoundingClientRect()
  const left = Math.min(
    Math.max(rect.left + rect.width / 2, TOOLTIP_HALF_WIDTH),
    window.innerWidth - TOOLTIP_HALF_WIDTH,
  )
  const placeBelow = rect.top < 190

  return {
    left,
    top: placeBelow ? rect.bottom + 8 : rect.top - 8,
    placement: placeBelow ? 'below' : 'above',
  }
}

function CalendarEventTooltip({ tooltip }) {
  if (!tooltip) return null

  const { details, position } = tooltip

  return createPortal(
    <div
      id={TOOLTIP_ID}
      className={`calendar-event-tooltip calendar-event-tooltip--${position.placement}`}
      style={{ left: position.left, top: position.top }}
      role="tooltip"
    >
      <div className="calendar-event-tooltip__heading">
        <p>{details.title}</p>
        <span className={`calendar-event-tooltip__status calendar-event-tooltip__status--${details.status}`}>
          {details.status}
        </span>
      </div>

      <dl className="calendar-event-tooltip__details">
        <div>
          <Building2 aria-hidden="true" />
          <dt className="sr-only">Employer</dt>
          <dd>{details.employer}</dd>
        </div>
        <div>
          <CalendarDays aria-hidden="true" />
          <dt className="sr-only">Date</dt>
          <dd>{formatDate(details.scheduleDate)}</dd>
        </div>
        <div>
          <Clock3 aria-hidden="true" />
          <dt className="sr-only">Time</dt>
          <dd>{details.timeRange}</dd>
        </div>
        {details.location && (
          <div>
            <MapPin aria-hidden="true" />
            <dt className="sr-only">Location</dt>
            <dd>{details.location}</dd>
          </div>
        )}
      </dl>

      <p className="calendar-event-tooltip__hint">Click to view job details</p>
    </div>,
    document.body,
  )
}

function CalendarLegend() {
  return (
    <div className="calendar-legend" aria-label="Calendar event colors">
      <span><i className="calendar-legend__swatch calendar-legend__swatch--accepted" />Accepted</span>
      <span><i className="calendar-legend__swatch calendar-legend__swatch--completed" />Completed</span>
      <small>Hover or focus an event for details</small>
    </div>
  )
}

// Month view of the cleaner's accepted/completed jobs. Clicking an event opens
// the job detail page, which already shows the cleaner's own
// application status — no separate detail modal needed.
export default function CleanerCalendar({ events }) {
  const navigate = useNavigate()
  const eventListeners = useRef(new WeakMap())
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const refreshTooltipPosition = () => {
      setTooltip((current) => {
        if (!current) return null
        if (!current.element.isConnected) return null

        return { ...current, position: tooltipPosition(current.element) }
      })
    }

    window.addEventListener('resize', refreshTooltipPosition)
    window.addEventListener('scroll', refreshTooltipPosition, true)

    return () => {
      window.removeEventListener('resize', refreshTooltipPosition)
      window.removeEventListener('scroll', refreshTooltipPosition, true)
    }
  }, [])

  function openEvent(event) {
    navigate(jobDetailPath(event.extendedProps.jobId, ROLES.CLEANER))
  }

  function showTooltip(event, element) {
    setTooltip({ details: eventDetails(event), element, position: tooltipPosition(element) })
  }

  function hideTooltip(eventId) {
    setTooltip((current) => current?.details.id === eventId ? null : current)
  }

  return (
    <>
      <CalendarLegend />
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next', center: 'title', right: 'today' }}
        height="auto"
        events={events}
        eventClick={({ event }) => openEvent(event)}
        eventMouseEnter={({ event, el }) => showTooltip(event, el)}
        eventMouseLeave={({ event, el }) => {
          if (document.activeElement !== el) hideTooltip(event.id)
        }}
        eventDidMount={({ event, el }) => {
          const label = `${event.title}. ${event.extendedProps.status}. ${event.extendedProps.employer}. ${event.extendedProps.timeRange}.`
          const handleFocus = () => {
            el.setAttribute('aria-describedby', TOOLTIP_ID)
            showTooltip(event, el)
          }
          const handleBlur = () => {
            el.removeAttribute('aria-describedby')
            hideTooltip(event.id)
          }
          const handleKeyDown = (keyboardEvent) => {
            if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
              keyboardEvent.preventDefault()
              openEvent(event)
            }
          }

          el.tabIndex = 0
          el.setAttribute('role', 'button')
          el.setAttribute('aria-label', label)
          el.addEventListener('focus', handleFocus)
          el.addEventListener('blur', handleBlur)
          el.addEventListener('keydown', handleKeyDown)
          eventListeners.current.set(el, { handleFocus, handleBlur, handleKeyDown })
        }}
        eventWillUnmount={({ event, el }) => {
          const listeners = eventListeners.current.get(el)
          if (listeners) {
            el.removeEventListener('focus', listeners.handleFocus)
            el.removeEventListener('blur', listeners.handleBlur)
            el.removeEventListener('keydown', listeners.handleKeyDown)
            eventListeners.current.delete(el)
          }
          el.removeAttribute('aria-describedby')
          hideTooltip(event.id)
        }}
      />
      <CalendarEventTooltip tooltip={tooltip} />
    </>
  )
}
