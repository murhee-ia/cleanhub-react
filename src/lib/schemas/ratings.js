import { z } from 'zod'

export const RATING_TEXT_MAX = 2000

export const ratingSchema = z.object({
  stars: z
    .number({ invalid_type_error: 'Pick a star rating' })
    .int()
    .min(1, 'Pick a star rating')
    .max(5),
  text: z
    .string()
    .max(RATING_TEXT_MAX, `Review must be ${RATING_TEXT_MAX} characters or fewer`)
    .optional(),
})
