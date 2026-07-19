import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'

// Wraps the whole tree in AuthProvider so it can use router hooks and every
// route can read auth state. Sits inside RouterProvider + QueryClientProvider.
export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
