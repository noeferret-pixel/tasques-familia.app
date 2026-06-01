import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../lib/auth'
import { tasksForUser, isAbsent } from '../lib/tasks'
import { listenCompletions, completeTask, uncompleteTask, listenAbsences } from '../lib/store'
import { COLOR_HEX } from '../lib/data'
import { requestNotificationPermission } from '../lib/push'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const today = useMemo(() => new Date(), [])
  const [completions, setCompletions] = useState([])
  const [absences, setAbsences] = useState([])

  useEffect(() => listenCompletions(today, setCompletions), [today])
  useEffect(() => listenAbsences(setAbsences), [])

  const myTasks = tasksForUser(user.id, today, absences)
  const completedKeys = new Set(completions.map(c => c.key))
  const doneCount = myTasks.filter(t => completedKeys.has(t.key)).length
  const pct = myTasks.length ? Math.round((doneCount / myTasks.length) * 100) : 100
  const iAmAbsent = isAbsent(user.id, today, absences)

  async function toggle(task) {
    if (completedKeys.has(task.key)) await uncompleteTask(task)
    else await completeTask(task, user.id, today)
  }

  const greeting = new Date().getHours() < 14 ? 'Bon dia' : new Date().getHours() < 20 ? 'Bona tarda' : 'Bona nit'
  const hex = COLOR_HEX[user.color]

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-stone-400 text-sm">{greeting},</p>
          <h1 className="text-2xl font-display font-extrabold" style={{ color: hex }}>{user.name}</h1>
        </div>
        <button onClick={logout} className="text-sm text-stone-400 px-3 py-1 rounded-full bg-stone-100">Sortir</button>
      </header>

      {iAmAbsent && (
        <div className="bg-amber-100 text-amber-800 rounded-2xl p-3 mb-4 text-sm font-semibold">
          Estàs marcat com a absent. Les teves tasques passen a Noe.
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="font-display font-bold text-stone-700">Progrés d'avui</span>
          <span className="text-sm text-stone-400">{doneCount} de {myTasks.length}</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: hex }} />
        </div>
        {pct === 100 && myTasks.length > 0 && (
          <p className="text-center mt-3 font-display font-bold text-green-500">Tot fet! 🎉 +20 punts</p>
        )}
      </div>

      <h2 className="font-display font-bold text-stone-700 mb-3 px-1">Les teves tasques</h2>

      {myTasks.length === 0 ? (
        <p className="text-stone-400 text-center py-10">Avui no tens cap tasca 🎈</p>
      ) : (
        <div className="space-y-3">
          {myTasks.map((t, i) => {
            const done = completedKeys.has(t.key)
            return (
              <button key={t.key} onClick={() => toggle(t)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition animate-slideup"
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-2xl">{t.icon}</span>
                <span className={`flex-1 font-semibold ${done ? 'line-through text-stone-300' : 'text-stone-700'}`}>
                  {t.name}
                  {t.original !== t.assignee && (
                    <span className="block text-xs text-amber-500">reassignada per absència</span>
                  )}
                </span>
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${done ? 'animate-pop' : ''}`}
                  style={{ borderColor: hex, background: done ? hex : 'transparent' }}>
                  {done && <span className="text-white text-sm">✓</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <button onClick={requestNotificationPermission}
        className="mt-6 w-full text-sm text-stone-400 py-2">
        🔔 Activar notificacions
      </button>
    </div>
  )
}
