import { COLOR_HEX, userById } from '../lib/data'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Avatar({ userId, size = 40 }) {
  const u = userById(userId)
  const hex = COLOR_HEX[u?.color] || '#999'
  const initial = u?.name?.[0] || '?'
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold text-white shrink-0"
      style={{ width: size, height: size, background: hex, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  )
}

export function StatusDot({ status }) {
  const map = { done: '🟢', partial: '🟡', late: '🔴' }
  return <span className="text-lg">{map[status]}</span>
}

export function BottomNav() {
  const { user } = useAuth()
  if (!user) return null
  const items = [
    { to: '/', label: 'Avui', icon: '🏠' },
    { to: '/historial', label: 'Historial', icon: '📊' },
    { to: '/ranquing', label: 'Rànquing', icon: '🏆' }
  ]
  if (user.admin) {
    items.splice(1, 0, { to: '/familia', label: 'Família', icon: '👨‍👩‍👧‍👦' })
    items.splice(2, 0, { to: '/setmanals', label: 'Setmanals', icon: '📝' })
  }
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex justify-around items-center h-16 z-20 pb-[env(safe-area-inset-bottom)]">
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-0.5 px-2 ${isActive ? 'text-stone-900 font-bold' : 'text-stone-400'}`
          }>
          <span className="text-xl">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
