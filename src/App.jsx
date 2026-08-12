import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import { BottomNav } from './components/UI.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historial from './pages/Historial.jsx'
import Ranquing from './pages/Ranquing.jsx'
import Familia from './pages/Familia.jsx'
import Setmanals from './pages/Setmanals.jsx'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user?.admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  if (!user) return <Login />

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/ranquing" element={<Ranquing />} />
        <Route path="/familia" element={<AdminRoute><Familia /></AdminRoute>} />
        <Route path="/setmanals" element={<AdminRoute><Setmanals /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
