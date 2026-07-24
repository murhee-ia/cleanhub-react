import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { getJobCategories, jobCategoryKeys } from '../../api/jobCategories'
import { createJobSchema, TITLE_WORD_LIMIT } from '../../lib/schemas/jobs'
import { MAX_MEDIA_MB, MAX_MEDIA_FILES } from '../../lib/helpers/fileLimits'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import PaperCard from '../../components/PaperCard'
import TextField from '../../components/TextField'
import TextAreaField from '../../components/TextAreaField'
import SelectField from '../../components/SelectField'
import FileInput from '../../components/FileInput'
import WordCounter from '../../components/WordCounter'
import Button from '../../components/Button'

export default function JobPostForm({ onSubmit }) {
  const [titleText, setTitleText] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: jobCategoryKeys.list(),
    queryFn: getJobCategories,
    staleTime: 5 * 60 * 1000,
  })

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      cleaning_job_category_id: '',
      description: '',
      requirements: '',
      qualifications: '',
      country: '',
      city: '',
      address: '',
      schedule_date: '',
      start_time: '',
      end_time: '',
      cleaners_needed: '',
      application_deadline: '',
      visibility: 'draft',
      pay_amount: '',
      pay_currency: '',
    },
  })

  async function handleValid(values) {
    const formData = new FormData()
    const appendIf = (key, value) => {
      if (value !== '' && value != null) formData.append(key, value)
    }
    formData.append('title', values.title)
    formData.append('cleaning_job_category_id', values.cleaning_job_category_id)
    formData.append('description', values.description)
    appendIf('requirements', values.requirements)
    appendIf('qualifications', values.qualifications)
    formData.append('country', values.country)
    formData.append('city', values.city)
    appendIf('address', values.address)
    formData.append('schedule_date', values.schedule_date)
    appendIf('start_time', values.start_time)
    appendIf('end_time', values.end_time)
    appendIf('cleaners_needed', values.cleaners_needed)
    appendIf('application_deadline', values.application_deadline)
    formData.append('visibility', values.visibility)
    appendIf('pay_amount', values.pay_amount)
    appendIf('pay_currency', values.pay_currency)
    Array.from(getValues('media') ?? []).forEach((file) => formData.append('media[]', file))

    try {
      await onSubmit(formData)
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not create the job post. Please try again.' })
      }
    }
  }

  const titleField = register('title')

  return (
    <PaperCard className="p-6 sm:p-8">
      <h1 className="m-0 font-serif text-2xl text-foreground">New job post</h1>
      <form onSubmit={handleSubmit(handleValid)} className="mt-6 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1">
          <TextField
            id="title"
            label="Title"
            error={errors.title?.message}
            {...titleField}
            onChange={(event) => {
              titleField.onChange(event)
              setTitleText(event.target.value)
            }}
          />
          <div className="flex justify-end">
            <WordCounter text={titleText} limit={TITLE_WORD_LIMIT} />
          </div>
        </div>

        <SelectField
          id="cleaning_job_category_id"
          label="Category"
          error={errors.cleaning_job_category_id?.message}
          {...register('cleaning_job_category_id')}
        >
          <option value="">Select a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <TextAreaField
          id="description"
          label="Description"
          error={errors.description?.message}
          {...register('description')}
        />
        <TextAreaField
          id="requirements"
          label="Requirements"
          error={errors.requirements?.message}
          {...register('requirements')}
        />
        <TextAreaField
          id="qualifications"
          label="Qualifications"
          error={errors.qualifications?.message}
          {...register('qualifications')}
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
        <TextField
          id="address"
          label="Address"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="schedule_date"
            label="Schedule date"
            type="date"
            error={errors.schedule_date?.message}
            {...register('schedule_date')}
          />
          <TextField
            id="start_time"
            label="Start time"
            type="time"
            error={errors.start_time?.message}
            {...register('start_time')}
          />
          <TextField
            id="end_time"
            label="End time"
            type="time"
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="cleaners_needed"
            label="Cleaners needed"
            type="number"
            min="1"
            error={errors.cleaners_needed?.message}
            {...register('cleaners_needed')}
          />
          <TextField
            id="application_deadline"
            label="Application deadline"
            type="date"
            error={errors.application_deadline?.message}
            {...register('application_deadline')}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="pay_amount"
            label="Pay amount"
            type="number"
            min="0"
            step="0.01"
            error={errors.pay_amount?.message}
            {...register('pay_amount')}
          />
          <TextField
            id="pay_currency"
            label="Currency"
            placeholder="USD"
            error={errors.pay_currency?.message}
            {...register('pay_currency')}
          />
          <SelectField
            id="visibility"
            label="Visibility"
            error={errors.visibility?.message}
            {...register('visibility')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </SelectField>
        </div>

        <FileInput
          id="media"
          label="Photos"
          accept="image/*"
          multiple
          maxSizeMb={MAX_MEDIA_MB}
          hint={`Optional. Up to ${MAX_MEDIA_FILES} images, ${MAX_MEDIA_MB} MB each.`}
          invalidMessage="Images only."
          error={errors.media?.message}
          {...register('media')}
        />

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting…' : 'Post job'}
          </Button>
        </div>
      </form>
    </PaperCard>
  )
}
