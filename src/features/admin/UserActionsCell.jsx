import { Pause, Play, UserCog, Trash2, RotateCcw } from 'lucide-react'
import Button from '../../components/Button'

// Compact style so several actions fit one table row without wrapping oddly.
const SMALL = { padding: '5px 10px', fontSize: '12px' }

/**
 * The per-row action controls for a user. The admin account is unmanageable, so
 * it shows nothing. A deleted user offers only Restore; everyone else gets
 * suspend/reactivate, change-role, and delete. `mutations` is the shared
 * useUserMutations bundle so the whole page runs off one set of hooks.
 */
export default function UserActionsCell({ user, mutations, onChangeRole }) {
  if (user.role === 'admin') {
    return <span className="text-xs text-muted">—</span>
  }

  const busy =
    mutations.suspend.isPending ||
    mutations.reactivate.isPending ||
    mutations.remove.isPending ||
    mutations.restore.isPending

  if (user.is_deleted) {
    return (
      <Button variant="ghost" type="button" style={SMALL} disabled={busy} onClick={() => mutations.restore.mutate(user.id)}>
        <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" /> Restore
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {user.is_suspended ? (
        <Button variant="complete" type="button" style={SMALL} disabled={busy} onClick={() => mutations.reactivate.mutate(user.id)}>
          <Play className="size-3.5 shrink-0" aria-hidden="true" /> Reactivate
        </Button>
      ) : (
        <Button variant="secondary" type="button" style={SMALL} disabled={busy} onClick={() => mutations.suspend.mutate(user.id)}>
          <Pause className="size-3.5 shrink-0" aria-hidden="true" /> Suspend
        </Button>
      )}
      <Button variant="ghost" type="button" style={SMALL} disabled={busy} onClick={() => onChangeRole(user)}>
        <UserCog className="size-3.5 shrink-0" aria-hidden="true" /> Role
      </Button>
      <Button variant="danger" type="button" style={SMALL} disabled={busy} onClick={() => mutations.remove.mutate(user.id)}>
        <Trash2 className="size-3.5 shrink-0" aria-hidden="true" /> Delete
      </Button>
    </div>
  )
}
