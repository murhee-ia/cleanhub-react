import { useState } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { EyeOff, Eye } from 'lucide-react'
import { getAdminJobs, hideJob, unhideJob, adminKeys } from '../api/admin'
import { useDebounce } from '../hooks/useDebounce'
import DataTable from '../components/DataTable'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import TextField from '../components/TextField'
import Button from '../components/Button'
import JobStatusBadge from '../features/jobs/JobStatusBadge'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'closed', label: 'Closed' },
  { value: 'completed', label: 'Completed' },
  { value: 'removed', label: 'Removed' },
]

const SMALL = { padding: '5px 10px', fontSize: '12px' }

export default function AdminJobsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const debouncedSearch = useDebounce(search)

  const params = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
    ...(page > 1 ? { page } : {}),
  }

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.jobs({ search: debouncedSearch, status, page }),
    queryFn: () => getAdminJobs(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'jobs'] })
  const hide = useMutation({ mutationFn: hideJob, onSuccess: invalidate })
  const unhide = useMutation({ mutationFn: unhideJob, onSuccess: invalidate })
  const busy = hide.isPending || unhide.isPending

  const jobs = data?.data ?? []
  const meta = data?.meta

  const columns = [
    { key: 'title', header: 'Title', render: (row) => <span className="font-medium text-foreground">{row.title}</span> },
    { key: 'employer', header: 'Employer', render: (row) => row.employer?.full_name ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <JobStatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'removed' ? (
          <Button variant="complete" type="button" style={SMALL} disabled={busy} onClick={() => unhide.mutate(row.id)}>
            <Eye className="size-3.5 shrink-0" aria-hidden="true" /> Unhide
          </Button>
        ) : (
          <Button variant="danger" type="button" style={SMALL} disabled={busy} onClick={() => hide.mutate(row.id)}>
            <EyeOff className="size-3.5 shrink-0" aria-hidden="true" /> Hide
          </Button>
        ),
    },
  ]

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · JOBS</p>
      <div className="page-header">
        <h1>Job management</h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div style={{ maxWidth: '22rem' }}>
          <TextField
            id="job-search"
            placeholder="Search by title…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <FilterTabs
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          ariaLabel="Filter jobs by status"
        />
      </div>

      <div className="mt-5">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load job posts.</p>
        ) : (
          <DataTable columns={columns} rows={jobs} loading={isPending} empty="No job posts match this filter." />
        )}
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
