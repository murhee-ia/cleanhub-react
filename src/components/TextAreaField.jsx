import { forwardRef } from 'react'

const TextAreaField = forwardRef(function TextAreaField(
  { label, error, id, footer, className = '', ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          style={{
            fontFamily: 'var(--heading)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`neo-input ${className}`}
        style={{ minHeight: '112px', resize: 'vertical' }}
        {...props}
      />
      {(error || footer) && (
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p style={{ fontSize: '13px', color: 'var(--color-danger)', fontWeight: 500 }}>
              {error}
            </p>
          ) : (
            <span />
          )}
          {footer}
        </div>
      )}
    </div>
  )
})

export default TextAreaField
