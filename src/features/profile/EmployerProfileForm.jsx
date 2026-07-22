import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employerProfileSchema } from '../../lib/schemas/profile'
import { EMPLOYER_TYPES } from '../../lib/helpers/employerTypes'
import { MAX_PHOTO_MB, MAX_DOCUMENT_MB } from '../../lib/helpers/fileLimits'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import PaperCard from '../../components/PaperCard'
import TextField from '../../components/TextField'
import TextAreaField from '../../components/TextAreaField'
import FileInput from '../../components/FileInput'
import Button from '../../components/Button'

export default function EmployerProfileForm({ initialData, onSubmit }) {
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      employer_type: initialData?.employer_type ?? '',
      contact_person_name: initialData?.contact_person_name ?? '',
      contact_person_contact: initialData?.contact_person_contact ?? '',
      country: initialData?.country ?? '',
      city: initialData?.city ?? '',
      address: initialData?.address ?? '',
      about: initialData?.about ?? '',
    },
  })

  async function handleValid(values) {
    setSaved(false)
    const formData = new FormData()
    formData.append('_method', 'PATCH')
    formData.append('employer_type', values.employer_type)
    if (values.contact_person_name) formData.append('contact_person_name', values.contact_person_name)
    if (values.contact_person_contact)
      formData.append('contact_person_contact', values.contact_person_contact)
    formData.append('country', values.country)
    formData.append('city', values.city)
    if (values.address) formData.append('address', values.address)
    if (values.about) formData.append('about', values.about)
    const photo = getValues('photo')?.[0]
    if (photo) formData.append('photo', photo)
    Array.from(getValues('documents') ?? []).forEach((file) =>
      formData.append('documents[]', file),
    )

    try {
      await onSubmit(formData)
      setSaved(true)
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not save your profile. Please try again.' })
      }
    }
  }

  return (
    <PaperCard className="p-6 sm:p-8">
      <h1 className="m-0 font-serif text-2xl text-foreground">Edit your profile</h1>
      {initialData?.full_name && (
        <p className="mt-1 text-muted">
          {initialData.full_name} ·{' '}
          <span className="text-sm">name is managed in account settings</span>
        </p>
      )}
      <form onSubmit={handleSubmit(handleValid)} className="mt-6 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="employer_type" className="text-sm font-medium text-foreground">
            Employer type
          </label>
          <select
            id="employer_type"
            className="rounded-md border bg-surface px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            style={{ borderColor: errors.employer_type ? 'var(--color-danger)' : 'var(--border)' }}
            {...register('employer_type')}
          >
            <option value="">Select…</option>
            {EMPLOYER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.employer_type && (
            <p className="text-sm text-danger">{errors.employer_type.message}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="contact_person_name"
            label="Contact person"
            error={errors.contact_person_name?.message}
            {...register('contact_person_name')}
          />
          <TextField
            id="contact_person_contact"
            label="Contact email or phone"
            error={errors.contact_person_contact?.message}
            {...register('contact_person_contact')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="country"
            label="Country"
            error={errors.country?.message}
            {...register('country')}
          />
          <TextField id="city" label="City" error={errors.city?.message} {...register('city')} />
        </div>

        <TextField
          id="address"
          label="Address"
          error={errors.address?.message}
          {...register('address')}
        />

        <TextAreaField
          id="about"
          label="About"
          error={errors.about?.message}
          {...register('about')}
        />

        <FileInput
          id="photo"
          label="Logo"
          accept="image/*"
          maxSizeMb={MAX_PHOTO_MB}
          hint={`Optional. JPG or PNG up to ${MAX_PHOTO_MB} MB.`}
          invalidMessage="Please choose an image file."
          error={errors.photo?.message}
          {...register('photo')}
        />
        <FileInput
          id="documents"
          label="Add documents"
          accept="application/pdf"
          multiple
          maxSizeMb={MAX_DOCUMENT_MB}
          hint={`Optional. PDF up to ${MAX_DOCUMENT_MB} MB each. New files are added to your existing documents.`}
          invalidMessage="PDF files only."
          error={errors.documents?.message}
          {...register('documents')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        {saved && <p className="text-sm text-primary">Profile saved.</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </PaperCard>
  )
}
