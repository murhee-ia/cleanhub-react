import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Self-registration is limited to cleaner/employer — moderator/admin accounts
// are never created through the public UI (see root CLAUDE.md).
export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.email('Enter a valid email address'),
    role: z.enum(['cleaner', 'employer'], { message: 'Select cleaner or employer' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
