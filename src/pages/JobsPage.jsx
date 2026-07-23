import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getJobs, jobKeys } from '../api/jobs'
import { useDebounce } from '../hooks/useDebounce'
import JobFilters from '../features/jobs/JobFilters'
import JobCard from '../features/jobs/JobCard'
import Pagination from '../components/Pagination'

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

export default function JobsPage() {
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

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="m-0 font-serif text-3xl text-foreground">Browse cleaning jobs</h1>

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

      <div className="mt-8">
        {isPending ? (
          <p className="text-muted">Loading jobs…</p>
        ) : isError ? (
          <p className="text-danger">Something went wrong loading jobs. Please try again.</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted">No jobs match your filters.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
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
    </main>
  )
}
