import { useQuery } from '@tanstack/react-query'
import { getJobCategories, jobCategoryKeys } from '../../api/jobCategories'
import TextField from '../../components/TextField'
import SelectField from '../../components/SelectField'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'soonest', label: 'Starting soonest' },
  { value: 'high_pay', label: 'Highest pay' },
  { value: 'top_employer', label: 'Top-rated employer' },
]

export default function JobFilters({
  draft,
  onDraftChange,
  categoryId,
  scheduleDate,
  sort,
  onParamChange,
}) {
  const { data: categories = [] } = useQuery({
    queryKey: jobCategoryKeys.list(),
    queryFn: getJobCategories,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="flex flex-col gap-4">
      <TextField
        id="job-search"
        label="Search"
        placeholder="Title, description, or employer"
        value={draft.search}
        onChange={(event) => onDraftChange('search', event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          id="job-category"
          label="Category"
          value={categoryId}
          onChange={(event) => onParamChange('category_id', event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <TextField
          id="job-country"
          label="Country"
          value={draft.country}
          onChange={(event) => onDraftChange('country', event.target.value)}
        />
        <TextField
          id="job-city"
          label="City"
          value={draft.city}
          onChange={(event) => onDraftChange('city', event.target.value)}
        />

        <TextField
          id="job-date"
          label="Schedule date"
          type="date"
          value={scheduleDate}
          onChange={(event) => onParamChange('schedule_date', event.target.value)}
        />

        <SelectField
          id="job-sort"
          label="Sort by"
          value={sort}
          onChange={(event) => onParamChange('sort', event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  )
}
