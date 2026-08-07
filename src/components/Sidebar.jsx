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
import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Bookmark,
  ClipboardList,
  CalendarDays,
  Briefcase,
  User,
  UserPen,
  Bell,
  LogOut,
  PlusSquare,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/* ── Nav definitions ──
 * No `end` flag: active state comes from longest-prefix matching below, which
 * already prefers the most specific link (/employer/jobs over /employer). */
const CLEANER_MAIN = [
  { to: '/cleaner', label: 'Home Feed', icon: Home },
  { to: '/cleaner/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { to: '/cleaner/applications', label: 'My Applications', icon: ClipboardList },
  { to: '/cleaner/calendar', label: 'Calendar', icon: CalendarDays },
]
const CLEANER_ACCOUNT = [
  { to: '/cleaner/profile', label: 'My Profile', icon: User },
  { to: '/cleaner/profile/edit', label: 'Edit Profile', icon: UserPen },
]

const EMPLOYER_MAIN = [
  { to: '/employer', label: 'Dashboard', icon: Home },
  { to: '/employer/jobs', label: 'My Job Posts', icon: Briefcase },
  { to: '/employer/jobs/new', label: 'Post a Job', icon: PlusSquare },
]
const EMPLOYER_ACCOUNT = [
  { to: '/employer/profile', label: 'My Profile', icon: User },
  { to: '/employer/profile/edit', label: 'Edit Profile', icon: UserPen },
]

/* ── Helpers ── */
function isUnder(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

/**
 * Longest matching prefix among the nav's own *non-root* `to` values, plus an
 * exact match on the root itself. Excluding the root from prefix-matching
 * matters: `/cleaner` is a structural ancestor of every cleaner route (job
 * detail, a viewed employer profile, ...), but those pages aren't actually
 * "part of" Home Feed — they're shared entry points reachable from several
 * different sections (a job card on Home Feed, Saved Jobs, or My
 * Applications all lead to the same `/cleaner/jobs/:id`). Returns `null` when
 * the current page isn't genuinely owned by any listed link, so the caller
 * can leave the previous section highlighted instead of guessing.
 */
function pickDirectMatch(pathname, links, rootTo) {
  if (pathname === rootTo) return rootTo
  let best = null
  for (const link of links) {
    if (link.to === rootTo) continue
    if (isUnder(pathname, link.to) && (!best || link.to.length > best.length)) best = link.to
  }
  return best
}

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

// `className` must stay a function: given a string, NavLink appends its own
// `active` class from its internal prefix match, which would highlight every
// ancestor link (/cleaner, /cleaner/profile, /cleaner/profile/edit) at once.
// The function form makes the `active` prop the sole source of truth.
function SidebarLink({ to, label, icon: Icon, active }) {
  return (
    <NavLink
      to={to}
      className={() => `sidebar-link${active ? ' active' : ''}`}
      title={label}
    >
      <Icon className="sidebar-icon" aria-hidden="true" />
      <span className="sidebar-label">{label}</span>
    </NavLink>
  )
}

// Same reason as SidebarLink: the function form suppresses NavLink's own
// `active` class, which otherwise stacks on top of our computed state.
function MobileTab({ to, label, icon: Icon, active }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={() => `flex items-center justify-center p-2.5 rounded transition ${active
        ? 'text-highlight bg-white/15'
        : 'text-white/70 hover:text-white'
        }`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </NavLink>
  )
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const rootTo = role === 'employer' ? '/employer' : '/cleaner'
  const mainLinks = role === 'employer' ? EMPLOYER_MAIN : CLEANER_MAIN
  const accountLinks = role === 'employer' ? EMPLOYER_ACCOUNT : CLEANER_ACCOUNT
  const allLinks = [...mainLinks, ...accountLinks]
  const directMatch = pickDirectMatch(pathname, allLinks, rootTo)

  // A shared page (job detail, a viewed profile) has no direct match — it
  // isn't owned by any one link — so keep whichever link was last genuinely
  // active instead of falling back to the root. React's "adjust state during
  // render" pattern, same as SaveJobButton's is_saved resync.
  const [activeTo, setActiveTo] = useState(() => directMatch ?? rootTo)
  const [prevDirectMatch, setPrevDirectMatch] = useState(directMatch)
  if (directMatch !== prevDirectMatch) {
    setPrevDirectMatch(directMatch)
    if (directMatch) setActiveTo(directMatch)
  }

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
            <SidebarLink key={link.to} {...link} active={activeTo === link.to} />
          ))}
        </div>

        <div className="sidebar-nav-section" style={{ marginTop: '12px' }}>
          <p className="sidebar-section-title">Account</p>
          {accountLinks.map((link) => (
            <SidebarLink key={link.to} {...link} active={activeTo === link.to} />
          ))}
        </div>
      </nav>

      {/* ── Bottom: user chip + actions ── */}
      <div className="sidebar-bottom" style={{ paddingBottom: '8px' }}>
        {/* Notifications */}
        {/* Outside the role nav, so it matches on its own rather than via `activeTo`. */}
        <SidebarLink
          to="/notifications"
          label="Notifications"
          icon={Bell}
          active={isUnder(pathname, '/notifications')}
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
          <MobileTab key={link.to} {...link} active={activeTo === link.to} />
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
