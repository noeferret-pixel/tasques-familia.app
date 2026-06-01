import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { USERS, COLOR_HEX } from '../lib/data'

export default function Login() {
  const { loginWithPin } = useAuth()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function press(n) {
    if (pin.length >= 4) return
    const next = pin + n
    setPin(next)
    setError(false)
    if (next.length === 4) {
      setTimeout(() => {
        if (!loginWithPin(next)) {
          setError(true)
          setPin('')
        }
      }, 150)
    }
  }

  function del() { setPin(p => p.slice(0, -1)); setError(false) }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-gradient-to-b from-rose-50 to-stone-50">
      <div className="text-7xl mb-2">🏠</div>
      <h1 className="text-3xl font-display font-extrabold text-stone-800 mb-1">Tasques Família</h1>
      <p className="text-stone-500 mb-8">Introdueix el teu PIN</p>

      <div className={`flex gap-3 mb-8 ${error ? 'animate-pop' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i}
            className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`} />
        ))}
      </div>
      {error && <p className="text-red-500 -mt-6 mb-4 font-semibold">PIN incorrecte</p>}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))}
            className="w-16 h-16 rounded-full bg-white shadow-sm text-2xl font-display font-bold text-stone-700 active:scale-90 transition">
            {n}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')}
          className="w-16 h-16 rounded-full bg-white shadow-sm text-2xl font-display font-bold text-stone-700 active:scale-90 transition">0</button>
        <button onClick={del}
          className="w-16 h-16 rounded-full text-2xl text-stone-400 active:scale-90 transition">⌫</button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {USERS.map(u => (
          <span key={u.id} className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: COLOR_HEX[u.color] + '22', color: COLOR_HEX[u.color] }}>
            {u.name}
          </span>
        ))}
      </div>
    </div>
  )
}
