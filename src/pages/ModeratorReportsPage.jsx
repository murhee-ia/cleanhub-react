import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getReports, reportKeys } from '../api/reports'
import { formatTimestampDate } from '../lib/helpers/datetime'
import DataTable from '../components/DataTable'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import ReportStatusBadge from '../features/moderation/ReportStatusBadge'
import ReportDetailModal from '../features/moderation/ReportDetailModal'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under review' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'user', label: 'Users' },
  { value: 'job_post', label: 'Job posts' },
  { value: 'rating', label: 'Reviews' },
]

const TYPE_LABELS = { user: 'User', job_post: 'Job post', rating: 'Review' }

const COLUMNS = [
  { key: 'id', header: '#', render: (row) => `#${row.id}` },
  { key: 'target', header: 'Target', render: (row) => row.target?.label || '—' },
  { key: 'type', header: 'Type', render: (row) => TYPE_LABELS[row.reportable_type] ?? row.reportable_type },
  { key: 'reporter', header: 'Filed by', render: (row) => row.reporter?.name ?? '—' },
  { key: 'status', header: 'Status', render: (row) => <ReportStatusBadge status={row.status} /> },
  { key: 'created_at', header: 'Filed', render: (row) => formatTimestampDate(row.created_at) },
]

export default function ModeratorReportsPage() {
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const params = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(page > 1 ? { page } : {}),
  }

  const { data, isPending, isError } = useQuery({
    queryKey: reportKeys.list({ status, type, page }),
    queryFn: () => getReports(params),
    placeholderData: keepPreviousData,
  })

  const reports = data?.data ?? []
  const meta = data?.meta

  function changeStatus(next) {
    setStatus(next)
    setPage(1)
  }
  function changeType(next) {
    setType(next)
    setPage(1)
  }

  return (
    <div className="page-content">
      <p className="page-breadcrumb">MODERATION · REPORTS</p>
      <div className="page-header">
        <h1>Report queue</h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <FilterTabs options={STATUS_OPTIONS} value={status} onChange={changeStatus} ariaLabel="Filter reports by status" />
        <FilterTabs options={TYPE_OPTIONS} value={type} onChange={changeType} ariaLabel="Filter reports by type" />
      </div>

      <div className="mt-5">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load the report queue.</p>
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={reports}
            loading={isPending}
            empty="No reports match this filter."
            onRowClick={(row) => setSelected(row)}
          />
        )}
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
        </div>
      )}

      <ReportDetailModal report={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </div>
  )
}
