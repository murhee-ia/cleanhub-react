import { APPLICATION_STATUSES } from '../../lib/helpers/applicationStatus'

const TABS = [{ value: '', label: 'All' }, ...APPLICATION_STATUSES.map((value) => ({ value, label: value }))]

// Status filter tabs. Wraps to as many rows as the viewport needs rather than
// scrolling horizontally, so all six stay reachable at 375px.
export default function ApplicationStatusTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter applications by status">
      {TABS.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={active}
            className="cursor-pointer capitalize"
            style={{
              fontFamily: 'var(--heading)',
              fontSize: '13px',
              fontWeight: 700,
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              background: active ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active ? '#ffffff' : 'var(--color-foreground)',
              boxShadow: active ? 'var(--shadow-btn-sm)' : 'none',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
