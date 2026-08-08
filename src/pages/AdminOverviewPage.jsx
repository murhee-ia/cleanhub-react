import { useQuery } from '@tanstack/react-query'
import { getOverview, adminKeys } from '../api/admin'
import StatCard from '../features/admin/StatCard'

export default function AdminOverviewPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.overview(),
    queryFn: getOverview,
  })

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · OVERVIEW</p>
      <div className="page-header">
        <h1>Platform overview</h1>
      </div>

      {isError ? (
        <p className="paper-flat mt-6 p-4 text-sm text-danger">Couldn't load the overview.</p>
      ) : isPending ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div
          className="mt-6 grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))' }}
        >
          <StatCard label="Total users" value={data.users.total} accent />
          <StatCard label="Open reports" value={data.reports.open} accent />
          <StatCard label="Cleaners" value={data.users.cleaners} />
          <StatCard label="Employers" value={data.users.employers} />
          <StatCard label="Moderators" value={data.users.moderators} />
          <StatCard label="Suspended" value={data.users.suspended} />
          <StatCard label="Job posts" value={data.jobs} />
          <StatCard label="Applications" value={data.applications} />
          <StatCard label="Reports" value={data.reports.total} />
          <StatCard label="Ratings" value={data.ratings} />
        </div>
      )}
    </div>
  )
}
