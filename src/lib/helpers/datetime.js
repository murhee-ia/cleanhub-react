// Format a "YYYY-MM-DD" string for display without timezone drift — parsed as a
// local date rather than UTC midnight, which can shift a day in some zones.
export function formatDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Same display, but for a full ISO timestamp (an API `created_at`) rather than
// a date-only string.
export function formatTimestampDate(iso) {
  if (!iso) return null
  return formatDate(iso.slice(0, 10))
}
