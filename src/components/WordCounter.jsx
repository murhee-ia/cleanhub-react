import { countWords, BIO_WORD_LIMIT } from '../lib/helpers/wordCount'

// Displays a live "n / limit words" readout. Non-blocking placeholder until the
// backend's exact counting rule is confirmed (see lib/helpers/wordCount.js).
export default function WordCounter({ text, limit = BIO_WORD_LIMIT }) {
  const count = countWords(text)
  const over = count > limit
  return (
    <span className={`text-sm ${over ? 'text-danger' : 'text-muted'}`}>
      {count} / {limit} words
    </span>
  )
}
