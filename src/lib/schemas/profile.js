import { z } from 'zod'
import { countWords, BIO_WORD_LIMIT } from '../helpers/wordCount'
import { EMPLOYER_TYPES } from '../helpers/employerTypes'
import { MAX_PHOTO_MB, MAX_DOCUMENT_MB } from '../helpers/fileLimits'

const EMPLOYER_TYPE_VALUES = EMPLOYER_TYPES.map((t) => t.value)
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024
const MAX_DOCUMENT_BYTES = MAX_DOCUMENT_MB * 1024 * 1024

// FileList (or undefined) → array, so refinements work in any environment.
function toFiles(value) {
  return value ? Array.from(value) : []
}

// Bio is optional; when present it must stay within the inclusive word cap.
const bio = z
  .string()
  .refine((value) => countWords(value) <= BIO_WORD_LIMIT, {
    message: `Bio must be ${BIO_WORD_LIMIT} words or fewer`,
  })
  .optional()

const photoUpload = z
  .any()
  .optional()
  .refine(
    (value) =>
      toFiles(value).every((file) => file.type.startsWith('image/') && file.size <= MAX_PHOTO_BYTES),
    { message: `Photo must be an image up to ${MAX_PHOTO_MB} MB` },
  )

const documentUploads = z
  .any()
  .optional()
  .refine(
    (value) =>
      toFiles(value).every(
        (file) => file.type === 'application/pdf' && file.size <= MAX_DOCUMENT_BYTES,
      ),
    { message: `Each document must be a PDF up to ${MAX_DOCUMENT_MB} MB` },
  )

// full_name comes from users.name and is not part of the profile-update payload
// (managed via the account, not these forms), so it is intentionally absent here.
export const cleanerProfileSchema = z.object({
  bio,
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  // Submitted as an array of job-category ids (from GET /cleaning-job-categories).
  cleaning_categories: z.array(z.number()).optional(),
  languages: z.array(z.string().min(1)).optional(),
  photo: photoUpload,
  documents: documentUploads,
})

export const employerProfileSchema = z.object({
  employer_type: z.enum(EMPLOYER_TYPE_VALUES, { message: 'Select an employer type' }),
  contact_person_name: z.string().max(255).optional(),
  contact_person_contact: z.string().max(255).optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().max(255).optional(),
  about: z.string().max(5000).optional(),
  photo: photoUpload,
  documents: documentUploads,
})
