// ============================================================
//  Motor de tasques (FRONTEND)
//  Genera les tasques d'un dia i resol absències.
//  Les KEYS han de coincidir EXACTAMENT amb netlify/functions/_logic.cjs.
//  Format de key:
//    rotatives / cada-dos-dies:  `${id}__${dateKey}`
//    fixes de persona:           `${id}__${userId}__${dateKey}`
//    cuina/nen:                  `${id}__${dateKey}` (id ja únic: dinar, dinar_kid...)
// ============================================================

import {
  ROTATIVES, FIXES, ROTATION, KIDS, ADULTS, TASK_META,
  dayIndex, dateKey, epochDays, weekNumber, birthdayPerson
} from './data.js'

// Tasques "cada dos dies" (dia epoch parell): robot piscina + posar rentadores
function everyTwoDays(date) {
  if (epochDays(date) % 2 !== 0) return []
  return [
    { id: 'robot_posar', assignee: 'terry' },
    { id: 'robot_treure', assignee: 'terry' },
    { id: 'posar_rentadores', assignee: 'noe' }
  ]
}

function isAbsent(userId, date, absences) {
  const k = dateKey(date)
  return absences.some(a => a.userId === userId && k >= a.from && k <= a.to)
}

// Reparteix una tasca d'algú "fora" (absent o aniversari) entre la resta,
// de manera equitativa i determinista (frontend i servidor donen el mateix).
// Combinem el dia (perquè giri dia a dia) amb un hash de la key.
function distributeAmongOthers(excludedId, keyBase, date, absences) {
  const bday = birthdayPerson(date)
  const candidates = ROTATION.filter(id =>
    id !== excludedId &&
    id !== bday &&
    !isAbsent(id, date, absences)
  )
  if (candidates.length === 0) return excludedId // ningú disponible: es queda
  let h = epochDays(date)
  for (let i = 0; i < keyBase.length; i++) h = (h * 31 + keyBase.charCodeAt(i)) >>> 0
  return candidates[h % candidates.length]
}

// Resol l'assignat final: si l'original està absent o fa anys, es reparteix.
function resolveAssignee(originalId, date, absences, keyBase) {
  const bday = birthdayPerson(date)
  const out = isAbsent(originalId, date, absences) || originalId === bday
  if (out) return distributeAmongOthers(originalId, keyBase, date, absences)
  return originalId
}

function meta(id) {
  return TASK_META[id] || { name: id, icon: '📌' }
}

// Construeix TOTES les tasques del dia: [{ key, id, name, icon, original, assignee }]
export function buildDayTasks(date, absences = []) {
  const di = dayIndex(date)
  const k = dateKey(date)
  const wk = weekNumber(date)
  const out = []

  const push = (id, keyBase, originalAssignee) => {
    const m = meta(id)
    out.push({
      key: keyBase,
      id,
      name: m.name,
      icon: m.icon,
      original: originalAssignee,
      assignee: resolveAssignee(originalAssignee, date, absences, keyBase)
    })
  }

  // 1) rotatives diàries
  for (const t of ROTATIVES) {
    push(t.id, `${t.id}__${k}`, t.week[di])
  }

  // 2) cuina: adult altern (parell/senar de dia epoch) + 1 nen rotatiu
  const adultToday = ADULTS[epochDays(date) % 2]
  const kidCook = KIDS[epochDays(date) % KIDS.length]
  push('dinar', `dinar__${k}`, adultToday)
  push('sopar', `sopar__${k}`, adultToday)
  push('dinar_kid', `dinar_kid__${k}`, kidCook)
  push('sopar_kid', `sopar_kid__${k}`, kidCook)

  // 3) fixes de persona (Noe / Terry) segons dia
  for (const userId of Object.keys(FIXES)) {
    for (const f of FIXES[userId]) {
      if (f.days && !f.days.includes(di)) continue
      push(f.id, `${f.id}__${userId}__${k}`, userId)
    }
  }

  // 4) setmanals amb rotació especial
  //    Dimarts (di=1): menús i compra, alternen Terry/Noe per setmana
  if (di === 1) {
    push('menus_compra', `menus_compra__${k}`, ADULTS[wk % 2])
  }
  //    Dijous (di=3): lavabos porta un nen ajudant + sorra gats (nen rotatiu setmanal)
  if (di === 3) {
    const kid = KIDS[wk % KIDS.length]
    push('lavabos_kid', `lavabos_kid__${k}`, kid)
    push('sorra_gats', `sorra_gats__${k}`, kid)
  }
  //    Divendres (di=4): pols/terres porta un nen ajudant
  if (di === 4) {
    const kid = KIDS[wk % KIDS.length]
    push('pols_terres_kid', `pols_terres_kid__${k}`, kid)
  }

  // 5) cada dos dies
  for (const r of everyTwoDays(date)) {
    push(r.id, `${r.id}__${k}`, r.assignee)
  }

  return out
}

// Tasques d'un usuari concret (aplicant reassignació per absència)
export function tasksForUser(date, userId, absences = []) {
  return buildDayTasks(date, absences)
    .filter(t => t.assignee === userId)
    .map(t => ({
      ...t,
      reassigned: t.original !== t.assignee ? t.original : null
    }))
}
