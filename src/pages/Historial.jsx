import { useEffect, useState } from 'react'
import { getCompletionsRange } from '../lib/store'
import { dateKey } from '../lib/data'
import { buildDayTasks as buildTasks } from '../lib/tasks'

function rangeKeys(days) {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (days - 1))
  return { from: dateKey(from), to: dateKey(to), fromDate: from, toDate: to }
}

export default function Historial() {
  const [period, setPeriod] = useState(7)
  const [pct, setPct] = useState(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      const { from, to, fromDate, toDate } = rangeKeys(period)
      const comps = await getCompletionsRange(from, to)
      // Total esperat: suma de tasques generades cada dia (sense absències a l'historial, aprox.)
      let expected = 0
      const cur = new Date(fromDate)
      while (cur <= toDate) {
        expected += buildTasks(new Date(cur), []).length
        cur.setDate(cur.getDate() + 1)
      }
      if (!active) return
      setCount(comps.length)
      setPct(expected ? Math.round((comps.length / expected) * 100) : 0)
    }
    load()
    return () => { active = false }
  }, [period])

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-display font-extrabold text-stone-800 mb-5">Historial</h1>

      <div className="flex gap-2 mb-6">
        {[{d:7,l:'7 dies'},{d:30,l:'30 dies'},{d:365,l:'1 any'}].map(o => (
          <button key={o.d} onClick={() => setPeriod(o.d)}
            className={`flex-1 py-2 rounded-xl font-display font-bold text-sm ${period===o.d?'bg-stone-800 text-white':'bg-white text-stone-500 shadow-sm'}`}>
            {o.l}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <div className="text-6xl font-display font-extrabold text-stone-800 mb-1">
          {pct === null ? '…' : `${pct}%`}
        </div>
        <p className="text-stone-400">de compliment</p>
        <p className="text-sm text-stone-400 mt-3">{count} tasques completades</p>
      </div>
    </div>
  )
}
