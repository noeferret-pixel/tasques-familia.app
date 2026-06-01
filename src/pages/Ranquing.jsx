import { useEffect, useState } from 'react'
import { getCompletionsRange } from '../lib/store'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { USERS, COLOR_HEX, dateKey } from '../lib/data'
import { Avatar } from '../components/UI'

export default function Ranquing() {
  const [scores, setScores] = useState([])

  useEffect(() => {
    async function load() {
      // 1) Intentar llegir els punts consolidats (scoreboard.cjs els desa cada nit)
      const consolidated = {}
      try {
        const snap = await getDocs(collection(db, 'scores'))
        snap.docs.forEach(d => { consolidated[d.id] = d.data() })
      } catch (e) { /* col·lecció encara buida */ }

      // 2) Per als dies actius i com a fallback, comptar completions de l'últim any
      const to = new Date()
      const from = new Date(); from.setDate(to.getDate() - 364)
      const comps = await getCompletionsRange(dateKey(from), dateKey(to))

      const byUserDay = {}
      const fallbackPoints = {}
      USERS.forEach(u => { byUserDay[u.id] = {}; fallbackPoints[u.id] = 0 })
      comps.forEach(c => {
        if (fallbackPoints[c.userId] === undefined) return
        fallbackPoints[c.userId] += c.points || 10
        byUserDay[c.userId][c.date] = true
      })

      const ranked = USERS.map(u => ({
        ...u,
        // Si hi ha punts consolidats, fer-los servir (inclouen bonus); si no, fallback
        points: consolidated[u.id]?.total ?? fallbackPoints[u.id],
        perfectDays: consolidated[u.id]?.perfectDays ?? null,
        days: Object.keys(byUserDay[u.id]).length
      })).sort((a, b) => b.points - a.points)

      setScores(ranked)
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-display font-extrabold text-stone-800 mb-1">Rànquing 🏆</h1>
      <p className="text-stone-400 text-sm mb-5">Punts acumulats</p>

      <div className="space-y-3">
        {scores.map((u, i) => (
          <div key={u.id}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
            style={i < 3 ? { boxShadow: `0 0 0 2px ${COLOR_HEX[u.color]}33` } : {}}>
            <span className="w-8 text-center font-display font-extrabold text-lg text-stone-400">
              {medals[i] || i + 1}
            </span>
            <Avatar userId={u.id} />
            <div className="flex-1">
              <p className="font-display font-bold" style={{ color: COLOR_HEX[u.color] }}>{u.name}</p>
              <p className="text-xs text-stone-400">
                {u.perfectDays !== null ? `${u.perfectDays} dies perfectes` : `${u.days} dies actius`}
              </p>
            </div>
            <span className="font-display font-extrabold text-stone-700">{u.points}</span>
          </div>
        ))}
      </div>

      <div className="bg-stone-100 rounded-2xl p-4 mt-6 text-xs text-stone-500 leading-relaxed">
        <strong>Punts:</strong> tasca completada +10 · dia complet +20 · setmana perfecta +100.
        Els bonus es consoliden cada nit automàticament.
      </div>
    </div>
  )
}
