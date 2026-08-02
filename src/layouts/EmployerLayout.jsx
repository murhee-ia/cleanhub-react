import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// Employer-facing layout: green sidebar + yellow grid content area.
export default function EmployerLayout() {
  return (
    <div className="app-shell">
      <Sidebar role="employer" />
      <div className="main-with-sidebar grid-bg">
        <Outlet />
      </div>
    </div>
  )
}
