import { z } from 'zod'
import { countWords } from '../helpers/wordCount'
import { MAX_MEDIA_MB, MAX_MEDIA_FILES } from '../helpers/fileLimits'

export const TITLE_WORD_LIMIT = 101
const MAX_MEDIA_BYTES = MAX_MEDIA_MB * 1024 * 1024

function toFiles(value) {
  return value ? Array.from(value) : []
}

function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Empty strings from the form become undefined so optional numerics don't coerce
// to 0.
const emptyToUndefined = (value) => (value === '' || value == null ? undefined : value)

const optionalTime = z
  .union([z.literal(''), z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM')])
  .optional()

const media = z
  .any()
  .optional()
  .refine(
    (value) => {
      const files = toFiles(value)
      return (
        files.length <= MAX_MEDIA_FILES &&
        files.every((file) => file.type.startsWith('image/') && file.size <= MAX_MEDIA_BYTES)
      )
    },
    { message: `Up to ${MAX_MEDIA_FILES} images, each under ${MAX_MEDIA_MB} MB` },
  )

export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .refine((value) => countWords(value) <= TITLE_WORD_LIMIT, {
        message: `Title must be ${TITLE_WORD_LIMIT} words or fewer`,
      }),
    cleaning_job_category_id: z.coerce
      .number({ message: 'Select a category' })
      .int()
      .positive('Select a category'),
    description: z.string().min(1, 'Description is required'),
    requirements: z.string().optional(),
    qualifications: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().max(255).optional(),
    schedule_date: z
      .string()
      .min(1, 'Schedule date is required')
      .refine((value) => value >= todayISO(), { message: 'Schedule date must be today or later' }),
    start_time: optionalTime,
    end_time: optionalTime,
    cleaners_needed: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional()),
    application_deadline: z.union([z.literal(''), z.string()]).optional(),
    visibility: z.enum(['draft', 'published']),
    pay_amount: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    pay_currency: z.union([z.literal(''), z.string().length(3, 'Use a 3-letter code')]).optional(),
    media,
  })
  .superRefine((value, ctx) => {
    if (
      value.application_deadline &&
      value.schedule_date &&
      value.application_deadline > value.schedule_date
    ) {
      ctx.addIssue({
        path: ['application_deadline'],
        code: 'custom',
        message: 'Deadline must be on or before the schedule date',
      })
    }
  })
