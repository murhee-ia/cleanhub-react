import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory, adminKeys } from '../../api/admin'
import { categorySchema } from '../../lib/schemas/admin'
import { applyServerErrors } from '../../lib/helpers/formErrors'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import TextField from '../../components/TextField'

// One form for both create and edit — `category` present means edit. On create
// the slug is optional (derived server-side); on edit it's shown but editable.
export default function CategoryFormModal({ category, open, onClose }) {
  const isEdit = Boolean(category)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', is_active: true },
  })

  useEffect(() => {
    reset(
      category
        ? { name: category.name, slug: category.slug, is_active: category.is_active }
        : { name: '', slug: '', is_active: true },
    )
  }, [category, reset, open])

  const mutation = useMutation({
    mutationFn: (values) => {
      const payload = { name: values.name, is_active: values.is_active }
      if (values.slug) payload.slug = values.slug
      return isEdit ? updateCategory({ id: category.id, ...payload }) : createCategory(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.categories() })
      onClose()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError)) {
        setError('root', { message: 'Could not save the category. Please try again.' })
      }
    },
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${category.name}` : 'New category'}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <TextField id="category-name" label="Name" placeholder="e.g. Data centre" error={errors.name?.message} {...register('name')} />
        <TextField id="category-slug" label="Slug (optional)" placeholder="auto-generated if left blank" error={errors.slug?.message} {...register('slug')} />

        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register('is_active')} style={{ width: '16px', height: '16px' }} />
          Active (shown in job pickers and filters)
        </label>

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  )
}
