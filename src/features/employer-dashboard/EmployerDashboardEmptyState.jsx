import { ArrowRight, BriefcaseBusiness, ClipboardList, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmployerDashboardEmptyState() {
  return (
    <section className="employer-dashboard-empty paper-flat">
      <div className="employer-dashboard-empty__art" aria-hidden="true">
        <span><BriefcaseBusiness size={38} /></span>
        <Sparkles className="employer-dashboard-empty__spark" size={28} />
      </div>
      <div className="employer-dashboard-empty__copy">
        <p className="employer-dashboard-panel__eyebrow">YOUR HIRING DESK STARTS HERE</p>
        <h2>Post your first cleaning job</h2>
        <p>
          Once your first post is live, this dashboard will organize applicants,
          schedules, hiring progress, and performance in one place.
        </p>
        <div className="employer-dashboard-empty__actions">
          <Link className="employer-dashboard-link-button employer-dashboard-link-button--primary" to="/employer/jobs/new">
            Post a job <ArrowRight size={17} />
          </Link>
          <Link className="employer-dashboard-link-button" to="/employer/jobs">
            <ClipboardList size={17} /> View job posts
          </Link>
        </div>
      </div>
    </section>
  )
}
