/**
 * PaperCard — neo-brutalist white card with hard offset shadow + thick border.
 * Use `flat` prop to suppress the hover-lift animation (for forms / static panels).
 */
export default function PaperCard({ className = '', flat = false, children, ...props }) {
  return (
    <div
      className={`${flat ? 'paper-flat' : 'paper'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
