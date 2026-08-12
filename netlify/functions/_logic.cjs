// Lògica de tasques duplicada per al servidor (Netlify Function).
// Es manté en sincronia manual amb src/lib/data.js i src/lib/tasks.js.
// Si canvies rotacions al frontend, replica-les EXACTAMENT aquí (keys incloses).
// Convenció dies: 0=Dilluns ... 6=Diumenge.

const ROTATION = ['noe', 'terry', 'ariadna', 'biel', 'ona', 'bru']
const KIDS = ['ariadna', 'biel', 'ona', 'bru']
const ADULTS = ['terry', 'noe']

// Aniversaris (MM-DD). Qui fa anys no fa tasques aquell dia.
const BIRTHDAYS = {
  noe: '06-15', terry: '04-18', ariadna: '01-12',
  biel: '09-02', ona: '10-01', bru: '06-11'
}
function birthdayPerson(date) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return Object.keys(BIRTHDAYS).find(id => BIRTHDAYS[id] === mmdd) || null
}

const ROTATIVES = [
  { id: 'brossa',     week: ['noe','terry','ariadna','biel','ona','bru','noe'] },
  { id: 'rentaplats', week: ['terry','ariadna','biel','ona','bru','noe','terry'] },
  { id: 'terrassa',   week: ['ariadna','biel','ona','bru','noe','terry','ariadna'] },
  { id: 'pati',       week: ['biel','ona','bru','noe','terry','ariadna','biel'] },
  { id: 'gats_pel',   week: ['ona','bru','noe','terry','ariadna','biel','ona'] },
  { id: 'regar',      week: ['bru','noe','terry','ariadna','biel','ona','bru'] }
]

const FIXES = {
  noe: [
    { id: 'lavabos',           days: [3] },
    { id: 'rentar_tovalloles', days: [3] },
    { id: 'pols_terres',       days: [4] },
    { id: 'rentar_llencols',   days: [4] }
  ],
  terry: [
    { id: 'manteniment', days: [4] }
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

function epochDays(date) {
  return Math.floor(date.getTime() / 86400000)
}

function weekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

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

function distributeAmongOthers(excludedId, keyBase, date, absences) {
  const bday = birthdayPerson(date)
  const candidates = ROTATION.filter(id =>
    id !== excludedId && id !== bday && !isAbsent(id, date, absences)
  )
  if (candidates.length === 0) return excludedId
  let h = epochDays(date)
  for (let i = 0; i < keyBase.length; i++) h = (h * 31 + keyBase.charCodeAt(i)) >>> 0
  return candidates[h % candidates.length]
}

function resolveAssignee(originalId, date, absences, keyBase) {
  const bday = birthdayPerson(date)
  if (isAbsent(originalId, date, absences) || originalId === bday) {
    return distributeAmongOthers(originalId, keyBase, date, absences)
  }
  return originalId
}

// Retorna array de { key, assignee } per a tot el dia.
function buildDayTasks(date, absences) {
  const di = dayIndex(date)
  const k = dateKey(date)
  const wk = weekNumber(date)
  const out = []

  const add = (key, original) => out.push({ key, assignee: resolveAssignee(original, date, absences, key) })

  // 1) rotatives
  for (const t of ROTATIVES) add(`${t.id}__${k}`, t.week[di])

  // 2) cuina
  const adultToday = ADULTS[epochDays(date) % 2]
  const kidCook = KIDS[epochDays(date) % KIDS.length]
  add(`dinar__${k}`, adultToday)
  add(`sopar__${k}`, adultToday)
  add(`dinar_kid__${k}`, kidCook)
  add(`sopar_kid__${k}`, kidCook)

  // 3) fixes de persona
  for (const userId of Object.keys(FIXES)) {
    for (const f of FIXES[userId]) {
      if (f.days && !f.days.includes(di)) continue
      add(`${f.id}__${userId}__${k}`, userId)
    }
  }

  // 4) setmanals amb rotació especial
  if (di === 1) add(`menus_compra__${k}`, ADULTS[wk % 2])
  if (di === 3) {
    const kid = KIDS[wk % KIDS.length]
    add(`lavabos_kid__${k}`, kid)
    add(`sorra_gats__${k}`, kid)
  }
  if (di === 4) {
    const kid = KIDS[wk % KIDS.length]
    add(`pols_terres_kid__${k}`, kid)
  }

  // 5) cada dos dies
  for (const r of everyTwoDays(date)) add(`${r.id}__${k}`, r.assignee)

  return out
}

function tasksForUser(userId, date, absences) {
  return buildDayTasks(date, absences).filter(t => t.assignee === userId)
}

module.exports = { buildDayTasks, tasksForUser, dateKey, isAbsent }
