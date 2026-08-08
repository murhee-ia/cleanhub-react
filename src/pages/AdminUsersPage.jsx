import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getAdminUsers, adminKeys } from '../api/admin'
import { useDebounce } from '../hooks/useDebounce'
import DataTable from '../components/DataTable'
import FilterTabs from '../components/FilterTabs'
import Pagination from '../components/Pagination'
import TextField from '../components/TextField'
import UserStatusBadge from '../features/admin/UserStatusBadge'
import UserActionsCell from '../features/admin/UserActionsCell'
import ChangeRoleModal from '../features/admin/ChangeRoleModal'
import { useUserMutations } from '../features/admin/useUserMutations'

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'cleaner', label: 'Cleaners' },
  { value: 'employer', label: 'Employers' },
  { value: 'moderator', label: 'Moderators' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deleted', label: 'Deleted' },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [roleModalUser, setRoleModalUser] = useState(null)

  const debouncedSearch = useDebounce(search)
  const mutations = useUserMutations()

  const params = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(page > 1 ? { page } : {}),
  }

  const { data, isPending, isError } = useQuery({
    queryKey: adminKeys.users({ search: debouncedSearch, role, status, page }),
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  })

  const users = data?.data ?? []
  const meta = data?.meta

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          <span className="text-xs text-muted">{row.email}</span>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (row) => <span className="capitalize">{row.role}</span> },
    { key: 'status', header: 'Status', render: (row) => <UserStatusBadge user={row} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <UserActionsCell user={row} mutations={mutations} onChangeRole={setRoleModalUser} />
      ),
    },
  ]

  function resetTo(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div>
      <p className="page-breadcrumb">ADMIN · USERS</p>
      <div className="page-header">
        <h1>User management</h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div style={{ maxWidth: '22rem' }}>
          <TextField
            id="user-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <FilterTabs options={ROLE_OPTIONS} value={role} onChange={resetTo(setRole)} ariaLabel="Filter users by role" />
        <FilterTabs options={STATUS_OPTIONS} value={status} onChange={resetTo(setStatus)} ariaLabel="Filter users by status" />
      </div>

      <div className="mt-5">
        {isError ? (
          <p className="paper-flat p-4 text-sm text-danger">Couldn't load users.</p>
        ) : (
          <DataTable columns={columns} rows={users} loading={isPending} empty="No users match this filter." />
        )}
      </div>

      {meta && (
        <div className="mt-8">
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
        </div>
      )}

      <ChangeRoleModal
        user={roleModalUser}
        open={roleModalUser !== null}
        onClose={() => setRoleModalUser(null)}
        mutation={mutations.changeRole}
      />
    </div>
  )
}
