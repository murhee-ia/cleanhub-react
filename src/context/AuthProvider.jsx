import { useCallback, useState } from 'react'
import { AuthContext } from './authContext'
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'auth_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// The backend exposes no current-user endpoint, so the session (token + user
// from the login/register response) is persisted to localStorage and rehydrated
// on load. Both register and login return { token, user }.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)

  const persistSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(
    async (credentials) => persistSession(await apiLogin(credentials)),
    [persistSession],
  )

  const register = useCallback(
    async (payload) => persistSession(await apiRegister(payload)),
    [persistSession],
  )

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {}) // server-side revocation is best-effort
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!token && !!user,
    isLoading: false,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
