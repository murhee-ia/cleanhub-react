import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * ConsoleShell — the chrome shared by the moderator and admin areas: a sticky
 * neo-brutalist top bar (brand, section nav, user + logout) above an Outlet.
 * The cleaner/employer app uses the left Sidebar instead; these back-office
 * areas are flatter and wider, so a top bar that wraps/scrolls on small
 * screens fits them better. `links` is [{ to, label, icon, end }].
 */
export default function ConsoleShell({ title, links }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-highlight-muted)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--color-primary)',
          borderBottom: '2px solid var(--border)',
        }}
      >
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px' }}
        >
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              aria-hidden="true"
              style={{
                width: '34px', height: '34px', background: 'var(--color-highlight)',
                borderRadius: 'var(--radius)', border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '12px', color: 'var(--color-primary)',
              }}
            >
              CH
            </div>
            <span style={{ fontFamily: 'var(--heading)', fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
              {title}
            </span>
          </div>

          <nav
            className="flex items-center gap-1"
            aria-label={`${title} navigation`}
            style={{ flex: 1, overflowX: 'auto' }}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className="console-nav-link"
                style={({ isActive }) => ({
                  display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                  fontFamily: 'var(--heading)', fontSize: '13px', fontWeight: 700,
                  padding: '7px 12px', borderRadius: 'var(--radius)',
                  color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.85)',
                  background: isActive ? 'var(--color-highlight)' : 'transparent',
                })}
              >
                {link.icon && <link.icon className="size-4 shrink-0" aria-hidden="true" />}
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className="hidden sm:block"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}
            >
              {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-1.5"
              style={{
                fontFamily: 'var(--heading)', fontSize: '13px', fontWeight: 700,
                color: '#ffffff', background: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)', borderRadius: 'var(--radius)', padding: '6px 12px',
              }}
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 48px' }}>
        <Outlet />
      </main>
    </div>
  )
}
