import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Undo2 } from 'lucide-react'
import { withdrawApplication, applicationKeys } from '../../api/applications'
import { jobKeys } from '../../api/jobs'
import { savedJobKeys } from '../../api/savedJobs'
import Button from '../../components/Button'

// Optimistic withdraw, mirroring SaveJobButton: the row flips to withdrawn
// immediately, reverts on a genuine failure, and re-syncs from the server on
// settle. Only ever rendered for a pending application.
export default function WithdrawButton({ application }) {
  const queryClient = useQueryClient()
  const [withdrawn, setWithdrawn] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => withdrawApplication(application.id),
    onError: (error) => {
      // 403 means the server already moved this application out of `pending`
      // (decided or withdrawn elsewhere) — the cache was stale, so keep the flip
      // and let invalidation deliver the real status.
      if (error?.response?.status !== 403) setWithdrawn(false)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: savedJobKeys.lists() })
      if (application.job?.id) {
        queryClient.invalidateQueries({ queryKey: jobKeys.detail(application.job.id) })
      }
    },
  })

  function handleClick() {
    setWithdrawn(true)
    mutate()
  }

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={handleClick}
      disabled={isPending || withdrawn}
      style={{ width: '100%' }}
    >
      <Undo2 className="size-4 shrink-0" aria-hidden="true" />
      {withdrawn ? 'Withdrawn' : 'Withdraw application'}
    </Button>
  )
}
