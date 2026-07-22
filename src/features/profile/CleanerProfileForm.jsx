import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cleanerProfileSchema } from '../../lib/schemas/profile'
import { MAX_PHOTO_MB, MAX_DOCUMENT_MB } from '../../lib/helpers/fileLimits'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import PaperCard from '../../components/PaperCard'
import TextField from '../../components/TextField'
import TextAreaField from '../../components/TextAreaField'
import FileInput from '../../components/FileInput'
import WordCounter from '../../components/WordCounter'
import TagsInput from '../../components/TagsInput'
import Button from '../../components/Button'
import CategorySelect from './CategorySelect'

export default function CleanerProfileForm({ initialData, onSubmit }) {
  const [saved, setSaved] = useState(false)
  const [bioText, setBioText] = useState(initialData?.bio ?? '')

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cleanerProfileSchema),
    defaultValues: {
      bio: initialData?.bio ?? '',
      country: initialData?.country ?? '',
      city: initialData?.city ?? '',
      cleaning_categories: (initialData?.cleaning_categories ?? []).map((category) => category.id),
      languages: initialData?.languages ?? [],
    },
  })

  async function handleValid(values) {
    setSaved(false)
    const formData = new FormData()
    formData.append('_method', 'PATCH')
    if (values.bio) formData.append('bio', values.bio)
    formData.append('country', values.country)
    formData.append('city', values.city)
    values.languages.forEach((language) => formData.append('languages[]', language))
    values.cleaning_categories.forEach((id) => formData.append('cleaning_categories[]', id))
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

  const bioField = register('bio')

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
        <TextAreaField
          id="bio"
          label="Bio"
          error={errors.bio?.message}
          footer={<WordCounter text={bioText} />}
          {...bioField}
          onChange={(event) => {
            bioField.onChange(event)
            setBioText(event.target.value)
          }}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="country"
            label="Country"
            error={errors.country?.message}
            {...register('country')}
          />
          <TextField id="city" label="City" error={errors.city?.message} {...register('city')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Cleaning categories</span>
          <Controller
            name="cleaning_categories"
            control={control}
            render={({ field, fieldState }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="languages" className="text-sm font-medium text-foreground">
            Languages
          </label>
          <Controller
            name="languages"
            control={control}
            render={({ field, fieldState }) => (
              <TagsInput
                id="languages"
                placeholder="Add a language and press Enter"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <FileInput
          id="photo"
          label="Profile photo"
          accept="image/*"
          maxSizeMb={MAX_PHOTO_MB}
          hint={`Optional. JPG or PNG up to ${MAX_PHOTO_MB} MB.`}
          invalidMessage="Please choose an image file."
          error={errors.photo?.message}
          {...register('photo')}
        />
        <FileInput
          id="documents"
          label="Add resume / certificates"
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
