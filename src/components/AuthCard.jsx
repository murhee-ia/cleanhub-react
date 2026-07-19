import PaperCard from './PaperCard'
import WashiTape from './WashiTape'

// Shared frame for auth pages: paper card, one washi-tape accent, serif title.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <PaperCard className="relative w-full max-w-md p-8">
      <WashiTape className="absolute -top-3 left-8" rotation={-5} />
      <h1 className="m-0 font-serif text-3xl text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
    </PaperCard>
  )
}
