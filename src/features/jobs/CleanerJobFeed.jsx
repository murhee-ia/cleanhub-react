import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getJobs, jobKeys } from '../../api/jobs'
import { useDebounce } from '../../hooks/useDebounce'
import Pagination from '../../components/Pagination'
import Button from '../../components/Button'
import JobFilters from './JobFilters'
import JobList from './JobList'

const TEXT_KEYS = ['search', 'country', 'city']
const FILTER_KEYS = [...TEXT_KEYS, 'category_id', 'schedule_date', 'sort', 'page']

function paramsToFilters(searchParams) {
  const filters = {}
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value) filters[key] = value
  }
  return filters
}

// Signed-in cleaners get the full feed: keyword search, filters, and sorting.
export default function CleanerJobFeed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

  const [draft, setDraft] = useState(() => ({
    search: searchParams.get('search') ?? '',
    country: searchParams.get('country') ?? '',
    city: searchParams.get('city') ?? '',
  }))
  const debouncedDraft = useDebounce(draft)
  const firstRun = useRef(true)

  // Sync the debounced free-text filters into the URL (resetting to page 1).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const key of TEXT_KEYS) {
          if (debouncedDraft[key]) next.set(key, debouncedDraft[key])
          else next.delete(key)
        }
        next.delete('page')
        return next
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft])

  function clearFilters() {
    setDraft({ search: '', country: '', city: '' })
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
    queryKey: jobKeys.list(filters),
    queryFn: () => getJobs(filters),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data ?? []
  const meta = data?.meta

  const hasActiveFilters =
    Boolean(draft.search || draft.country || draft.city) ||
    Boolean(filters.category_id || filters.schedule_date) ||
    (Boolean(filters.sort) && filters.sort !== 'newest')

  return (
    <>
      <div className="mt-6">
        <JobFilters
          draft={draft}
          onDraftChange={(key, value) => setDraft((current) => ({ ...current, [key]: value }))}
          categoryId={searchParams.get('category_id') ?? ''}
          scheduleDate={searchParams.get('schedule_date') ?? ''}
          sort={searchParams.get('sort') ?? 'newest'}
          onParamChange={setParam}
        />
      </div>

      <div className="mt-6 flex min-h-9 items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {meta ? `${meta.total} ${meta.total === 1 ? 'job' : 'jobs'} found` : ''}
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
          emptyMessage="No jobs found."
          hideStatus
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
    </>
  )
}
