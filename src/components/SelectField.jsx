import { forwardRef } from 'react'

const SelectField = forwardRef(function SelectField(
  { label, error, id, className = '', children, ...props },
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
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`neo-input ${className}`}
        style={{ cursor: 'pointer' }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p style={{ fontSize: '13px', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  )
})

export default SelectField
