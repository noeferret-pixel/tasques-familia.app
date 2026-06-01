import { createContext, useContext, useState, useEffect } from 'react'
import { USERS } from './data'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('tf_user')
    if (saved) {
      const u = USERS.find(x => x.id === saved)
      if (u) setUser(u)
    }
  }, [])

  function loginWithPin(pin) {
    const u = USERS.find(x => x.pin === pin)
    if (u) {
      setUser(u)
      localStorage.setItem('tf_user', u.id)
      return true
    }
    return false
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('tf_user')
  }

  return (
    <AuthContext.Provider value={{ user, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
