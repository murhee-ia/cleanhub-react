/**
 * Badge — neo-brutalist pill/tag with consistent 6px radius.
 * Bold uppercase label, 1.5px dark border.
 */
export default function Badge({ className = '', children, style = {} }) {
  return (
    <span
      className={`neo-badge ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
