import { useState, useEffect } from 'react'
import { Avatar } from '../components/UI.jsx'
import { USERS, userById, dateKey } from '../lib/data.js'
import { subscribeAbsences, addAbsence, removeAbsence } from '../lib/store.js'

export default function Familia() {
  const [absences, setAbsences] = useState([])
  const [who, setWho] = useState('ariadna')
  const [from, setFrom] = useState(dateKey(new Date()))
  const [to, setTo] = useState(dateKey(new Date()))

  useEffect(() => subscribeAbsences(setAbsences), [])

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl font-extrabold text-stone-800 mb-1">Família 👨‍👩‍👧‍👦</h1>
      <p className="text-sm text-stone-400 mb-6">Gestiona absències. Les tasques d'un absent es reparteixen entre la resta.</p>

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
        <h2 className="font-display font-bold text-stone-700 mb-3">Nova absència</h2>
        <select value={who} onChange={e => setWho(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border border-stone-200 font-semibold text-stone-700">
          {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="flex gap-2 mb-3">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-stone-200 text-stone-700" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-stone-200 text-stone-700" />
        </div>
        <button onClick={() => from && to && addAbsence(who, from, to)}
          className="w-full py-3 rounded-xl bg-stone-800 text-white font-display font-bold active:scale-[0.98] transition">
          Afegir
        </button>
      </div>

      <h2 className="font-display font-bold text-stone-700 mb-3 px-1">Absències actives</h2>
      {absences.length === 0 ? (
        <p className="text-stone-400 text-center py-6">Cap absència registrada</p>
      ) : (
        <div className="space-y-3">
          {absences.map(a => (
            <div key={a.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <Avatar userId={a.userId} size={36} />
              <div className="flex-1">
                <p className="font-semibold text-stone-700">{userById(a.userId)?.name}</p>
                <p className="text-xs text-stone-400">{a.from} → {a.to}</p>
              </div>
              <button onClick={() => removeAbsence(a.id)} className="text-red-500 font-semibold text-sm px-2">Treure</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
