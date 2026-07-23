import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import CleanerLayout from './layouts/CleanerLayout'
import EmployerLayout from './layouts/EmployerLayout'
import ModeratorLayout from './layouts/ModeratorLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import PlaceholderPage from './pages/PlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'
import NotAllowedPage from './pages/NotAllowedPage'
import ProfileViewPage from './pages/ProfileViewPage'
import OwnProfilePage from './pages/OwnProfilePage'
import MyJobsPage from './pages/MyJobsPage'
import JobCreatePage from './pages/JobCreatePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public
      { path: '/', element: <HomePage /> },
      { path: '/jobs', element: <JobsPage /> },
      { path: '/jobs/:id', element: <JobDetailPage /> },
      { path: '/not-allowed', element: <NotAllowedPage /> },

      // Any authenticated user can view another user's profile.
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cleaners/:id', element: <ProfileViewPage role="cleaner" /> },
          { path: '/employers/:id', element: <ProfileViewPage role="employer" /> },
        ],
      },

      // Auth (centered card frame)
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },

      // Role-guarded areas (guards are UX only; backend policies are the gate)
      {
        path: '/cleaner',
        element: <ProtectedRoute roles={['cleaner']} />,
        children: [
          {
            element: <CleanerLayout />,
            children: [
              { index: true, element: <PlaceholderPage title="Cleaner dashboard" /> },
              { path: 'profile', element: <OwnProfilePage /> },
            ],
          },
        ],
      },
      {
        path: '/employer',
        element: <ProtectedRoute roles={['employer']} />,
        children: [
          {
            element: <EmployerLayout />,
            children: [
              { index: true, element: <PlaceholderPage title="Employer dashboard" /> },
              { path: 'profile', element: <OwnProfilePage /> },
              { path: 'jobs', element: <MyJobsPage /> },
              { path: 'jobs/new', element: <JobCreatePage /> },
            ],
          },
        ],
      },
      {
        path: '/moderator',
        element: <ProtectedRoute roles={['moderator', 'admin']} />,
        children: [
          {
            element: <ModeratorLayout />,
            children: [{ index: true, element: <PlaceholderPage title="Moderator dashboard" /> }],
          },
        ],
      },
      {
        path: '/admin',
        element: <ProtectedRoute roles={['admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [{ index: true, element: <PlaceholderPage title="Admin dashboard" /> }],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
