import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { saveJob, unsaveJob, savedJobKeys } from '../../api/savedJobs'
import { jobKeys } from '../../api/jobs'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'

// Save/unsave toggle. Cleaner-only concept: guests are redirected to login,
// authenticated non-cleaners never see it. `is_saved` is only present on the
// job payload for cleaner viewers, so it's the source of the initial state.
export default function SaveJobButton({ job, withLabel = false, className = '' }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [saved, setSaved] = useState(Boolean(job.is_saved))

  // Resync when a refetch (e.g. after invalidation) delivers a fresh is_saved —
  // React's "adjust state on prop change during render" pattern, no effect needed.
  const [prevIsSaved, setPrevIsSaved] = useState(job.is_saved)
  if (job.is_saved !== prevIsSaved) {
    setPrevIsSaved(job.is_saved)
    setSaved(Boolean(job.is_saved))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (next) => (next ? saveJob(job.id) : unsaveJob(job.id)),
    onError: (error, next) => {
      // 422 (already saved) / 404 (already unsaved) mean the cache was stale and
      // we're already in the desired state — keep it and let invalidation resync.
      const status = error?.response?.status
      if (status !== 422 && status !== 404) setSaved(!next)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
      if (job.employer?.id) {
        queryClient.invalidateQueries({ queryKey: jobKeys.employer(job.employer.id) })
      }
    },
  })

  if (isAuthenticated && user?.role !== 'cleaner') return null

  function handleClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: location.pathname } } })
      return
    }
    const next = !saved
    setSaved(next)
    mutate(next)
  }

  const Icon = saved ? BookmarkCheck : Bookmark
  const label = saved ? 'Saved' : 'Save'

  return (
    <Button
      type="button"
      variant={withLabel ? 'ghost' : 'icon'}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isAuthenticated ? saved : undefined}
      aria-label={withLabel ? undefined : `${label} job`}
      title={`${label} job`}
      className={`gap-1.5 ${className}`}
    >
      <Icon className="size-6 shrink-0" aria-hidden="true" />
      {withLabel && label}
    </Button>
  )
}
