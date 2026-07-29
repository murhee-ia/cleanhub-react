import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getMyJobs, jobKeys } from '../api/jobs'
import { useDebounce } from '../hooks/useDebounce'
import MyJobsFilters from '../features/jobs/MyJobsFilters'
import JobList from '../features/jobs/JobList'
import Pagination from '../components/Pagination'
import Button from '../components/Button'

const FILTER_KEYS = ['search', 'status', 'schedule_date', 'sort', 'page']

function paramsToFilters(searchParams) {
  const filters = {}
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value) filters[key] = value
  }
  return filters
}

export default function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

  const [draft, setDraft] = useState(() => ({ search: searchParams.get('search') ?? '' }))
  const debouncedDraft = useDebounce(draft)
  const firstRun = useRef(true)

  // Sync the debounced free-text search into the URL (resetting to page 1).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedDraft.search) next.set('search', debouncedDraft.search)
        else next.delete('search')
        next.delete('page')
        return next
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft])

  function clearFilters() {
    setDraft({ search: '' })
    setSearchParams({}, { replace: true })
  }

  function setParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  const { data, isPending, isError } = useQuery({
    queryKey: jobKeys.mineList(filters),
    queryFn: () => getMyJobs(filters),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  const hasActiveFilters =
    Boolean(draft.search || filters.status || filters.schedule_date) ||
    (Boolean(filters.sort) && filters.sort !== 'newest')

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <p className="page-breadcrumb">EMPLOYER · MY JOB POSTS</p>

      <div className="page-header">
        <h1>My job posts</h1>
        <Link
          to="/employer/jobs/new"
          id="post-job-cta-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--heading)',
            fontWeight: 700,
            fontSize: '14px',
            color: '#ffffff',
            textDecoration: 'none',
            background: 'var(--color-primary)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-btn)',
            padding: '8px 18px',
            transition: 'box-shadow 0.1s, transform 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0 #1a1a1a'; e.currentTarget.style.transform = 'translate(2px,2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-btn)'; e.currentTarget.style.transform = 'none' }}
        >
          + Post a Job
        </Link>
      </div>

      <div className="mt-6">
        <MyJobsFilters
          draft={draft}
          onDraftChange={(key, value) => setDraft((current) => ({ ...current, [key]: value }))}
          status={searchParams.get('status') ?? ''}
          scheduleDate={searchParams.get('schedule_date') ?? ''}
          sort={searchParams.get('sort') ?? 'newest'}
          onParamChange={setParam}
        />
      </div>

      <div className="mt-6 flex min-h-9 items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {meta ? `${meta.total} ${meta.total === 1 ? 'post' : 'posts'}` : ''}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" type="button" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-2">
        <JobList
          isPending={isPending}
          isError={isError}
          jobs={jobs}
          emptyMessage={
            hasActiveFilters
              ? 'No job posts match your filters.'
              : 'You haven’t posted any jobs yet.'
          }
        />
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={(page) => setParam('page', String(page))}
          />
        </div>
      )}
    </div>
  )
}
