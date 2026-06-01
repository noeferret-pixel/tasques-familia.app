import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './lib/auth'
import { BottomNav } from './components/UI'
import { listenForeground } from './lib/push'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Familia from './pages/Familia'
import Setmanals from './pages/Setmanals'
import Historial from './pages/Historial'
import Ranquing from './pages/Ranquing'

export default function App() {
  const { user } = useAuth()

  useEffect(() => { if (user) listenForeground() }, [user])

  if (!user) return <Login />

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/familia" element={user.admin ? <Familia /> : <Navigate to="/" />} />
        <Route path="/setmanals" element={user.admin ? <Setmanals /> : <Navigate to="/" />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/ranquing" element={<Ranquing />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </>
  )
}
