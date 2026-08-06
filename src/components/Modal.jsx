import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const WIDTHS = {
  md: '34rem',
  lg: '52rem',
}

/**
 * Modal — generic neo-brutalist dialog: dimmed backdrop, Escape/backdrop-click
 * to close, and Tab cycling trapped inside the panel. Rendered through a portal
 * so an ancestor's overflow or stacking context can't clip it.
 */
export default function Modal({ open, onClose, title, size = 'md', children, footer }) {
  const panelRef = useRef(null)
  const titleId = useId()

  // Consumers pass a fresh `onClose` on every render, so it can't be a dependency
  // of the effect below — re-running it would re-focus the panel (stealing focus
  // from whatever the user is typing in) on every keystroke.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    panelRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      role="presentation"
      // mousedown (not click) so a drag that starts inside the panel and ends on
      // the backdrop doesn't close the dialog.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(26, 26, 26, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="paper-flat w-full"
        style={{
          maxWidth: WIDTHS[size] ?? WIDTHS.md,
          maxHeight: 'calc(100dvh - 2rem)',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px 20px',
            borderBottom: '2px solid var(--border)',
          }}
        >
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--heading)',
              fontWeight: 700,
              fontSize: '17px',
              color: 'var(--color-foreground)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 cursor-pointer rounded border-none bg-transparent p-1.5 text-foreground hover:bg-highlight-soft"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px' }}>{children}</div>

        {footer && (
          <div
            className="flex flex-wrap items-center justify-end gap-3"
            style={{ padding: '14px 20px', borderTop: '2px solid var(--border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
