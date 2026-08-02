import { z } from 'zod'
import { countWords } from '../helpers/wordCount'
import { MAX_DOCUMENT_MB } from '../helpers/fileLimits'

export const MESSAGE_WORD_LIMIT = 101
const MAX_RESUME_BYTES = MAX_DOCUMENT_MB * 1024 * 1024

// A file input always yields a FileList; the form only ever sends its first entry.
function toFile(value) {
  return value instanceof FileList ? value[0] : value
}

const resume = z
  .any()
  .optional()
  .refine(
    (value) => {
      const file = toFile(value)
      return !file || (file.type === 'application/pdf' && file.size <= MAX_RESUME_BYTES)
    },
    { message: `Attach a single PDF under ${MAX_DOCUMENT_MB} MB` },
  )

export const applySchema = z.object({
  message: z
    .string()
    .optional()
    .refine((value) => countWords(value) <= MESSAGE_WORD_LIMIT, {
      message: `Message must be ${MESSAGE_WORD_LIMIT} words or fewer`,
    }),
  resume,
})

// Shared by the employer's private note and the optional decision message the
// cleaner receives — the backend caps both at the same length.
export const DECISION_MESSAGE_MAX = 2000

export const applicationNoteSchema = z.object({
  note: z
    .string()
    .max(DECISION_MESSAGE_MAX, `Note must be ${DECISION_MESSAGE_MAX} characters or fewer`)
    .optional(),
})
