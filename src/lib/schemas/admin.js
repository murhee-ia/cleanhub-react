import { z } from 'zod'

// Creating a moderator mirrors registration's password rules — moderators are
// only ever created here, never through public signup.
export const moderatorSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

// Slug is optional on create — the backend derives it from the name.
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().max(255).optional().or(z.literal('')),
  is_active: z.boolean().optional(),
})

// The tunable limits — every value a positive integer.
export const settingsSchema = z.object({
  max_file_size_mb: z.coerce.number().int().min(1),
  max_active_applications: z.coerce.number().int().min(1),
  max_open_reports_per_user: z.coerce.number().int().min(1),
})
