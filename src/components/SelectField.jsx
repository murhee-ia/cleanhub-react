import { forwardRef } from 'react'

const SelectField = forwardRef(function SelectField(
  { label, error, id, className = '', children, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`rounded-md border bg-surface px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        style={{ borderColor: error ? 'var(--color-danger)' : 'var(--border)' }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
})

export default SelectField
