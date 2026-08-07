import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { getAdminCategories, adminKeys } from '../api/admin'
import DataTable from '../components/DataTable'
import Button from '../components/Button'
import Badge from '../components/Badge'
import CategoryFormModal from '../features/admin/CategoryFormModal'

const ACTIVE_STYLE = { background: 'var(--color-primary-subtle)', color: 'var(--color-foreground)', borderColor: 'var(--color-foreground)', borderWidth: '2px' }
const RETIRED_STYLE = { background: 'var(--color-highlight-muted)', color: 'var(--color-muted)', borderColor: 'rgba(0,0,0,0.2)', borderWidth: '2px' }

export default function AdminCategoriesPage() {
  // null = closed; 'new' = create; an object = edit that category.
  const [editing, setEditing] = useState(null)

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: getAdminCategories,
  })

  const categories = data ?? []

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
    { key: 'slug', header: 'Slug', render: (row) => <span className="text-muted">{row.slug}</span> },
    {
      key: 'is_active',
      header: 'State',
      render: (row) => <Badge style={row.is_active ? ACTIVE_STYLE : RETIRED_STYLE}>{row.is_active ? 'active' : 'retired'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button variant="ghost" type="button" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => setEditing(row)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · CATEGORIES</p>
      <div className="page-header">
        <h1>Categories</h1>
        <Button type="button" onClick={() => setEditing('new')}>
          <Plus className="size-4 shrink-0" aria-hidden="true" /> New category
        </Button>
      </div>

      <div className="mt-6">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load categories.</p>
        ) : (
          <DataTable columns={columns} rows={categories} loading={isPending} empty="No categories yet." />
        )}
      </div>

      <CategoryFormModal
        category={editing && editing !== 'new' ? editing : null}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
    </div>
  )
}
