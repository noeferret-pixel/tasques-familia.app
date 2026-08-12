// ============================================================
//  Tasques Família — dades i rotacions (FRONTEND)
//  Aquest fitxer defineix usuaris, rotacions i tasques fixes.
//  IMPORTANT: si canvies rotacions o keys aquí, replica-ho també a
//  netlify/functions/_logic.cjs (còpia per al servidor).
//  Convenció dies: 0=Dilluns, 1=Dimarts ... 6=Diumenge.
// ============================================================

export const USERS = [
  { id: 'noe',     name: 'Noe',     pin: '1111', admin: true,  birthday: '06-15' },
  { id: 'terry',   name: 'Terry',   pin: '2222', admin: true,  birthday: '04-18' },
  { id: 'ariadna', name: 'Ariadna', pin: '3333', admin: false, birthday: '01-12' },
  { id: 'biel',    name: 'Biel',    pin: '4444', admin: false, birthday: '09-02' },
  { id: 'ona',     name: 'Ona',     pin: '5555', admin: false, birthday: '10-01' },
  { id: 'bru',     name: 'Bru',     pin: '6666', admin: false, birthday: '06-11' }
]

// Retorna l'id de la persona que fa anys en una data (o null).
export function birthdayPerson(date) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const u = USERS.find(x => x.birthday === mmdd)
  return u ? u.id : null
}

export const COLOR_HEX = {
  noe: '#ef4444', terry: '#3b82f6', ariadna: '#f97316',
  biel: '#22c55e', ona: '#a855f7', bru: '#14b8a6'
}

export const ROTATION = ['noe', 'terry', 'ariadna', 'biel', 'ona', 'bru']
export const KIDS = ['ariadna', 'biel', 'ona', 'bru']
export const ADULTS = ['terry', 'noe']

// Metadades visuals de cada tasca (nom + icona) per id.
export const TASK_META = {
  // rotatives diàries
  brossa:      { name: 'Treure la brossa', icon: '🗑️' },
  rentaplats:  { name: 'Rentaplats i marbre (esmorzar, dinar, sopar)', icon: '🍽️' },
  terrassa:    { name: 'Escombrar terrassa davant i entrada garatge', icon: '🧹' },
  pati:        { name: 'Escombrar pati del darrere', icon: '🍂' },
  gats_pel:    { name: 'Aspirar pèl gats (sofà/butaques) i caques', icon: '🐱' },
  regar:       { name: 'Regar plantes (terrasses i jardí)', icon: '🪴' },
  // cuina
  dinar:       { name: 'Fer el dinar', icon: '🍲' },
  sopar:       { name: 'Fer el sopar', icon: '🍳' },
  dinar_kid:   { name: 'Ajudar a fer el dinar', icon: '🧒' },
  sopar_kid:   { name: 'Ajudar a fer el sopar', icon: '🧒' },
  // setmanals
  menus_compra:   { name: 'Fer menús i compra setmanal', icon: '🛒' },
  lavabos:        { name: 'Fer lavabos', icon: '🚽' },
  lavabos_kid:    { name: 'Fer lavabos (amb Noe)', icon: '🧒' },
  sorra_gats:     { name: 'Canviar sorra dels gats', icon: '🐾' },
  rentar_tovalloles: { name: 'Rentadora de tovalloles', icon: '🧺' },
  pols_terres:    { name: 'Treure pols, aspirar i fregar terres', icon: '🧼' },
  pols_terres_kid:{ name: 'Pols, aspirar i fregar (amb Noe)', icon: '🧒' },
  rentar_llencols:{ name: 'Rentadora de llençols (avís: baixar bruts i fer el llit amb nets)', icon: '🛏️' },
  manteniment:    { name: 'Manteniment (bombetes i xapusses)', icon: '🔧' },
  // cada dos dies
  robot_posar:    { name: 'Posar robot piscina', icon: '🏊' },
  robot_treure:   { name: 'Treure robot piscina', icon: '🪣' },
  posar_rentadores: { name: 'Posar rentadores', icon: '🌀' }
}

// ------------------------------------------------------------
//  1) ROTATIVES DIÀRIES — cada dia una persona diferent, rotatiu.
//     week[di] amb di 0=DL..6=DG. Cada tasca desplaça l'inici
//     perquè cada dia les 6 tasques quedin repartides.
// ------------------------------------------------------------
export const ROTATIVES = [
  { id: 'brossa',     week: ['noe','terry','ariadna','biel','ona','bru','noe'] },
  { id: 'rentaplats', week: ['terry','ariadna','biel','ona','bru','noe','terry'] },
  { id: 'terrassa',   week: ['ariadna','biel','ona','bru','noe','terry','ariadna'] },
  { id: 'pati',       week: ['biel','ona','bru','noe','terry','ariadna','biel'] },
  { id: 'gats_pel',   week: ['ona','bru','noe','terry','ariadna','biel','ona'] },
  { id: 'regar',      week: ['bru','noe','terry','ariadna','biel','ona','bru'] }
]

// ------------------------------------------------------------
//  2) TASQUES FIXES per persona (amb dies opcionals 0=DL..6=DG).
//     Sense `days` = cada dia.
// ------------------------------------------------------------
export const FIXES = {
  noe: [
    { id: 'lavabos',           days: [3] },  // dijous
    { id: 'rentar_tovalloles', days: [3] },  // dijous
    { id: 'pols_terres',       days: [4] },  // divendres
    { id: 'rentar_llencols',   days: [4] }   // divendres
  ],
  terry: [
    { id: 'manteniment', days: [4] }         // divendres
  ]
}

// ------------------------------------------------------------
//  UTILITATS DE DATA (idèntiques al servidor)
// ------------------------------------------------------------
export function dayIndex(date) {
  const js = date.getDay()          // 0=DG..6=DS
  return js === 0 ? 6 : js - 1      // 0=DL..6=DG
}

export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function epochDays(date) {
  return Math.floor(date.getTime() / 86400000)
}

// Número de setmana ISO (per alternar setmanes Terry/Noe i triar el nen).
export function weekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

export function userById(id) {
  return USERS.find(u => u.id === id)
}
