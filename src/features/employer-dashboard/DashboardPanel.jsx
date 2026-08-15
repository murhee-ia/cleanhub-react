export default function DashboardPanel({ eyebrow, title, action, className = '', children }) {
  return (
    <section className={`employer-dashboard-panel paper-flat ${className}`}>
      <header className="employer-dashboard-panel__header">
        <div>
          {eyebrow && <p className="employer-dashboard-panel__eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
