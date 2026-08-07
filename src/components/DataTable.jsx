/**
 * DataTable — the one neo-brutalist table used across the moderation queue and
 * every admin management screen. Columns are declarative ({ key, header,
 * render, align }); the whole thing scrolls horizontally inside its own
 * container so a wide table never forces the page body to scroll sideways on a
 * small screen.
 */
export default function DataTable({
  columns,
  rows,
  keyField = 'id',
  loading = false,
  empty = 'Nothing to show yet.',
  onRowClick,
}) {
  return (
    <div className="paper-flat" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${columns.length * 8}rem` }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  textAlign: col.align ?? 'left',
                  padding: '12px 14px',
                  fontFamily: 'var(--heading)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-muted)',
                  borderBottom: '2px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '18px 14px' }} className="text-sm text-muted">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '18px 14px' }} className="text-sm text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  borderBottom: '1.5px solid rgba(0,0,0,0.1)',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                className={onRowClick ? 'data-row' : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 14px',
                      textAlign: col.align ?? 'left',
                      fontSize: '13px',
                      color: 'var(--color-foreground)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
