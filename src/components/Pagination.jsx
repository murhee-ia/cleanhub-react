import Button from './Button'

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-4" aria-label="Pagination">
      <Button
        variant="ghost"
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted">
        Page {currentPage} of {lastPage}
      </span>
      <Button
        variant="ghost"
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
