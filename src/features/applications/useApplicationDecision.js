import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptApplication, rejectApplication, applicationKeys } from '../../api/applications'
import { jobKeys } from '../../api/jobs'

// Accept/reject for one applicant, shared by the applicant row and the drawer so
// both invalidate the same caches. A 422 here means the application was already
// decided elsewhere; the refetch that follows delivers its real status.
export function useApplicationDecision(applicationId, jobPostId) {
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(jobPostId) })
    queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) })
    // Accepting/rejecting changes whether this application belongs on the
    // cleaner's calendar.
    queryClient.invalidateQueries({ queryKey: applicationKeys.calendar() })
    queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobPostId) })
  }

  // The mutation variable is the optional decision message shown to the cleaner;
  // calling accept()/reject() with no argument sends none.
  const accept = useMutation({
    mutationFn: (message) => acceptApplication(applicationId, message),
    onSettled: invalidate,
  })

  const reject = useMutation({
    mutationFn: (message) => rejectApplication(applicationId, message),
    onSettled: invalidate,
  })

  const error = accept.error ?? reject.error
  const decisionError = error
    ? (error.response?.data?.message ?? 'Could not update this application. Please try again.')
    : null

  return {
    accept: accept.mutate,
    reject: reject.mutate,
    isDeciding: accept.isPending || reject.isPending,
    decisionError,
  }
}
