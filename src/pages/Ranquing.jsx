import { useState, useEffect } from 'react'
import { Avatar } from '../components/UI.jsx'
import { USERS, dateKey } from '../lib/data.js'
import { fetchScores, fetchCompletionsRange } from '../lib/store.js'

const REWARD_FREE_DAY = 200
const REWARD_CHOOSE_DINNER = 1000
// No comptar res anterior a aquesta data (ha de coincidir amb scoreboard.cjs).
const SEASON_START = '2026-08-14'

export default function Ranquing() {
  const [scores, setScores] = useState(null)

  useEffect(() => {
    async function load() {
      const s = await fetchScores()
      // Si scoreboard encara no ha corregut mai, fem un càlcul base amb +10/tasca.
      if (Object.keys(s).length === 0) {
        const to = new Date(); const from = new Date(); from.setDate(to.getDate() - 364)
        // No comptar res anterior a l'inici de temporada.
        const seasonFrom = new Date(SEASON_START + 'T00:00:00')
        const effFrom = from < seasonFrom ? seasonFrom : from
        const comps = await fetchCompletionsRange(effFrom, to)
        const totals = {}
        USERS.forEach(u => { totals[u.id] = 0 })
        comps.forEach(c => { if (totals[c.userId] != null) totals[c.userId] += c.points || 10 })
        const fallback = {}
        USERS.forEach(u => {
          const total = totals[u.id]
          fallback[u.id] = {
            total,
            freeDays: Math.floor(total / REWARD_FREE_DAY),
            dinnerChoices: Math.floor(total / REWARD_CHOOSE_DINNER),
            toNextFreeDay: REWARD_FREE_DAY - (total % REWARD_FREE_DAY),
            toNextDinner: REWARD_CHOOSE_DINNER - (total % REWARD_CHOOSE_DINNER)
          }
        })
        setScores(fallback)
      } else {
        setScores(s)
      }
    }
    load()
  }, [])

  if (!scores) return <div className="max-w-md mx-auto px-4 pt-10 text-center text-stone-400">Carregant…</div>

  const ranked = [...USERS].sort((a, b) => (scores[b.id]?.total || 0) - (scores[a.id]?.total || 0))
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="font-display text-2xl font-extrabold text-stone-800 mb-1">Rànquing 🏆</h1>
      <p className="text-sm text-stone-400 mb-6">Punts acumulats de la família</p>

      <div className="space-y-3 mb-8">
        {ranked.map((u, i) => {
          const s = scores[u.id] || { total: 0, toNextFreeDay: REWARD_FREE_DAY }
          return (
            <div key={u.id} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <span className="text-2xl w-8 text-center">{medals[i] || i + 1}</span>
              <Avatar userId={u.id} size={40} />
              <div className="flex-1">
                <p className="font-display font-bold text-stone-800">{u.name}</p>
                <p className="text-xs text-stone-400">{s.toNextFreeDay} punts per al proper dia lliure</p>
              </div>
              <span className="font-display font-extrabold text-lg text-stone-800">{s.total || 0}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-amber-100 rounded-3xl p-5">
        <h2 className="font-display font-bold text-amber-800 mb-3">Recompenses 🎁</h2>
        <div className="space-y-2 text-sm text-amber-800">
          <p>🏖️ Cada <b>200 punts</b> → un dia lliure de tasques (es reparteixen entre els altres 5)</p>
          <p>🍽️ Cada <b>1000 punts</b> → tries el sopar de l'endemà</p>
        </div>
        <div className="mt-4 space-y-2">
          {ranked.map(u => {
            const s = scores[u.id] || {}
            if (!s.freeDays && !s.dinnerChoices) return null
            return (
              <div key={u.id} className="flex items-center gap-2 text-sm text-amber-800">
                <Avatar userId={u.id} size={24} />
                <span className="font-semibold">{u.name}:</span>
                {s.freeDays > 0 && <span>{s.freeDays}× 🏖️</span>}
                {s.dinnerChoices > 0 && <span>{s.dinnerChoices}× 🍽️</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
