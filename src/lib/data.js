// Configuració central de la família, tasques i rotacions.
// Tot derivat del brief. Editable aquí sense tocar la resta del codi.

export const USERS = [
  { id: 'noe',     name: 'Noe',     pin: '1111', color: 'noe',     admin: true },
  { id: 'terry',   name: 'Terry',   pin: '2222', color: 'terry',   admin: true },
  { id: 'ariadna', name: 'Ariadna', pin: '3333', color: 'ariadna', admin: false },
  { id: 'biel',    name: 'Biel',    pin: '4444', color: 'biel',    admin: false },
  { id: 'ona',     name: 'Ona',     pin: '5555', color: 'ona',     admin: false },
  { id: 'bru',     name: 'Bru',     pin: '6666', color: 'bru',     admin: false }
]

export const COLOR_HEX = {
  noe: '#ef4444', terry: '#3b82f6', ariadna: '#f97316',
  biel: '#22c55e', ona: '#a855f7', bru: '#14b8a6'
}

// Ordre de dies: 0=Diumenge ... però fem servir índex propi DL..DG
// JS getDay(): 0=Dg,1=Dl,2=Dt,3=Dc,4=Dj,5=Dv,6=Ds
// El nostre array va [DL,DT,DC,DJ,DV,DS,DG]
export const DAY_LABELS = ['DL', 'DT', 'DC', 'DJ', 'DV', 'DS', 'DG']
export const DAY_NAMES = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge']

// Converteix Date -> índex 0..6 (0=Dilluns)
export function dayIndex(date) {
  const js = date.getDay() // 0=Dg
  return js === 0 ? 6 : js - 1
}

// Clau de data YYYY-MM-DD en local
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Tasques rotatives: ordre [DL,DT,DC,DJ,DV,DS,DG]
export const ROTATIVES = [
  { id: 'rentaplats_dinar', name: 'Buidar rentaplats dinar (tarda)', icon: '🍽️',
    week: ['ariadna','biel','ona','bru','terry','ariadna','biel'] },
  { id: 'rentaplats_sopar', name: 'Buidar rentaplats sopar (matí)', icon: '🍴',
    week: ['biel','ona','bru','terry','ariadna','biel','ona'] },
  { id: 'escombraries', name: 'Escombraries', icon: '🗑️',
    week: ['ona','bru','terry','ariadna','biel','ona','bru'] },
  { id: 'taula_cuina', name: 'Taula i recollida cuina', icon: '🪑',
    week: ['bru','terry','ariadna','biel','ona','bru','terry'] },
  { id: 'gats_menjar', name: 'Menjar i aigua gats', icon: '🐱',
    week: ['ariadna','biel','ona','bru','terry','ariadna','biel'] },
  { id: 'gats_terra', name: 'Terra gats', icon: '🧹',
    week: ['biel','ona','bru','terry','ariadna','biel','ona'] },
  { id: 'exterior', name: 'Exterior escombrar', icon: '🌿',
    week: ['terry','ariadna','biel','ona','bru','terry','ariadna'] }
]

// Tasques fixes. Si una tasca té camp `days`, només surt aquells dies de la
// setmana (0=DL, 1=DT, 2=DC, 3=DJ, 4=DV, 5=DS, 6=DG). Sense `days` = cada dia.
export const FIXES = {
  noe: [
    { id: 'fix_roba', name: 'Rentadores i plegar roba', icon: '🧺' },
    { id: 'fix_lavabos', name: 'Lavabos', icon: '🚽', days: [3] },          // dijous
    { id: 'fix_aspiradora', name: 'Aspiradora i fregar terres', icon: '🧼', days: [4] }, // divendres
    { id: 'fix_pols', name: 'Neteja de pols', icon: '🪶', days: [4] },       // divendres
    { id: 'fix_compra', name: 'Compra setmanal', icon: '🛒', days: [1] }     // dimarts
  ],
  terry: [
    { id: 'fix_manteniment', name: 'Manteniment casa', icon: '🔧' },
    { id: 'fix_compra_t', name: 'Compra setmanal', icon: '🛒', days: [1] }   // dimarts
  ]
}

// Robot piscina: dies alterns. El dia que toca, es posa I es treu (2 tasques).
// Els dies que no toca, no surt res. Sempre Terry.
// Referència: dia parell des de l'epoch = dia actiu.
export function robotTasks(date) {
  const epochDays = Math.floor(date.getTime() / 86400000)
  const actiu = epochDays % 2 === 0
  if (!actiu) return []
  return [
    { id: 'robot_posar', name: 'Posar robot piscina', icon: '🏊', assignee: 'terry' },
    { id: 'robot_treure', name: 'Treure robot piscina', icon: '🪣', assignee: 'terry' }
  ]
}

export function userById(id) {
  return USERS.find(u => u.id === id)
}
