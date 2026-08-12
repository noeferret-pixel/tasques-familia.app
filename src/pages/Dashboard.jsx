import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { Avatar } from '../components/UI.jsx'
import { tasksForUser } from '../lib/tasks.js'
import { COLOR_HEX, userById, birthdayPerson } from '../lib/data.js'
import { subscribeCompletions, completeTask, uncompleteTask, subscribeAbsences } from '../lib/store.js'
import { requestNotifications } from '../lib/push.js'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const today = useMemo(() => new Date(), [])
  const [completed, setCompleted] = useState(new Set())
  const [absences, setAbsences] = useState([])

  useEffect(() => subscribeCompletions(today, docs => setCompleted(new Set(docs.map(d => d.key)))), [today])
  useEffect(() => subscribeAbsences(setAbsences), [])

  const myTasks = tasksForUser(today, user.id, absences)
  const doneCount = myTasks.filter(t => completed.has(t.key)).length
  const pct = myTasks.length ? Math.round((doneCount / myTasks.length) * 100) : 0
  const color = COLOR_HEX[user.id]

  const bdayId = birthdayPerson(today)
  const isMyBirthday = bdayId === user.id

  // Tasques que m'han arribat avui per absència o aniversari d'algú altre.
  const reassignedToMe = tasksForUser(today, user.id, absences)
    .filter(t => t.reassigned).length

  function toggle(task) {
    if (completed.has(task.key)) uncompleteTask(task)
    else completeTask(task, user.id, today)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar userId={user.id} size={48} />
          <div>
            <h1 className="font-display text-xl font-extrabold text-stone-800">Hola, {user.name}!</h1>
            <p className="text-sm text-stone-400">
              {today.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-stone-400 font-semibold px-3 py-1">Surt</button>
      </div>

      {isMyBirthday && (
        <div className="rounded-2xl p-4 mb-4 text-center font-display font-extrabold text-white"
          style={{ background: color }}>
          🎉🎂 Feliç aniversari, {user.name}! 🎂🎉
          <span className="block text-sm font-semibold mt-1 opacity-90">
            Avui no et toca cap tasca. Gaudeix del dia!
          </span>
        </div>
      )}

      {bdayId && !isMyBirthday && (
        <div className="bg-amber-100 text-amber-800 rounded-2xl p-3 mb-4 text-sm font-semibold text-center">
          🎂 Avui és l'aniversari de {userById(bdayId)?.name}! Les seves tasques es reparteixen entre tots.
        </div>
      )}

      {reassignedToMe > 0 && (
        <div className="bg-amber-100 text-amber-800 rounded-2xl p-3 mb-4 text-sm font-semibold">
          {reassignedToMe} tasca(ques) reassignades a tu perquè algú està absent o fa anys.
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="font-display font-bold text-stone-700">Progrés d'avui</span>
          <span className="text-sm text-stone-400">{doneCount} de {myTasks.length}</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
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
            const done = completed.has(t.key)
            return (
              <button key={t.key} onClick={() => toggle(t)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition animate-slideup"
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-2xl">{t.icon}</span>
                <span className={`flex-1 font-semibold ${done ? 'line-through text-stone-300' : 'text-stone-700'}`}>
                  {t.name}
                  {t.reassigned && (
                    <span className="block text-xs text-amber-500">
                      reassignada ({userById(t.reassigned)?.name} absent)
                    </span>
                  )}
                </span>
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${done ? 'animate-pop' : ''}`}
                  style={{ borderColor: color, background: done ? color : 'transparent' }}>
                  {done && <span className="text-white text-sm">✓</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <button onClick={() => requestNotifications(user.id)}
        className="w-full mt-6 py-3 rounded-2xl bg-stone-100 text-stone-500 font-semibold text-sm active:scale-[0.98] transition">
        🔔 Activar notificacions
      </button>
    </div>
  )
}
