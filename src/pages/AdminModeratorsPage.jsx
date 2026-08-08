import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UserX } from 'lucide-react'
import { getModerators, revokeModerator, adminKeys } from '../api/admin'
import DataTable from '../components/DataTable'
import Button from '../components/Button'
import UserStatusBadge from '../features/admin/UserStatusBadge'
import CreateModeratorModal from '../features/admin/CreateModeratorModal'

export default function AdminModeratorsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.moderators(),
    queryFn: getModerators,
  })

  const revoke = useMutation({
    mutationFn: revokeModerator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.moderators() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
    },
  })

  const moderators = data ?? []

  const columns = [
    {
      key: 'name',
      header: 'Moderator',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          <span className="text-xs text-muted">{row.email}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <UserStatusBadge user={row} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.is_deleted ? (
          <span className="text-xs text-muted">Revoked</span>
        ) : (
          <Button
            variant="danger"
            type="button"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            disabled={revoke.isPending}
            onClick={() => revoke.mutate(row.id)}
          >
            <UserX className="size-3.5 shrink-0" aria-hidden="true" /> Revoke
          </Button>
        ),
    },
  ]

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · MODERATORS</p>
      <div className="page-header">
        <h1>Moderators</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 shrink-0" aria-hidden="true" /> New moderator
        </Button>
      </div>

      <div className="mt-6">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load moderators.</p>
        ) : (
          <DataTable columns={columns} rows={moderators} loading={isPending} empty="No moderators yet." />
        )}
      </div>

      <CreateModeratorModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
