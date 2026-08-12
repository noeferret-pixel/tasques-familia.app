import { useState, useEffect } from 'react'
import { Avatar, StatusDot } from '../components/UI.jsx'
import { USERS, dateKey } from '../lib/data.js'
import { buildDayTasks } from '../lib/tasks.js'
import { fetchCompletionsRange, subscribeAbsences } from '../lib/store.js'

export default function Historial() {
  const [comps, setComps] = useState(null)
  const [absences, setAbsences] = useState([])
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); days.push(d)
  }

  useEffect(() => subscribeAbsences(setAbsences), [])
  useEffect(() => {
    async function load() {
      setComps(await fetchCompletionsRange(days[0], days[days.length - 1]))
    }
    load()
    // eslint-disable-next-line
  }, [])

  if (!comps) return <div className="max-w-md mx-auto px-4 pt-10 text-center text-stone-400">Carregant…</div>

  function statusFor(userId, date) {
    const mine = buildDayTasks(date, absences).filter(t => t.assignee === userId)
    if (mine.length === 0) return null
    const dk = dateKey(date)
    const done = comps.filter(c => c.userId === userId && c.date === dk).length
    if (done === 0) return 'late'
    if (done >= mine.length) return 'done'
    return 'partial'
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl font-extrabold text-stone-800 mb-1">Historial 📊</h1>
      <p className="text-sm text-stone-400 mb-6">Últimes 2 setmanes</p>
      <div className="space-y-4">
        {USERS.map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Avatar userId={u.id} size={32} />
              <span className="font-display font-bold text-stone-800">{u.name}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {days.map(d => {
                const s = statusFor(u.id, d)
                return (
                  <div key={dateKey(d)} className="flex flex-col items-center w-7">
                    <span className="text-xs text-stone-300">{d.getDate()}</span>
                    {s ? <StatusDot status={s} /> : <span className="text-stone-200">·</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
