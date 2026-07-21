import { useState } from 'react'
import { X } from 'lucide-react'

// Controlled free-text tag entry (used for languages). `value` is an array of
// strings; Enter or comma commits the draft, Backspace on an empty field pops
// the last tag.
export default function TagsInput({ value = [], onChange, id, placeholder, error }) {
  const [draft, setDraft] = useState('')

  function addTag(raw) {
    const tag = raw.trim()
    setDraft('')
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
  }

  function removeTag(tag) {
    onChange(value.filter((current) => current !== tag))
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(draft)
    } else if (event.key === 'Backspace' && !draft && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex flex-wrap items-center gap-2 rounded-md border bg-surface px-2 py-2"
        style={{ borderColor: error ? 'var(--color-danger)' : 'var(--border)' }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-highlight-muted px-2 py-0.5 text-sm capitalize text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-muted transition hover:text-danger"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={placeholder}
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-foreground outline-none"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
