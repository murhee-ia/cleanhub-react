import { useQuery } from '@tanstack/react-query'
import { getJobCategories, jobCategoryKeys } from '../../api/jobCategories'

// Controlled multi-select over the live cleaning-job-categories list. `value` is
// an array of category ids; `onChange` receives the next array.
export default function CategorySelect({ value = [], onChange, error }) {
  const {
    data: categories = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: jobCategoryKeys.list(),
    queryFn: getJobCategories,
    staleTime: 5 * 60 * 1000,
  })

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((current) => current !== id) : [...value, id])
  }

  if (isPending) {
    return <p className="text-sm text-muted">Loading categories…</p>
  }
  if (isError) {
    return <p className="text-sm text-danger">Couldn’t load categories. Try again shortly.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const checked = value.includes(category.id)
          return (
            <li key={category.id}>
              <label
                className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-sm transition ${
                  checked ? 'border-primary bg-primary text-white' : 'bg-surface text-foreground'
                }`}
                style={checked ? undefined : { borderColor: 'var(--border)' }}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(category.id)}
                />
                {category.name}
              </label>
            </li>
          )
        })}
      </ul>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
