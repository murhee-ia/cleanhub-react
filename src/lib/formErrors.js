// Maps a Laravel 422 response ({ message, errors: { field: [msg] } }) onto
// React Hook Form field errors. Returns true if any field error was applied.
export function applyServerErrors(error, setError) {
  const fieldErrors = error?.response?.data?.errors
  if (!fieldErrors || typeof fieldErrors !== 'object') return false
  let applied = false
  for (const [field, messages] of Object.entries(fieldErrors)) {
    setError(field, {
      type: 'server',
      message: Array.isArray(messages) ? messages[0] : String(messages),
    })
    applied = true
  }
  return applied
}
