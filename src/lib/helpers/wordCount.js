// Matches the backend's confirmed rule: trim first, split on whitespace, count
// non-empty tokens; the cap is inclusive (<= limit passes). An empty or
// whitespace-only bio counts as 0 and passes (bio is optional).
export const BIO_WORD_LIMIT = 101

export function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}
