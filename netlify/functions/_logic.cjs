// Lògica de tasques duplicada per al servidor (Netlify Function).
// Es manté en sincronia manual amb src/lib/data.js i src/lib/tasks.js.
// Si canvies rotacions al frontend, replica-les aquí.

const ROTATIVES = [
  { id: 'rentaplats_dinar', week: ['ariadna','biel','ona','bru','terry','ariadna','biel'] },
  { id: 'rentaplats_sopar', week: ['biel','ona','bru','terry','ariadna','biel','ona'] },
  { id: 'escombraries',     week: ['ona','bru','terry','ariadna','biel','ona','bru'] },
  { id: 'taula_cuina',      week: ['bru','terry','ariadna','biel','ona','bru','terry'] },
  { id: 'gats_menjar',      week: ['ariadna','biel','ona','bru','terry','ariadna','biel'] },
  { id: 'gats_terra',       week: ['biel','ona','bru','terry','ariadna','biel','ona'] },
  { id: 'exterior',         week: ['terry','ariadna','biel','ona','bru','terry','ariadna'] }
]

// Fixes amb dies opcionals (0=DL ... 6=DG). Sense `days` = cada dia.
const FIXES = {
  noe: [
    { id: 'fix_roba' },
    { id: 'fix_lavabos', days: [3] },
    { id: 'fix_aspiradora', days: [4] },
    { id: 'fix_pols', days: [4] },
    { id: 'fix_compra', days: [1] }
  ],
  terry: [
    { id: 'fix_manteniment' },
    { id: 'fix_compra_t', days: [1] }
  ]
}

function dayIndex(date) {
  const js = date.getDay()
  return js === 0 ? 6 : js - 1
}

function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function robotTasks(date) {
  const epochDays = Math.floor(date.getTime() / 86400000)
  if (epochDays % 2 !== 0) return []
  return [
    { id: 'robot_posar', assignee: 'terry' },
    { id: 'robot_treure', assignee: 'terry' }
  ]
}

function isAbsent(userId, date, absences) {
  const k = dateKey(date)
  return absences.some(a => a.userId === userId && k >= a.from && k <= a.to)
}

function resolveAssignee(originalId, date, absences) {
  if (originalId !== 'noe' && isAbsent(originalId, date, absences)) return 'noe'
  return originalId
}

// Retorna array de { key, assignee } per a tot el dia.
function buildDayTasks(date, absences) {
  const di = dayIndex(date)
  const k = dateKey(date)
  const out = []
  for (const t of ROTATIVES) {
    const original = t.week[di]
    out.push({ key: `${t.id}__${k}`, assignee: resolveAssignee(original, date, absences) })
  }
  for (const userId of Object.keys(FIXES)) {
    for (const f of FIXES[userId]) {
      if (f.days && !f.days.includes(di)) continue
      out.push({ key: `${f.id}__${userId}__${k}`, assignee: resolveAssignee(userId, date, absences) })
    }
  }
  for (const r of robotTasks(date)) {
    out.push({ key: `${r.id}__${k}`, assignee: resolveAssignee(r.assignee, date, absences) })
  }
  return out
}

// Tasques assignades a un usuari concret en un dia (després de reassignar absències).
function tasksForUser(userId, date, absences) {
  return buildDayTasks(date, absences).filter(t => t.assignee === userId)
}

module.exports = { buildDayTasks, tasksForUser, dateKey, isAbsent }
