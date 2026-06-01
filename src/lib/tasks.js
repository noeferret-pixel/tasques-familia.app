import { ROTATIVES, FIXES, robotTasks, dayIndex, dateKey, USERS } from './data'

// Una "tasca instància" té: key únic (id + data), nom, icona, assignee original i actual.
// L'assignee es recalcula segons absències.

// absences: array de { userId, from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
export function isAbsent(userId, date, absences) {
  const k = dateKey(date)
  return absences.some(a => a.userId === userId && k >= a.from && k <= a.to)
}

// Genera TOTES les tasques d'un dia (rotatives + fixes + robot), amb assignee resolt.
export function buildDayTasks(date, absences) {
  const di = dayIndex(date)
  const k = dateKey(date)
  const tasks = []

  // Rotatives
  for (const t of ROTATIVES) {
    const original = t.week[di]
    tasks.push({
      key: `${t.id}__${k}`,
      taskId: t.id,
      name: t.name,
      icon: t.icon,
      type: 'rotativa',
      original,
      assignee: resolveAssignee(original, date, absences)
    })
  }

  // Fixes: cada dia, o només els dies indicats al camp `days`
  for (const userId of Object.keys(FIXES)) {
    for (const f of FIXES[userId]) {
      if (f.days && !f.days.includes(di)) continue
      tasks.push({
        key: `${f.id}__${userId}__${k}`,
        taskId: f.id,
        name: f.name,
        icon: f.icon,
        type: 'fixa',
        original: userId,
        assignee: resolveAssignee(userId, date, absences)
      })
    }
  }

  // Robot piscina: 0 tasques (dia que no toca) o 2 (posar + treure)
  for (const r of robotTasks(date)) {
    tasks.push({
      key: `${r.id}__${k}`,
      taskId: r.id,
      name: r.name,
      icon: r.icon,
      type: 'robot',
      original: r.assignee,
      assignee: resolveAssignee(r.assignee, date, absences)
    })
  }

  // Eliminar duplicats: si una persona té dues tasques amb el mateix nom el mateix
  // dia (ex. "Compra setmanal" rotativa + fixa), només en deixem una.
  const seen = new Set()
  return tasks.filter(t => {
    const dedupeKey = `${t.assignee}__${t.name}`
    if (seen.has(dedupeKey)) return false
    seen.add(dedupeKey)
    return true
  })
}

// Si l'usuari original és absent -> passa a Noe.
function resolveAssignee(originalId, date, absences) {
  if (originalId !== 'noe' && isAbsent(originalId, date, absences)) {
    return 'noe'
  }
  return originalId
}

// Tasques d'un usuari concret per a un dia (les que li toquen DESPRÉS de reassignar).
export function tasksForUser(userId, date, absences) {
  return buildDayTasks(date, absences).filter(t => t.assignee === userId)
}

// Compta quantes tasques s'han reassignat a Noe avui per absència de X.
export function reassignedCount(absentUserId, date, absences) {
  return buildDayTasks(date, absences).filter(
    t => t.original === absentUserId && t.assignee === 'noe'
  ).length
}

// Estat d'un membre segons tasques completades (per a la vista família).
// completedKeys: Set de keys completades avui.
export function memberStatus(userId, date, absences, completedKeys) {
  const mine = tasksForUser(userId, date, absences)
  if (mine.length === 0) return 'done'
  const done = mine.filter(t => completedKeys.has(t.key)).length
  if (done === mine.length) return 'done'      // 🟢
  if (done > 0) return 'partial'               // 🟡
  return 'late'                                // 🔴
}
