/**
 * PublicNavbar — sticky top navigation for guest / public pages.
 * Shows the CleanHub brand, nav links, and Log in / Sign up CTAs.
 */
import { Link, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/jobs',    label: 'Browse Jobs'  },
  { to: '/how',     label: 'How it works' },
]

export default function PublicNavbar() {
  return (
    <header className="public-navbar">
      {/* Brand */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
        aria-label="CleanHub home"
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'var(--color-highlight)',
            borderRadius: 'var(--radius)',
            border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--heading)',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          CH
        </div>
        <span
          style={{
            fontFamily: 'var(--heading)',
            fontWeight: 700,
            fontSize: '17px',
            color: '#ffffff',
            letterSpacing: '-0.2px',
          }}
        >
          CleanHub
        </span>
      </Link>

      {/* Center nav */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
        aria-label="Public navigation"
      >
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded text-sm font-semibold transition ${
                isActive
                  ? 'bg-highlight text-primary'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`
            }
            style={{ fontFamily: 'var(--heading)', borderRadius: 'var(--radius)', textDecoration: 'none' }}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Auth CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Link
          to="/login"
          id="public-login-btn"
          style={{
            fontFamily: 'var(--heading)',
            fontWeight: 600,
            fontSize: '14px',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '7px 16px',
            border: '2px solid rgba(255,255,255,0.5)',
            borderRadius: 'var(--radius)',
            transition: 'border-color 0.12s, background 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
        >
          Log in
        </Link>
        <Link
          to="/register"
          id="public-signup-btn"
          style={{
            fontFamily: 'var(--heading)',
            fontWeight: 700,
            fontSize: '14px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '7px 16px',
            background: 'var(--color-highlight)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-btn-sm)',
            transition: 'box-shadow 0.12s, transform 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0 #1a1a1a'; e.currentTarget.style.transform = 'translate(1px,1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-btn-sm)'; e.currentTarget.style.transform = 'none' }}
        >
          Sign up
        </Link>
      </div>
    </header>
  )
}
