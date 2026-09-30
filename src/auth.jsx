import { createContext, useContext, useState } from 'react'
import { api } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_user')) } catch { return null }
  })

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('pos_token', data.token)
    localStorage.setItem('pos_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await api.post('/auth/logout/') } catch { /* token may already be gone */ }
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>{children}</AuthCtx.Provider>
}
