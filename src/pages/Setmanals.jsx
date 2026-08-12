import { useState, useEffect } from 'react'
import { Avatar } from '../components/UI.jsx'
import { USERS } from '../lib/data.js'
import { subscribeWeeklyTasks, addWeeklyTask, setWeeklyTaskDone, removeWeeklyTask } from '../lib/store.js'

export default function Setmanals() {
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState('')
  const [assignee, setAssignee] = useState('ariadna')

  useEffect(() => subscribeWeeklyTasks(setTasks), [])

  function add() {
    if (!name.trim()) return
    addWeeklyTask(name.trim(), assignee)
    setName('')
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl font-extrabold text-stone-800 mb-1">Setmanals 📝</h1>
      <p className="text-sm text-stone-400 mb-6">Tasques extra puntuals per assignar</p>

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la tasca"
          className="w-full mb-3 p-3 rounded-xl border border-stone-200 text-stone-700" />
        <select value={assignee} onChange={e => setAssignee(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border border-stone-200 font-semibold text-stone-700">
          {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button onClick={add}
          className="w-full py-3 rounded-xl bg-stone-800 text-white font-display font-bold active:scale-[0.98] transition">
          Afegir tasca
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-stone-400 text-center py-6">Cap tasca setmanal extra</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <Avatar userId={t.assignee} size={36} />
              <span className={`flex-1 font-semibold ${t.done ? 'line-through text-stone-300' : 'text-stone-700'}`}>{t.name}</span>
              <button onClick={() => setWeeklyTaskDone(t.id, !t.done)}
                className="text-sm font-semibold text-green-500 px-2">{t.done ? 'Desfer' : 'Fet'}</button>
              <button onClick={() => removeWeeklyTask(t.id)}
                className="text-red-500 font-semibold text-sm px-2">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
