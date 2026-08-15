import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'Browse jobs', to: '/jobs' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Features', to: '/#features' },
  { label: 'FAQs', to: '/#faq' },
]

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell landing-footer__grid">
        <div>
          <Link className="landing-footer__brand" to="/">
            <Sparkles size={20} aria-hidden="true" /> CleanHub
          </Link>
          <p>A focused home for cleaning work, hiring, and hard-earned trust.</p>
        </div>
        <nav aria-label="Footer navigation">
          <p>Explore</p>
          {FOOTER_LINKS.map((link) => (
            link.to.includes('#')
              ? <a href={link.to.slice(1)} key={link.to}>{link.label}</a>
              : <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>
        <div>
          <p className="landing-footer__label">Project</p>
          <a href="https://github.com/murhee-ia/cleanhub-react" target="_blank" rel="noreferrer">
            View on GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <Link to="/login">Member log in</Link>
        </div>
      </div>
      <div className="landing-shell landing-footer__bottom">
        <span>© 2026 CleanHub · Personal portfolio project</span>
        <span>Recruitment only · No payments or contracts</span>
      </div>
    </footer>
  )
}
