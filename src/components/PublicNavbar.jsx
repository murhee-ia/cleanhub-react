import { Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const SECTION_LINKS = [
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#features', label: 'Features' },
  { to: '/#about', label: 'About' },
  { to: '/#faq', label: 'FAQs' },
]

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="public-navbar">
      <Link className="public-navbar__brand" to="/" onClick={closeMenu} aria-label="CleanHub home">
        <span className="public-navbar__mark" aria-hidden="true">
          <Sparkles size={18} strokeWidth={2.5} />
        </span>
        <span>CleanHub</span>
      </Link>

      <nav className="public-navbar__desktop-nav" aria-label="Public navigation">
        <NavLink
          to="/jobs"
          className={({ isActive }) => `public-navbar__link${isActive ? ' is-active' : ''}`}
        >
          Browse jobs
        </NavLink>
        {SECTION_LINKS.map((link) => (
          <a className="public-navbar__link" href={pathname === '/' ? link.to.slice(1) : link.to} key={link.to}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="public-navbar__actions">
        <Link className="public-navbar__login" to="/login">
          Log in
        </Link>
        <Link className="public-navbar__signup" to="/register">
          Join CleanHub
        </Link>
      </div>

      <button
        className="public-navbar__menu-button"
        type="button"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls="public-mobile-menu"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <div
        className={`public-navbar__mobile-menu${isMenuOpen ? ' is-open' : ''}`}
        id="public-mobile-menu"
      >
        <nav aria-label="Mobile public navigation">
          <NavLink to="/jobs" onClick={closeMenu}>Browse jobs</NavLink>
          {SECTION_LINKS.map((link) => (
            <a href={pathname === '/' ? link.to.slice(1) : link.to} key={link.to} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="public-navbar__mobile-actions">
          <Link to="/login" onClick={closeMenu}>Log in</Link>
          <Link to="/register" onClick={closeMenu}>Join CleanHub</Link>
        </div>
      </div>
    </header>
  )
}
