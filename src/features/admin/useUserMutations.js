import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  suspendUser,
  reactivateUser,
  changeUserRole,
  deleteUser,
  restoreUser,
  adminKeys,
} from '../../api/admin'

/**
 * The user-management mutations, sharing one invalidation: any change refetches
 * every admin user list (filters vary, so invalidate the whole `admin/users`
 * subtree) and the overview counts that depend on them.
 */
export function useUserMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
  }

  return {
    suspend: useMutation({ mutationFn: suspendUser, onSuccess: invalidate }),
    reactivate: useMutation({ mutationFn: reactivateUser, onSuccess: invalidate }),
    changeRole: useMutation({ mutationFn: changeUserRole, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteUser, onSuccess: invalidate }),
    restore: useMutation({ mutationFn: restoreUser, onSuccess: invalidate }),
  }
}
