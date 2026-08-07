import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings, adminKeys } from '../api/admin'
import { settingsSchema } from '../lib/schemas/admin'
import { applyServerErrors } from '../lib/helpers/formErrors'
import TextField from '../components/TextField'
import Button from '../components/Button'

const FIELDS = [
  { key: 'max_file_size_mb', label: 'Max upload size (MB)', hint: 'Applies to resumes and documents.' },
  { key: 'max_active_applications', label: 'Max active applications per cleaner', hint: 'How many open applications a cleaner may hold at once.' },
  { key: 'max_open_reports_per_user', label: 'Max open reports per user', hint: 'Caps how many reports one person can have in flight.' },
]

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.settings(),
    queryFn: getSettings,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(settingsSchema) })

  // Populate the form once the current values arrive.
  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (fresh) => {
      queryClient.setQueryData(adminKeys.settings(), fresh)
      reset(fresh)
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not save settings. Please try again.' })
      }
    },
  })

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · SETTINGS</p>
      <div className="page-header">
        <h1>System settings</h1>
      </div>

      {isError ? (
        <p className="paper-flat mt-6 p-4 text-sm text-danger">Couldn't load settings.</p>
      ) : isPending ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="paper-flat mt-6 flex flex-col gap-5"
          style={{ padding: '24px', maxWidth: '32rem' }}
          noValidate
        >
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <TextField
                id={field.key}
                label={field.label}
                type="number"
                min={1}
                error={errors[field.key]?.message}
                {...register(field.key)}
              />
              <p className="text-xs text-muted">{field.hint}</p>
            </div>
          ))}

          {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
          {mutation.isSuccess && !isDirty && <p className="text-sm text-primary">Settings saved.</p>}

          <div>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
