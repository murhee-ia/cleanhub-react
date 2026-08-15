export default function PipelineBars({ items, total, emptyLabel }) {
  if (!total) {
    return <p className="employer-dashboard-muted-state">{emptyLabel}</p>
  }

  return (
    <div className="employer-pipeline">
      {items.map((item) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

        return (
          <div className="employer-pipeline__row" key={item.label}>
            <div className="employer-pipeline__label">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div
              className="employer-pipeline__track"
              role="progressbar"
              aria-label={`${item.label}: ${item.value} of ${total}`}
              aria-valuemin="0"
              aria-valuemax={total}
              aria-valuenow={item.value}
            >
              <span style={{ width: `${percentage}%`, background: item.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
