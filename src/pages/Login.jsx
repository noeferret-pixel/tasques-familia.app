import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { loginWithPin } = useAuth()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function press(n) {
    setError(false)
    const next = (pin + n).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (!loginWithPin(next)) { setError(true); setPin('') }
      }, 150)
    }
  }
  function back() { setError(false); setPin(pin.slice(0, -1)) }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-stone-50 px-8">
      <div className="text-7xl mb-4">🏠</div>
      <h1 className="font-display text-3xl font-extrabold text-stone-800 mb-2">Tasques Família</h1>
      <p className="text-stone-500 mb-8">Introdueix el teu PIN</p>
      <div className="flex gap-3 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`} />
        ))}
      </div>
      {error && <p className="text-red-500 font-semibold mb-4">PIN incorrecte</p>}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))}
            className="h-16 rounded-2xl bg-white shadow-sm font-display text-2xl font-bold text-stone-800 active:scale-90 transition">
            {n}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')}
          className="h-16 rounded-2xl bg-white shadow-sm font-display text-2xl font-bold text-stone-800 active:scale-90 transition">0</button>
        <button onClick={back}
          className="h-16 rounded-2xl font-display text-2xl font-bold text-stone-400 active:scale-90 transition">⌫</button>
      </div>
    </div>
  )
}
