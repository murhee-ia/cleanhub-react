import { forwardRef } from 'react'

const TextAreaField = forwardRef(function TextAreaField(
  { label, error, id, footer, className = '', ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`min-h-28 rounded-md border bg-surface px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        style={{ borderColor: error ? 'var(--color-danger)' : 'var(--border)' }}
        {...props}
      />
      {(error || footer) && (
        <div className="flex items-center justify-between gap-2">
          {error ? <p className="text-sm text-danger">{error}</p> : <span />}
          {footer}
        </div>
      )}
    </div>
  )
})

export default TextAreaField
