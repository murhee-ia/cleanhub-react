export default function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${className}`}
    >
      {children}
    </span>
  )
}
