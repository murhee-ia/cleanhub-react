import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileClock,
  ListChecks,
  Plus,
  Star,
  UserCheck,
  Users,
} from 'lucide-react'
import { employerOverviewKeys, getEmployerOverview } from '../api/employerOverview'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { formatDate, formatTimestampDate } from '../lib/helpers/datetime'
import DashboardPanel from '../features/employer-dashboard/DashboardPanel'
import DashboardStatCard from '../features/employer-dashboard/DashboardStatCard'
import EmployerDashboardEmptyState from '../features/employer-dashboard/EmployerDashboardEmptyState'
import EmployerDashboardSkeleton from '../features/employer-dashboard/EmployerDashboardSkeleton'
import PipelineBars from '../features/employer-dashboard/PipelineBars'

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

const STATUS_LABELS = {
  draft: 'Draft',
  open: 'Open',
  reviewing: 'Reviewing',
  closed: 'Closed',
  completed: 'Completed',
  removed: 'Removed',
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

function statusBadgeStyle(status) {
  if (status === 'open' || status === 'accepted' || status === 'completed') {
    return { background: 'var(--color-primary-subtle)' }
  }
  if (status === 'reviewing' || status === 'pending') {
    return { background: 'var(--color-highlight)' }
  }
  if (status === 'removed' || status === 'rejected') {
    return { background: 'var(--color-caution)' }
  }
  return { background: 'var(--color-highlight-muted)' }
}

function DashboardHeader() {
  return (
    <header className="employer-dashboard-header">
      <div>
        <p className="page-breadcrumb">EMPLOYER · MANAGEMENT DESK</p>
        <h1>Hiring overview</h1>
        <p>Track your posts, applicants, schedules, and outcomes at a glance.</p>
      </div>
      <div className="employer-dashboard-header__actions">
        <Link className="employer-dashboard-link-button" to="/employer/jobs">
          <ListChecks size={17} /> Manage posts
        </Link>
        <Link className="employer-dashboard-link-button employer-dashboard-link-button--primary" to="/employer/jobs/new">
          <Plus size={17} /> Post a job
        </Link>
      </div>
    </header>
  )
}

function AttentionQueue({ attention }) {
  const items = [
    { label: 'Draft posts', value: attention.draft_posts, icon: FileClock, to: '/employer/jobs' },
    { label: 'Pending applicants', value: attention.pending_applications, icon: Users, to: '/employer/jobs' },
    { label: 'Closing within 7 days', value: attention.closing_soon, icon: Clock3, to: '/employer/jobs' },
    { label: 'Past work to complete', value: attention.awaiting_completion, icon: CheckCircle2, to: '/employer/jobs?status=closed' },
    { label: 'Cleaner ratings due', value: attention.unrated_cleaners, icon: Star, to: '/employer/jobs?status=completed' },
  ]
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="employer-attention paper-flat">
      <div className="employer-attention__intro">
        <span className="employer-attention__icon" aria-hidden="true"><CircleAlert size={22} /></span>
        <div>
          <p className="employer-dashboard-panel__eyebrow">NEEDS ATTENTION</p>
          <h2>{total ? `${total} item${total === 1 ? '' : 's'} to move forward` : 'You are all caught up'}</h2>
        </div>
      </div>
      <div className="employer-attention__items">
        {items.map(({ label, value, icon: Icon, to }) => (
          <Link className="employer-attention__item" to={to} key={label}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PriorityJobs({ jobs }) {
  if (!jobs.length) {
    return <p className="employer-dashboard-muted-state">No active job posts need attention.</p>
  }

  return (
    <div className="employer-job-table" role="list">
      {jobs.map((job) => (
        <article className="employer-job-row" key={job.id} role="listitem">
          <div className="employer-job-row__main">
            <div className="employer-job-row__titleline">
              <Link to={`/employer/jobs/${job.id}`}>{job.title}</Link>
              <Badge style={statusBadgeStyle(job.visibility === 'draft' ? 'draft' : job.status)}>
                {job.visibility === 'draft' ? 'Draft' : STATUS_LABELS[job.status]}
              </Badge>
            </div>
            <p>{job.category} · {job.city}, {job.country}</p>
            <div className="employer-job-row__meta">
              <span><Users size={15} /> {job.applications_count} applicants</span>
              <span><Clock3 size={15} /> {job.application_deadline ? `Closes ${formatDate(job.application_deadline)}` : 'No deadline'}</span>
            </div>
          </div>
          <div className="employer-job-row__counts" aria-label={`${job.pending_applications_count} pending and ${job.accepted_applications_count} accepted`}>
            <span><strong>{job.pending_applications_count}</strong> pending</span>
            <span><strong>{job.accepted_applications_count}</strong> hired</span>
          </div>
          <Link
            className="employer-row-action"
            to={job.applications_count ? `/employer/jobs/${job.id}/applicants` : `/employer/jobs/${job.id}`}
          >
            {job.applications_count ? 'Applicants' : 'View post'} <ArrowRight size={16} />
          </Link>
        </article>
      ))}
    </div>
  )
}

function ApplicationTrend({ trend }) {
  const points = trend.slice(-14)
  const maxValue = Math.max(...points.map((point) => point.value), 1)

  if (!points.some((point) => point.value > 0)) {
    return <p className="employer-dashboard-muted-state">No applications arrived in this period yet.</p>
  }

  return (
    <div className="employer-trend" aria-label="Applications received over time">
      {points.map((point) => (
        <div className="employer-trend__column" key={point.label} title={`${point.label}: ${point.value}`}>
          <strong>{point.value || ''}</strong>
          <span
            style={{
              height: point.value ? `${Math.max((point.value / maxValue) * 100, 4)}%` : 0,
              borderWidth: point.value ? undefined : 0,
            }}
          />
          <small>{point.label.slice(5)}</small>
        </div>
      ))}
    </div>
  )
}

function PerformancePanel({ performance, range, onRangeChange }) {
  const metrics = [
    ['Posts created', performance.posts_created],
    ['Applications', performance.applications_received],
    ['Avg. per post', performance.average_applicants_per_post],
    ['Fill rate', `${performance.fill_rate}%`],
  ]

  return (
    <DashboardPanel
      eyebrow="PERFORMANCE"
      title="Hiring activity"
      className="employer-performance-panel"
      action={(
        <label className="employer-range-select">
          <span className="sr-only">Performance range</span>
          <select className="neo-input" value={range} onChange={(event) => onRangeChange(event.target.value)}>
            {RANGE_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
      )}
    >
      <div className="employer-performance-metrics">
        {metrics.map(([label, value]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
      <ApplicationTrend trend={performance.application_trend} />
    </DashboardPanel>
  )
}

function UpcomingJobs({ jobs }) {
  if (!jobs.length) {
    return <p className="employer-dashboard-muted-state">Accepted work will appear here once it is scheduled.</p>
  }

  return (
    <div className="employer-upcoming-list">
      {jobs.map((job) => (
        <Link to={`/employer/jobs/${job.id}`} key={job.id}>
          <span className="employer-upcoming-list__date"><CalendarCheck size={18} /> {formatDate(job.schedule_date)}</span>
          <strong>{job.title}</strong>
          <small>{job.accepted_applications_count} hired · {job.city}</small>
        </Link>
      ))}
    </div>
  )
}

function RecentApplications({ applications }) {
  if (!applications.length) {
    return <p className="employer-dashboard-muted-state">Applications to your jobs will appear here.</p>
  }

  return (
    <div className="employer-activity-list">
      {applications.map((application) => (
        <article key={application.id}>
          <span className="employer-activity-list__avatar" aria-hidden="true">
            {application.cleaner.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <Link to={`/employer/cleaners/${application.cleaner.id}`}>{application.cleaner.name}</Link>
            <p>Applied to <strong>{application.job.title}</strong></p>
            <small>
              {formatTimestampDate(application.created_at)}
              {application.cleaner.rating_average !== null && ` · ★ ${application.cleaner.rating_average} (${application.cleaner.rating_count})`}
            </small>
          </div>
          <Badge style={statusBadgeStyle(application.status)}>{STATUS_LABELS[application.status]}</Badge>
        </article>
      ))}
    </div>
  )
}

function ReputationCard({ reputation }) {
  return (
    <DashboardPanel eyebrow="REPUTATION" title="Employer rating">
      <div className="employer-reputation">
        <span className="employer-reputation__score">
          <Star size={28} fill="var(--color-highlight-strong)" />
          <strong>{reputation.average_rating ?? 'New'}</strong>
        </span>
        <p>
          {reputation.rating_count
            ? `Based on ${reputation.rating_count} completed-job ${reputation.rating_count === 1 ? 'review' : 'reviews'}.`
            : 'Your completed-job reviews will build your hiring reputation here.'}
        </p>
        <div className="employer-reputation__stats">
          <span><strong>{reputation.completed_relationships}</strong> completed relationships</span>
          <span><strong>{reputation.ratings_to_give}</strong> cleaner ratings due</span>
        </div>
      </div>
    </DashboardPanel>
  )
}

function NotificationsPreview({ notifications }) {
  return (
    <DashboardPanel
      eyebrow="UPDATES"
      title="Recent notifications"
      action={<Link className="employer-panel-link" to="/employer/notifications">View all</Link>}
    >
      {notifications.items.length ? (
        <div className="employer-notification-list">
          {notifications.items.map((notification) => (
            <Link to="/employer/notifications" key={notification.id}>
              <span className={notification.read_at ? '' : 'is-unread'} aria-hidden="true" />
              <div><p>{notification.message}</p><small>{formatTimestampDate(notification.created_at)}</small></div>
            </Link>
          ))}
        </div>
      ) : <p className="employer-dashboard-muted-state">No notifications yet.</p>}
    </DashboardPanel>
  )
}

export default function EmployerDashboardPage() {
  const [range, setRange] = useState('30d')
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: employerOverviewKeys.detail(range),
    queryFn: () => getEmployerOverview(range),
  })

  const jobPipelineItems = useMemo(() => data ? [
    { label: 'Draft', value: data.job_pipeline.draft, color: 'var(--color-highlight-muted)' },
    { label: 'Open', value: data.job_pipeline.open, color: 'var(--color-primary-subtle)' },
    { label: 'Reviewing', value: data.job_pipeline.reviewing, color: 'var(--color-highlight-strong)' },
    { label: 'Closed', value: data.job_pipeline.closed, color: 'var(--color-caution)' },
    { label: 'Completed', value: data.job_pipeline.completed, color: 'var(--color-primary)' },
    { label: 'Hidden', value: data.job_pipeline.removed, color: 'var(--color-caution)' },
  ] : [], [data])

  const applicantPipelineItems = useMemo(() => data ? [
    { label: 'Pending', value: data.applicant_pipeline.pending, color: 'var(--color-highlight-strong)' },
    { label: 'Accepted', value: data.applicant_pipeline.accepted, color: 'var(--color-primary-subtle)' },
    { label: 'Completed', value: data.applicant_pipeline.completed, color: 'var(--color-primary)' },
    { label: 'Rejected', value: data.applicant_pipeline.rejected, color: 'var(--color-caution)' },
    { label: 'Withdrawn', value: data.applicant_pipeline.withdrawn, color: 'var(--color-highlight-muted)' },
  ] : [], [data])

  return (
    <main className="page-content employer-dashboard">
      <DashboardHeader />

      {isPending ? <EmployerDashboardSkeleton /> : isError ? (
        <section className="employer-dashboard-error paper-flat" role="alert">
          <CircleAlert size={28} />
          <div><h2>We couldn’t load your hiring overview</h2><p>Try again to reconnect to your dashboard data.</p></div>
          <Button type="button" onClick={() => refetch()}>Try again</Button>
        </section>
      ) : data.summary.total_posts === 0 ? <EmployerDashboardEmptyState /> : (
        <>
          <section className="employer-dashboard-stats" aria-label="Hiring summary">
            <DashboardStatCard label="Active posts" value={data.summary.active_posts} detail="Open or under review" icon={BriefcaseBusiness} to="/employer/jobs" accent="green" />
            <DashboardStatCard label="Pending applicants" value={data.summary.pending_applicants} detail="Waiting for a decision" icon={Users} to="/employer/jobs" accent="yellow" />
            <DashboardStatCard label="Accepted cleaners" value={data.summary.accepted_cleaners} detail="Across your job posts" icon={UserCheck} to="/employer/jobs" />
            <DashboardStatCard label="Upcoming jobs" value={data.summary.upcoming_jobs} detail="Accepted and scheduled" icon={CalendarCheck} />
          </section>

          <AttentionQueue attention={data.attention} />

          <div className="employer-dashboard-grid employer-dashboard-grid--pipelines">
            <DashboardPanel eyebrow="JOB TRACKING" title="Post pipeline" action={<span className="employer-panel-total">{data.job_pipeline.total} total</span>}>
              <PipelineBars items={jobPipelineItems} total={data.job_pipeline.total} emptyLabel="No job posts yet." />
            </DashboardPanel>
            <DashboardPanel eyebrow="HIRING TRACKING" title="Applicant funnel" action={<span className="employer-panel-total">{data.applicant_pipeline.total} total</span>}>
              <PipelineBars items={applicantPipelineItems} total={data.applicant_pipeline.total} emptyLabel="No applicants yet." />
            </DashboardPanel>
          </div>

          <DashboardPanel
            eyebrow="MANAGEMENT QUEUE"
            title="Priority job posts"
            action={<Link className="employer-panel-link" to="/employer/jobs">View all posts</Link>}
          >
            <PriorityJobs jobs={data.priority_jobs} />
          </DashboardPanel>

          <div className="employer-dashboard-grid employer-dashboard-grid--analysis">
            <PerformancePanel performance={data.performance} range={range} onRangeChange={setRange} />
            <div className="employer-dashboard-stack">
              <DashboardPanel eyebrow="SCHEDULE" title="Upcoming work" action={<CalendarCheck size={19} aria-hidden="true" />}>
                <UpcomingJobs jobs={data.upcoming_jobs} />
              </DashboardPanel>
              <ReputationCard reputation={data.reputation} />
            </div>
          </div>

          <div className="employer-dashboard-grid employer-dashboard-grid--activity">
            <DashboardPanel eyebrow="APPLICANT ACTIVITY" title="Newest applicants" action={<Activity size={19} aria-hidden="true" />}>
              <RecentApplications applications={data.recent_applications} />
            </DashboardPanel>
            <NotificationsPreview notifications={data.notifications} />
          </div>

          <section className="employer-dashboard-footer-note">
            <FileClock size={18} aria-hidden="true" />
            <span>Dashboard numbers update as you publish jobs and make applicant decisions.</span>
            <Link to="/employer/jobs">Open management view <ArrowRight size={15} /></Link>
          </section>
        </>
      )}
    </main>
  )
}
