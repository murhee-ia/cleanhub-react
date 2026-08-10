import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Upload, FileText, Image } from 'lucide-react'
import { completeJobPost, jobKeys } from '../../api/jobs'
import Modal from '../../components/Modal'
import Button from '../../components/Button'

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,application/pdf'

const PROOF_HINTS = [
  'A photo of the completed/cleaned space',
  'Before-and-after photos',
  'A signed or scanned contract',
  'A clearance or completion letter',
  'A receipt or certificate of completion',
]

// Employer's proof-upload modal for marking a job post as completed.
// A proof file (photo or PDF) is required — the backend enforces this too.
// On success, invalidates the job detail/list so the UI reflects the new status.
export default function CompleteJobPostModal({ job, open, onClose }) {
  const queryClient = useQueryClient()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [serverError, setServerError] = useState(null)

  const mutation = useMutation({
    mutationFn: () => completeJobPost(job.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(job.id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.mine() })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      handleClose()
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.errors?.completion_proof?.[0] ??
        error?.response?.data?.message ??
        'Could not submit proof. Please try again.'
      setServerError(msg)
    },
  })

  function handleFileChange(e) {
    const chosen = e.target.files?.[0] ?? null
    setFile(chosen)
    setFieldError(null)
    setServerError(null)
  }

  function handleSubmit() {
    if (!file) {
      setFieldError('Please attach a proof file before marking as completed.')
      return
    }
    mutation.mutate()
  }

  function handleClose() {
    setFile(null)
    setFieldError(null)
    setServerError(null)
    onClose()
  }

  const isImage = file?.type?.startsWith('image/')

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Mark job post as completed"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="complete"
            onClick={handleSubmit}
            disabled={mutation.isPending || !file}
          >
            <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
            {mutation.isPending ? 'Submitting…' : 'Submit & mark completed'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm" style={{ color: 'var(--color-foreground)', lineHeight: 1.6 }}>
          Upload a file that confirms this job is done. This is required to
          mark the job post as completed, which unlocks your ability to rate
          each accepted cleaner.
        </p>

        <div
          style={{
            background: 'var(--color-highlight-soft)',
            border: '1.5px dashed var(--color-foreground)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-foreground)' }}>
            Accepted proof examples
          </p>
          <ul className="flex flex-col gap-1">
            {PROOF_HINTS.map((hint) => (
              <li key={hint} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-foreground)' }}>
                <span aria-hidden="true" style={{ marginTop: '2px', flexShrink: 0 }}>·</span>
                {hint}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="job-completion-proof-input"
            className="text-sm font-bold"
            style={{ color: 'var(--color-foreground)' }}
          >
            Proof file <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>

          <button
            type="button"
            id="job-completion-proof-trigger"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-3 cursor-pointer w-full"
            style={{
              border: `2px dashed ${fieldError ? 'var(--color-danger)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '24px 16px',
              background: file ? 'var(--color-highlight-soft)' : 'var(--color-surface)',
              transition: 'background 0.15s',
            }}
          >
            {file ? (
              <>
                {isImage
                  ? <Image className="size-7" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  : <FileText className="size-7" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                }
                <span className="text-sm font-semibold text-center break-all" style={{ color: 'var(--color-foreground)' }}>
                  {file.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Click to change file
                </span>
              </>
            ) : (
              <>
                <Upload className="size-7" style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Click to attach a photo or PDF
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  JPG, PNG, WEBP, GIF or PDF · max 10 MB
                </span>
              </>
            )}
          </button>

          <input
            ref={inputRef}
            id="job-completion-proof-input"
            type="file"
            accept={ACCEPTED}
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload completion proof file"
          />

          {fieldError && <p className="text-sm text-danger">{fieldError}</p>}
          {serverError && <p className="text-sm text-danger">{serverError}</p>}
        </div>
      </div>
    </Modal>
  )
}
