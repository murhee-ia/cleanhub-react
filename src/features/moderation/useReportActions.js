import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportKeys } from '../../api/reports'

/**
 * Drives the five report-handling actions from one mutation. Each caller
 * passes the action function (resolveReport, hideReportedContent, …) plus the
 * report id and optional note; on success the queue list and this report's
 * detail are refetched so the new status shows everywhere at once.
 */
export function useReportActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ actionFn, id, note }) => actionFn({ id, note }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) })
    },
  })
}
