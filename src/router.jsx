import { createBrowserRouter } from 'react-router-dom'
import CleanerLayout from './layouts/CleanerLayout'
import EmployerLayout from './layouts/EmployerLayout'
import ModeratorLayout from './layouts/ModeratorLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import PlaceholderPage from './pages/PlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/jobs', element: <JobsPage /> },
  {
    path: '/cleaner',
    element: <CleanerLayout />,
    children: [{ index: true, element: <PlaceholderPage title="Cleaner dashboard" /> }],
  },
  {
    path: '/employer',
    element: <EmployerLayout />,
    children: [{ index: true, element: <PlaceholderPage title="Employer dashboard" /> }],
  },
  {
    path: '/moderator',
    element: <ModeratorLayout />,
    children: [{ index: true, element: <PlaceholderPage title="Moderator dashboard" /> }],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [{ index: true, element: <PlaceholderPage title="Admin dashboard" /> }],
  },
  { path: '*', element: <NotFoundPage /> },
])
