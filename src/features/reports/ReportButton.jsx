import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import ReportModal from './ReportModal'

/**
 * A small "Report" affordance shown on job posts, profiles, and reviews.
 * Guests can view those pages but not act, so a guest click bounces to /login
 * (the same guest-CTA rule the rest of the app follows). Once a report lands
 * the button flips to a confirmed, disabled state for the rest of the session.
 */
export default function ReportButton({ reportableType, reportableId, className = '', size = 'md' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reported, setReported] = useState(false)

  // Compact variant for dense contexts (each review row); merged over the
  // ghost variant's own style, and it survives Button's hover reset because
  // that reapplies the passed style on mouse-leave.
  const compact = size === 'sm' ? { padding: '4px 10px', fontSize: '12px' } : undefined

  function handleClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setOpen(true)
  }

  if (reported) {
    return (
      <Button variant="ghost" type="button" disabled className={className} style={compact}>
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
        Reported
      </Button>
    )
  }

  return (
    <>
      <Button variant="ghost" type="button" onClick={handleClick} className={className} style={compact}>
        <Flag className="size-3.5 shrink-0" aria-hidden="true" />
        Report
      </Button>

      {open && (
        <ReportModal
          reportableType={reportableType}
          reportableId={reportableId}
          open={open}
          onClose={() => setOpen(false)}
          onReported={() => setReported(true)}
        />
      )}
    </>
  )
}
