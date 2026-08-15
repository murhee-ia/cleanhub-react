const SKELETON_CARDS = Array.from({ length: 4 }, (_, index) => index)

export default function EmployerDashboardSkeleton() {
  return (
    <div className="employer-dashboard-skeleton" aria-label="Loading employer dashboard" aria-busy="true">
      <div className="employer-dashboard-stats">
        {SKELETON_CARDS.map((item) => (
          <div className="employer-dashboard-skeleton__card paper-flat" key={item} />
        ))}
      </div>
      <div className="employer-dashboard-skeleton__grid">
        <div className="employer-dashboard-skeleton__panel paper-flat" />
        <div className="employer-dashboard-skeleton__panel paper-flat" />
      </div>
    </div>
  )
}
