import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getAuditLogs, adminKeys } from '../api/admin'
import { useDebounce } from '../hooks/useDebounce'
import { formatTimestampDate } from '../lib/helpers/datetime'
import DataTable from '../components/DataTable'
import Pagination from '../components/Pagination'
import TextField from '../components/TextField'

function contextSummary(context) {
  if (!context || typeof context !== 'object') return '—'
  const entries = Object.entries(context)
  if (entries.length === 0) return '—'
  return entries.map(([key, value]) => `${key}: ${value}`).join(' · ')
}

const COLUMNS = [
  { key: 'created_at', header: 'When', render: (row) => formatTimestampDate(row.created_at) },
  {
    key: 'actor',
    header: 'Actor',
    render: (row) => (row.actor ? `${row.actor.name} (${row.actor.role})` : '—'),
  },
  {
    key: 'action',
    header: 'Action',
    render: (row) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>{row.action}</span>
    ),
  },
  {
    key: 'target',
    header: 'Target',
    render: (row) => (row.auditable_type ? `${row.auditable_type} #${row.auditable_id}` : '—'),
  },
  { key: 'context', header: 'Details', render: (row) => <span className="text-xs text-muted">{contextSummary(row.context)}</span> },
]

export default function AdminAuditLogPage() {
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const debouncedAction = useDebounce(action)

  const params = {
    ...(debouncedAction ? { action: debouncedAction } : {}),
    ...(page > 1 ? { page } : {}),
  }

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.auditLogs({ action: debouncedAction, page }),
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
  })

  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · AUDIT LOG</p>
      <div className="page-header">
        <h1>Audit log</h1>
      </div>

      <div className="mt-6" style={{ maxWidth: '22rem' }}>
        <TextField
          id="audit-action"
          placeholder="Filter by action (e.g. user.suspended)…"
          value={action}
          onChange={(event) => {
            setAction(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="mt-5">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load the audit log.</p>
        ) : (
          <DataTable columns={COLUMNS} rows={logs} loading={isPending} empty="No audit entries match this filter." />
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
