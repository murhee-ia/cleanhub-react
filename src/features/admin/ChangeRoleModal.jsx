import { useState } from 'react'
import Modal from '../../components/Modal'
import Button from '../../components/Button'
import SelectField from '../../components/SelectField'

// admin is intentionally omitted — the role can never be granted from the UI,
// matching the backend which rejects it.
const ROLE_OPTIONS = [
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'employer', label: 'Employer' },
  { value: 'moderator', label: 'Moderator' },
]

export default function ChangeRoleModal({ user, open, onClose, mutation }) {
  const [role, setRole] = useState(user?.role ?? 'cleaner')

  // Reset the selection to the current role whenever a different user's modal
  // opens — the "adjust state from props during render" pattern, so there's no
  // effect firing an extra render just to sync.
  const [prevUserId, setPrevUserId] = useState(user?.id)
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id)
    setRole(user.role)
  }

  if (!user) return null

  function handleSubmit() {
    mutation.mutate({ id: user.id, role }, { onSuccess: onClose })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Change role — ${user.name}`}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={mutation.isPending || role === user.role}>
            {mutation.isPending ? 'Saving…' : 'Save role'}
          </Button>
        </>
      }
    >
      <SelectField
        id="change-role"
        label="Role"
        value={role}
        onChange={(event) => setRole(event.target.value)}
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      {mutation.isError && (
        <p className="mt-3 text-sm text-danger">Couldn't change the role. Please try again.</p>
      )}
    </Modal>
  )
}
