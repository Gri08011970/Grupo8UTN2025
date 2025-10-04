import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      const { user, token } = JSON.parse(saved)
      setUser(user); setToken(token)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { user, token } = await authApi.login(email, password)
    setUser(user); setToken(token)
    localStorage.setItem('auth', JSON.stringify({ user, token }))
    return user
  }, [])

  const register = useCallback(async (payload) => {
    const { user, token } = await authApi.register(payload)
    setUser(user); setToken(token)
    localStorage.setItem('auth', JSON.stringify({ user, token }))
    return user
  }, [])

  const logout = useCallback(() => {
    setUser(null); setToken(null)
    localStorage.removeItem('auth')
  }, [])

  const value = { user, token, isAuthenticated: !!token, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
