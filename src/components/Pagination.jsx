import Button from './Button'

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null
  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <Button
        variant="ghost"
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        ← Prev
      </Button>

      <span
        style={{
          fontFamily: 'var(--heading)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-foreground)',
          background: 'var(--color-surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '6px 14px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Page {currentPage} of {lastPage}
      </span>

      <Button
        variant="ghost"
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next →
      </Button>
    </nav>
  )
}
