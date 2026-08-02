/**
 * Sidebar — shared by CleanerLayout and EmployerLayout.
 *
 * Behaviour:
 *  - Desktop (≥1024px): 240px fixed left sidebar with icons + labels
 *  - Tablet  (640–1023px): 64px icon-only collapsed sidebar
 *  - Mobile  (<640px): transforms into a 56px top tab bar (icons only)
 *
 * The `role` prop controls which nav group is rendered.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Bookmark,
  Briefcase,
  User,
  UserPen,
  Bell,
  LogOut,
  PlusSquare,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/* ── Nav definitions ── */
const CLEANER_MAIN = [
  { to: '/cleaner', label: 'Home Feed', icon: Home, end: true },
  { to: '/cleaner/saved-jobs', label: 'Saved Jobs', icon: Bookmark, end: false },
]
const CLEANER_ACCOUNT = [
  { to: '/cleaner/profile', label: 'My Profile', icon: User, end: true },
  { to: '/cleaner/profile/edit', label: 'Edit Profile', icon: UserPen, end: false },
]

const EMPLOYER_MAIN = [
  { to: '/employer', label: 'Dashboard', icon: Home, end: true },
  { to: '/employer/jobs', label: 'My Job Posts', icon: Briefcase, end: true },
  { to: '/employer/jobs/new', label: 'Post a Job', icon: PlusSquare, end: false },
]
const EMPLOYER_ACCOUNT = [
  { to: '/employer/profile', label: 'My Profile', icon: User, end: true },
  { to: '/employer/profile/edit', label: 'Edit Profile', icon: UserPen, end: false },
]

/* ── Helpers ── */
function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      title={label}
    >
      <Icon className="sidebar-icon" aria-hidden="true" />
      <span className="sidebar-label">{label}</span>
    </NavLink>
  )
}

function MobileTab({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center justify-center p-2.5 rounded transition ${isActive
          ? 'text-highlight bg-white/15'
          : 'text-white/70 hover:text-white'
        }`
      }
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </NavLink>
  )
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const mainLinks = role === 'employer' ? EMPLOYER_MAIN : CLEANER_MAIN
  const accountLinks = role === 'employer' ? EMPLOYER_ACCOUNT : CLEANER_ACCOUNT
  const allLinks = [...mainLinks, ...accountLinks]

  const roleLabel = role === 'employer' ? 'Employer' : 'Cleaner'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      {/* ── Brand / Logo ── */}
      <div className="sidebar-brand" style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
          {/* CH logo box */}
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'var(--color-highlight)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontFamily: 'var(--heading)',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--color-primary)',
            }}
            aria-hidden="true"
          >
            CH
          </div>

          {/* Brand text */}
          <div className="sidebar-brand-text">
            <div
              style={{
                fontFamily: 'var(--heading)',
                fontWeight: 700,
                fontSize: '17px',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              CleanHub
            </div>
          </div>
        </div>
      </div>

      {/* ── Main nav links ── */}
      <nav style={{ flex: 1, paddingTop: '10px', overflowY: 'auto' }}>
        <div className="sidebar-nav-section">
          {mainLinks.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </div>

        <div className="sidebar-nav-section" style={{ marginTop: '12px' }}>
          <p className="sidebar-section-title">Account</p>
          {accountLinks.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </div>
      </nav>

      {/* ── Bottom: user chip + actions ── */}
      <div className="sidebar-bottom" style={{ paddingBottom: '8px' }}>
        {/* Notifications */}
        <SidebarLink
          to="/notifications"
          label="Notifications"
          icon={Bell}
          end={false}
        />

        {/* Log out */}
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut className="sidebar-icon" aria-hidden="true" />
          <span className="sidebar-label">Log out</span>
        </button>

        {/* User chip */}
        <div className="sidebar-user-chip">
          <div className="sidebar-avatar" aria-hidden="true">
            {initialsOf(user?.name)}
          </div>
          <div className="sidebar-user-info" style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--heading)',
                fontWeight: 600,
                fontSize: '13px',
                color: '#ffffff',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name ?? 'User'}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.55)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile top tab bar (only visible on < 640px) ── */}
      <div className="sidebar-mobile-tabs">
        {allLinks.map((link) => (
          <MobileTab key={link.to} {...link} />
        ))}
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
          className="flex items-center justify-center p-2.5 text-white/70 hover:text-white cursor-pointer border-none bg-transparent rounded transition"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
