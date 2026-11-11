/**
 * LifeOS deterministic-core regression suite.
 * Run: node tests/check.mjs
 */

const store = new Map()

globalThis.window = {
  __ModuleLoader__: { def: null, load(definition) { this.def = definition } },
  localStorage: {
    getItem(key) { return store.has(key) ? store.get(key) : null },
    setItem(key, value) { store.set(key, String(value)) },
    removeItem(key) { store.delete(key) },
  },
  setInterval() { return 0 },
  clearInterval() {},
  requestAnimationFrame(callback) { callback() },
}

await import('../client.js')

const definition = globalThis.window.__ModuleLoader__.def
if (!definition || definition.id !== '@local/lifeos') throw new Error('client module did not register')

const ReactStub = {
  createElement: (...args) => ({ args }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
  useRef: (value) => ({ current: value }),
}
const plugin = definition.factory((name) => {
  if (name === 'react') return ReactStub
  throw new Error('unexpected require: ' + name)
})
const api = plugin.__internal
const failures = []

function check(label, actual, expected) {
  const a = actual instanceof Date ? api.toISO(actual) : actual
  const e = expected instanceof Date ? api.toISO(expected) : expected
  const ok = JSON.stringify(a) === JSON.stringify(e)
  if (!ok) failures.push(`${label}: got ${JSON.stringify(a)}, expected ${JSON.stringify(e)}`)
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} = ${JSON.stringify(a)}`)
}

const today = new Date(2026, 10, 9) // Monday 2026-11-09

/* --- dates ---------------------------------------------------------- */
check('parseISO rejects 2026-02-30', api.parseISO('2026-02-30'), null)
check('parseAnyDate accepts 2026年11月9日', api.toISO(api.parseAnyDate('2026年11月9日')), '2026-11-09')
check('diffDays 2026-11-09 → 2027-01-01', api.diffDays(today, new Date(2027, 0, 1)), 53)
check('leap day 2028-02-29 parses', api.toISO(api.parseISO('2028-02-29')), '2028-02-29')
check('breakdown 2026-11-09 → 2030-03-08', JSON.stringify(api.breakdown(today, new Date(2030, 2, 8))), JSON.stringify({ years: 3, months: 3, days: 27 }))
check('addMonths clamps 2026-01-31 + 1', api.toISO(api.addMonths(new Date(2026, 0, 31), 1)), '2026-02-28')

/* --- retirement policy ---------------------------------------------- */
function retire(birth, sex, flex) { return api.retirementInfo({ birthDate: birth, sex, flexMonths: flex || 0, retireMode: 'auto' }) }
check('male 1965-01 → 2025-02-15', api.toISO(retire('1965-01-15', 'male').date), '2025-02-15')
check('male 1976-09 → 2039-09-01', api.toISO(retire('1976-09-01', 'male').date), '2039-09-01')
check('female55 1970-01 → 2025-02-10', api.toISO(retire('1970-01-10', 'female55').date), '2025-02-10')
check('female50 1984-11 → 2039-11-01', api.toISO(retire('1984-11-01', 'female50').date), '2039-11-01')
check('early option floor 60', retire('1985-03-02', 'male', -36).effectiveMonths, 720)
check('manual retirement wins', api.toISO(api.retirementInfo({ retireMode: 'manual', retireDate: '2050-06-30' }).date), '2050-06-30')
check('manual mode without date falls back', api.retirementInfo({ retireMode: 'manual', birthDate: '1985-03-02', sex: 'male' }) !== null, true)

/* --- holidays ------------------------------------------------------- */
const spring = api.holidayPeriods(new Date(2026, 1, 1)).find((item) => item.name === '春节')
check('2026 spring span', spring.span, 9)
check('2026 spring make-up days', spring.work.map((date) => api.toISO(date)).join(','), '2026-02-14,2026-02-28')
const merged = api.holidayPeriods(new Date(2025, 8, 1)).find((item) => item.name.indexOf('国庆') === 0)
check('2025 national + mid-autumn', merged.span, 8)
check('2027 new year first upcoming', api.holidayPeriods(today)[0].name, '元旦')
check('day type: holiday', api.dayInfo(new Date(2026, 9, 1)).type, 'holiday')
check('day type: make-up workday', api.dayInfo(new Date(2026, 9, 10)).type, 'makeup')
check('day type: weekend', api.dayInfo(new Date(2026, 10, 8)).type, 'weekend')
check('day type: work', api.dayInfo(new Date(2026, 10, 9)).type, 'work')
check('rest day check', api.isRestDay(new Date(2026, 9, 1)), true)

/* --- leave ---------------------------------------------------------- */
const leaves = [
  { id: 'a', type: 'annual', name: '年假', start: '2026-11-10', end: '2026-11-12', countsAsLeave: true },
  { id: 'b', type: 'custom', name: '旅行', start: '2026-03-01', end: '2026-03-01', countsAsLeave: false },
]
check('leaveDays inclusive', api.leaveDays(leaves[0]), 3)
const state = api.sanitize(api.defaultState())
state.leaves = leaves
state.profile.leaveQuota = 5
state.profile.leaveCarry = 2
const stats = api.leaveStats(state, 2026)
check('leave used only counts annual', stats.used, 3)
check('leave remaining', stats.left, 4)

/* --- planner -------------------------------------------------------- */
const plans = api.planLeave(api.sanitize({ profile: { leaveQuota: 5 } }), { budget: 3, from: '2026-09-20', to: '2026-10-15', sort: 'longest' })
check('planner finds plans', plans.length > 0, true)
check('best plan continuous days', plans[0].continuous, 13)
check('best plan cost', plans[0].cost, 3)
check('best plan starts', api.toISO(plans[0].first), '2026-09-25')
check('planner never invents rest days', plans[0].continuous > plans[0].cost, true)
const cheap = api.planLeave(api.sanitize({}), { budget: 3, from: '2026-09-20', to: '2026-10-15', sort: 'cheapest' })
check('cheapest sort starts with cost 1', cheap[0].cost, 1)

/* --- work and pay --------------------------------------------------- */
const work = api.workStatus({ workStart: '09:00', workEnd: '18:00', workdays: [1, 2, 3, 4, 5] }, new Date(2026, 10, 9, 10, 0))
check('work status working', work.state, 'working')
check('work minutes left', work.minutes, 480)
const after = api.workStatus({ workStart: '09:00', workEnd: '18:00', workdays: [1, 2, 3, 4, 5] }, new Date(2026, 10, 9, 19, 0))
check('work status off after hours', after.state, 'off')
check('next work start', api.toISO(after.next), '2026-11-10')
const rest = api.workStatus({ workStart: '09:00', workEnd: '18:00', workdays: [1, 2, 3, 4, 5] }, new Date(2026, 10, 7, 10, 0))
check('weekend is off', rest.state, 'off')
check('payday this month', api.toISO(api.nextPayday({ salaryDay: 15 }, today)), '2026-11-15')
check('payday rolls to next month', api.toISO(api.nextPayday({ salaryDay: 15 }, new Date(2026, 10, 20))), '2026-12-15')
check('no payday configured', api.nextPayday({ salaryDay: '' }, today), null)

/* --- fun, pet, month ------------------------------------------------ */
const fun = api.dailyFun(today)
check('fun is deterministic', JSON.stringify(api.dailyFun(today)), JSON.stringify(fun))
check('fun ranges', fun.slack >= 0 && fun.slack <= 100 && fun.coffee >= 0 && fun.coffee <= 100, true)
check('pet level 0', api.petLevel(0), 1)
check('pet level 50', api.petLevel(50), 2)
const grid = api.monthGrid(2026, 9, state)
check('month grid has 42 cells', grid.length, 42)
check('october 1 is a holiday cell', grid.find((cell) => api.toISO(cell.date) === '2026-10-01').info.type, 'holiday')

/* --- migration and achievements ------------------------------------- */
const migrated = api.migrateLegacy({
  birthDate: '1985-03-02', sex: 'male', flexMonths: -12, careerStart: '2015-07-01',
  retireDate: '', lang: 'zh', showBuiltin: true,
  customs: [{ id: 'x', name: '年假', start: '2026-11-10', end: '2026-11-12', yearly: false }],
})
check('legacy customs become leaves', migrated.leaves.length, 1)
check('legacy leave range kept', migrated.leaves[0].end, '2026-11-12')
check('legacy profile kept', migrated.profile.birthDate, '1985-03-02')
const legacyManual = api.migrateLegacy({ retireDate: '2050-06-30' })
check('legacy manual date kept', legacyManual.profile.retireDate, '2050-06-30')
const cleaned = api.sanitize({ profile: { sex: 'x', workdays: [1, 9] }, countdowns: [{ name: 'ok', date: '2026-12-01' }, { name: 'bad', date: 'x' }] })
check('sanitize drops bad sex', cleaned.profile.sex, '')
check('sanitize filters workdays', JSON.stringify(cleaned.profile.workdays), '[1]')
check('sanitize filters countdowns', cleaned.countdowns.length, 1)
const unlocked = api.withAchievements(Object.assign(api.defaultState(), { countdowns: [{ id: '1', name: 'x', date: '2026-12-01' }] }))
check('achievement unlocks', !!unlocked.achievements.countdown, true)

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('\nall LifeOS checks passed')
