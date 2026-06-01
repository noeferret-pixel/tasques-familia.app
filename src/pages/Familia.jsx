import { useEffect, useState, useMemo } from 'react'
import { USERS, COLOR_HEX, dateKey } from '../lib/data'
import { memberStatus, tasksForUser, reassignedCount } from '../lib/tasks'
import { listenCompletions, listenAbsences, addAbsence, removeAbsence } from '../lib/store'
import { Avatar, StatusDot } from '../components/UI'

export default function Familia() {
  const today = useMemo(() => new Date(), [])
  const [completions, setCompletions] = useState([])
  const [absences, setAbsences] = useState([])
  const [showAbs, setShowAbs] = useState(false)

  useEffect(() => listenCompletions(today, setCompletions), [today])
  useEffect(() => listenAbsences(setAbsences), [])

  const completedKeys = new Set(completions.map(c => c.key))

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-display font-extrabold text-stone-800 mb-5">La família</h1>

      <div className="space-y-3 mb-6">
        {USERS.map(u => {
          const status = memberStatus(u.id, today, absences, completedKeys)
          const tasks = tasksForUser(u.id, today, absences)
          const done = tasks.filter(t => completedKeys.has(t.key)).length
          return (
            <div key={u.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <Avatar userId={u.id} />
              <div className="flex-1">
                <p className="font-display font-bold" style={{ color: COLOR_HEX[u.color] }}>{u.name}</p>
                <p className="text-xs text-stone-400">{done} de {tasks.length} tasques</p>
              </div>
              <StatusDot status={status} />
            </div>
          )
        })}
      </div>

      {/* Avisos d'absència actius avui */}
      {absences.filter(a => dateKey(today) >= a.from && dateKey(today) <= a.to).map(a => {
        const n = reassignedCount(a.userId, today, absences)
        const u = USERS.find(x => x.id === a.userId)
        if (n === 0 || !u) return null
        return (
          <div key={a.id} className="bg-amber-100 text-amber-800 rounded-2xl p-3 mb-2 text-sm font-semibold flex justify-between items-center">
            <span>{n} tasques reassignades a Noe per absència de {u.name}</span>
            <button onClick={() => removeAbsence(a.id)} className="text-amber-600 ml-2">✕</button>
          </div>
        )
      })}

      <button onClick={() => setShowAbs(s => !s)}
        className="w-full bg-stone-800 text-white rounded-2xl py-3 font-display font-bold mt-3">
        {showAbs ? 'Tancar' : '➕ Marcar absència'}
      </button>

      {showAbs && <AbsenceForm onAdd={() => setShowAbs(false)} />}
    </div>
  )
}

function AbsenceForm({ onAdd }) {
  const [userId, setUserId] = useState('biel')
  const [from, setFrom] = useState(dateKey(new Date()))
  const [to, setTo] = useState(dateKey(new Date()))

  async function submit() {
    if (from > to) return
    await addAbsence(userId, from, to)
    onAdd()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3 space-y-3 animate-slideup">
      <select value={userId} onChange={e => setUserId(e.target.value)}
        className="w-full border border-stone-200 rounded-xl p-2">
        {USERS.filter(u => u.id !== 'noe').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <div className="flex gap-2">
        <label className="flex-1 text-xs text-stone-400">Des de
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="w-full border border-stone-200 rounded-xl p-2 text-stone-700" />
        </label>
        <label className="flex-1 text-xs text-stone-400">Fins a
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="w-full border border-stone-200 rounded-xl p-2 text-stone-700" />
        </label>
      </div>
      <button onClick={submit}
        className="w-full bg-amber-500 text-white rounded-xl py-2 font-display font-bold">
        Confirmar absència
      </button>
    </div>
  )
}
