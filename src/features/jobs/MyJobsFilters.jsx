import TextField from '../../components/TextField'
import SelectField from '../../components/SelectField'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'closed', label: 'Closed' },
  { value: 'removed', label: 'Removed' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'soonest', label: 'Starting soonest' },
]

export default function MyJobsFilters({
  draft,
  onDraftChange,
  status,
  scheduleDate,
  sort,
  onParamChange,
}) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        id="my-jobs-search"
        label="Search"
        placeholder="Title or description"
        value={draft.search}
        onChange={(event) => onDraftChange('search', event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          id="my-jobs-status"
          label="Status"
          value={status}
          onChange={(event) => onParamChange('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <TextField
          id="my-jobs-date"
          label="Schedule date"
          type="date"
          value={scheduleDate}
          onChange={(event) => onParamChange('schedule_date', event.target.value)}
        />

        <SelectField
          id="my-jobs-sort"
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
