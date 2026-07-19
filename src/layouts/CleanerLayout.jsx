import { Outlet } from 'react-router-dom'

export default function CleanerLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
