import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// Cleaner-facing layout: green sidebar + yellow grid content area.
export default function CleanerLayout() {
  return (
    <div className="app-shell">
      <Sidebar role="cleaner" />
      <div className="main-with-sidebar grid-bg">
        <Outlet />
      </div>
    </div>
  )
}
