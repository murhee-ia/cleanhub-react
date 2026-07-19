// Single sparse scrapbook accent — a short, semi-transparent rotated strip
// meant to sit near a heading like a piece of washi tape. Use one per page.
export default function WashiTape({ className = '', tone = 'highlight', rotation = -5 }) {
  const background =
    tone === 'highlight-muted' ? 'var(--color-highlight-muted)' : 'var(--color-highlight)'
  return (
    <span
      aria-hidden="true"
      className={`washi-tape ${className}`}
      style={{ background, transform: `rotate(${rotation}deg)` }}
    />
  )
}
