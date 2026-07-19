// Paper-feel container: light grain (.paper) + hairline border on a surface.
export default function PaperCard({ className = '', children, ...props }) {
  return (
    <div
      className={`paper rounded-lg border shadow-sm ${className}`}
      style={{ borderColor: 'var(--border)' }}
      {...props}
    >
      {children}
    </div>
  )
}
