import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingLink({ children, className = '', showArrow = false, variant = 'primary', ...props }) {
  return (
    <Link className={`landing-link landing-link--${variant} ${className}`} {...props}>
      <span>{children}</span>
      {showArrow && <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />}
    </Link>
  )
}
