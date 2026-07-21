import { forwardRef, useState } from 'react'

// Matches a File's mime type against an `accept` list (exact types or wildcards
// like `image/*`). Mirrors the backend's hard validation, which is the real gate.
function matchesAccept(fileType, accept) {
  return accept
    .split(',')
    .map((entry) => entry.trim())
    .some((entry) => (entry.endsWith('/*') ? fileType.startsWith(entry.slice(0, -1)) : fileType === entry))
}

const FileInput = forwardRef(function FileInput(
  {
    label,
    hint,
    error,
    id,
    accept = 'application/pdf',
    multiple = false,
    maxSizeMb,
    invalidMessage = 'Unsupported file type.',
    onChange,
    ...props
  },
  ref,
) {
  const [names, setNames] = useState([])
  const [typeError, setTypeError] = useState('')

  function handleChange(event) {
    const files = Array.from(event.target.files ?? [])
    let message = ''
    if (files.some((file) => !matchesAccept(file.type, accept))) {
      message = invalidMessage
    } else if (maxSizeMb && files.some((file) => file.size > maxSizeMb * 1024 * 1024)) {
      message = `Each file must be under ${maxSizeMb} MB.`
    }
    setTypeError(message)
    setNames(files.map((file) => file.name))
    onChange?.(event)
  }

  const shownError = error || typeError

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        aria-invalid={shownError ? true : undefined}
        className="rounded-md border bg-surface px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:font-medium file:text-white hover:file:bg-primary-hover"
        style={{ borderColor: shownError ? 'var(--color-danger)' : 'var(--border)' }}
        {...props}
      />
      {hint && !shownError && <p className="text-sm text-muted">{hint}</p>}
      {names.length > 0 && (
        <ul className="text-sm text-muted">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
      {shownError && <p className="text-sm text-danger">{shownError}</p>}
    </div>
  )
})

export default FileInput
