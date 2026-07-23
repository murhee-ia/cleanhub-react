// Client-side mirrors of the backend's upload size caps (the server stays the
// real gate). Used by both the FileInput hints/checks and the Zod refinements.
export const MAX_PHOTO_MB = 5
export const MAX_DOCUMENT_MB = 10
export const MAX_MEDIA_MB = 5
export const MAX_MEDIA_FILES = 10
