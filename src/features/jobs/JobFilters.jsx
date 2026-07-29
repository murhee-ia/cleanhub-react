import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getJobCategories, jobCategoryKeys } from '../../api/jobCategories'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'soonest', label: 'Starting soonest' },
  { value: 'top_employer', label: 'Top-rated employer' },
]

function chipStyle(active) {
  return {
    fontFamily: 'var(--heading)',
    fontWeight: 600,
    fontSize: '0.75rem',
    padding: '0.3125rem 0.875rem',
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.1s, box-shadow 0.1s',
    background: active ? 'var(--color-primary)' : 'var(--color-highlight)',
    color: active ? '#ffffff' : 'var(--color-foreground)',
    boxShadow: active ? 'var(--shadow-sm)' : 'none',
  }
}

/**
 * JobFilters — horizontal chip-style filter bar.
 * Search input spans full width; below it: category chips + sort dropdown inline.
 */
export default function JobFilters({
  draft,
  onDraftChange,
  categoryId,
  scheduleDate,
  sort,
  onParamChange,
}) {
  const { data: categories = [] } = useQuery({
    queryKey: jobCategoryKeys.list(),
    queryFn: getJobCategories,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Search bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '0.75rem',
            width: '1rem',
            height: '1rem',
            color: 'var(--color-muted)',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        />
        <input
          id="job-search"
          type="search"
          placeholder="Search jobs…"
          value={draft.search}
          onChange={(e) => onDraftChange('search', e.target.value)}
          className="neo-input"
          style={{ paddingLeft: '2.375rem' }}
          aria-label="Search jobs"
        />
      </div>

      {/* Filter chip row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* "All" chip */}
        <button
          type="button"
          onClick={() => onParamChange('category_id', '')}
          style={chipStyle(!categoryId)}
        >
          All
        </button>

        {/* Category chips */}
        {categories.map((cat) => {
          const active = categoryId === String(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onParamChange('category_id', active ? '' : String(cat.id))}
              style={chipStyle(active)}
            >
              {cat.name}
            </button>
          )
        })}

        {/* Spacer to push sort to right */}
        <span style={{ flex: 1 }} />

        {/* Sort dropdown */}
        <select
          id="job-sort"
          value={sort}
          onChange={(e) => onParamChange('sort', e.target.value)}
          aria-label="Sort jobs"
          style={{
            fontFamily: 'var(--heading)',
            fontWeight: 600,
            fontSize: '0.75rem',
            padding: '0.3125rem 0.625rem',
            borderRadius: 'var(--radius)',
            border: '2px solid var(--border)',
            background: 'var(--color-surface)',
            color: 'var(--color-foreground)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            outline: 'none',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Extra filters: city/country/date — collapsed into a secondary row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px',
        }}
      >
        <input
          id="job-city"
          type="text"
          placeholder="City"
          value={draft.city}
          onChange={(e) => onDraftChange('city', e.target.value)}
          className="neo-input"
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
          aria-label="Filter by city"
        />
        <input
          id="job-country"
          type="text"
          placeholder="Country"
          value={draft.country}
          onChange={(e) => onDraftChange('country', e.target.value)}
          className="neo-input"
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
          aria-label="Filter by country"
        />
        <input
          id="job-date"
          type="date"
          value={scheduleDate}
          onChange={(e) => onParamChange('schedule_date', e.target.value)}
          className="neo-input"
          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
          aria-label="Filter by schedule date"
        />
      </div>
    </div>
  )
}
