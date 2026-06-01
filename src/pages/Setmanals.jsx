import { useEffect, useState } from 'react'
import { USERS, COLOR_HEX } from '../lib/data'
import { listenWeeklyTasks, addWeeklyTask, toggleWeeklyTask, removeWeeklyTask } from '../lib/store'
import { Avatar } from '../components/UI'

export default function Setmanals() {
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState('')
  const [assignee, setAssignee] = useState('ariadna')

  useEffect(() => listenWeeklyTasks(setTasks), [])

  async function add() {
    if (!name.trim()) return
    await addWeeklyTask(name.trim(), assignee)
    setName('')
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-display font-extrabold text-stone-800 mb-1">Tasques setmanals</h1>
      <p className="text-stone-400 text-sm mb-5">Extres assignables a qualsevol membre</p>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ex: Netejar nevera, ordenar traster..."
          className="w-full border border-stone-200 rounded-xl p-3" />
        <select value={assignee} onChange={e => setAssignee(e.target.value)}
          className="w-full border border-stone-200 rounded-xl p-3">
          {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button onClick={add}
          className="w-full bg-stone-800 text-white rounded-xl py-3 font-display font-bold">Afegir tasca</button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-stone-400 text-center py-6">Cap tasca setmanal extra</p>}
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
            <Avatar userId={t.assignee} size={34} />
            <span className={`flex-1 font-semibold ${t.done ? 'line-through text-stone-300' : 'text-stone-700'}`}>{t.name}</span>
            <button onClick={() => toggleWeeklyTask(t.id, !t.done)}
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: COLOR_HEX[USERS.find(u=>u.id===t.assignee)?.color], background: t.done ? COLOR_HEX[USERS.find(u=>u.id===t.assignee)?.color] : 'transparent' }}>
              {t.done && <span className="text-white text-sm">✓</span>}
            </button>
            <button onClick={() => removeWeeklyTask(t.id)} className="text-stone-300 px-1">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
