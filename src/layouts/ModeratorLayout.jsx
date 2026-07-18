import { Outlet } from 'react-router-dom'

export default function ModeratorLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
