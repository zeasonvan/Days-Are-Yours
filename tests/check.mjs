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
const makeup = api.workStatus({ workStart: '09:00', workEnd: '18:00', workdays: [1, 2, 3, 4, 5] }, new Date(2026, 9, 10, 10, 0))
check('make-up Saturday is a working day', makeup.state, 'working')
check('invalid work time yields no countdown', api.workStatus({ workStart: '99:99', workEnd: '18:00', workdays: [1, 2, 3, 4, 5] }, new Date(2026, 10, 9, 10, 0)).state, 'off')
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


/* --- RC: import / export round-trip -------------------------------- */
const exported = api.buildExport(state)
check('export envelope app', exported.app, 'LifeOS')
check('export envelope schema', exported.schema, 1)
const roundTrip = api.parseImport(JSON.stringify(exported))
check('round-trip leaves', roundTrip.leaves.length, state.leaves.length)
check('round-trip quota', roundTrip.profile.leaveQuota, state.profile.leaveQuota)
check('round-trip dates', roundTrip.leaves[0].start, state.leaves[0].start)
check('round-trip is sanitized', JSON.stringify(api.sanitize(roundTrip)), JSON.stringify(roundTrip))
let rejectedApp = false
try { api.parseImport(JSON.stringify({ app: 'Other', schema: 1, data: state })) } catch (error) { rejectedApp = true }
check('import rejects foreign app', rejectedApp, true)
let rejectedVersion = false
try { api.parseImport(JSON.stringify({ app: 'LifeOS', schema: 1, data: Object.assign({}, state, { v: 99 }) })) } catch (error) { rejectedVersion = true }
check('import rejects other schema', rejectedVersion, true)
let rejectedJson = false
try { api.parseImport('{ broken') } catch (error) { rejectedJson = true }
check('import rejects malformed json', rejectedJson, true)

/* --- RC: retirement boundaries ------------------------------------- */
check('male born 1964-12-31 retires at 60', api.toISO(retire('1964-12-31', 'male').date), '2024-12-31')
check('male born 1965-04-30 retires at 60y1m', api.toISO(retire('1965-04-30', 'male').date), '2025-05-30')
check('male born 1976-08-31 → 62y11m', retire('1976-08-31', 'male').effectiveMonths, 755)
check('male born 1976-09-01 → 63y', retire('1976-09-01', 'male').effectiveMonths, 756)
check('female50 1984-10 → 54y11m', retire('1984-10-15', 'female50').effectiveMonths, 659)
check('female50 1984-11 → 55y', retire('1984-11-15', 'female50').effectiveMonths, 660)
check('leap-day birth clamps in non-leap retirement year', api.toISO(retire('2000-02-29', 'male').date), '2063-02-28')
check('leap-day birth keeps 63 years', retire('2000-02-29', 'male').effectiveMonths, 756)
check('manual mode with birth set uses manual', api.toISO(api.retirementInfo({ retireMode: 'manual', retireDate: '2049-01-01', birthDate: '1990-01-01', sex: 'male' }).date), '2049-01-01')

/* --- RC: holiday boundaries and active period ---------------------- */
check('make-up day before spring festival', api.dayInfo(new Date(2025, 0, 26)).type, 'makeup')
check('day before spring festival is work', api.dayInfo(new Date(2025, 0, 27)).type, 'work')
check('spring festival first day', api.dayInfo(new Date(2025, 0, 28)).type, 'holiday')
check('spring festival last day', api.dayInfo(new Date(2025, 1, 4)).type, 'holiday')
check('day after spring festival is work', api.dayInfo(new Date(2025, 1, 5)).type, 'work')
check('2026 national day make-up', api.dayInfo(new Date(2026, 9, 10)).type, 'makeup')
check('2026 national day +1 is weekend', api.dayInfo(new Date(2026, 9, 11)).type, 'weekend')
check('2027 spring eve is work', api.dayInfo(new Date(2027, 1, 4)).type, 'work')
const activePeriod = api.holidayPeriods(new Date(2026, 9, 3))[0]
check('active period flagged', activePeriod.active, true)
check('active period remaining days', activePeriod.remaining, 4)
check('cross-year diff 2026-12-31 → 2027-01-01', api.diffDays(new Date(2026, 11, 31), new Date(2027, 0, 1)), 1)

/* --- RC: planner independence -------------------------------------- */
const allWork = api.planLeave(api.sanitize({}), { budget: 3, from: '2026-11-09', to: '2026-11-13', sort: 'longest' })
check('planner skips pure work week', allWork.length, 0)
const allRest = api.planLeave(api.sanitize({}), { budget: 3, from: '2026-10-01', to: '2026-10-07', sort: 'longest' })
check('planner skips all-rest window', allRest.length, 0)
const wide = api.planLeave(api.sanitize({}), { budget: 5, from: '2026-09-20', to: '2026-10-15', sort: 'longest' })
check('planner respects budget', wide.every((plan) => plan.cost <= 5), true)
check('planner leave dates are workdays', wide.every((plan) => plan.leaveDates.every((date) => !api.isRestDay(date))), true)
check('planner spans are contiguous', wide.every((plan) => api.diffDays(plan.first, plan.last) + 1 === plan.continuous), true)
check('planner block = leave + rest', wide.every((plan) => {
  const leave = new Set(plan.leaveDates.map((date) => api.toISO(date)))
  let rest = 0
  for (let cursor = plan.first; api.diffDays(cursor, plan.last) >= 0; cursor = api.addDays(cursor, 1)) {
    if (!leave.has(api.toISO(cursor))) {
      if (!api.isRestDay(cursor)) return false
      rest += 1
    }
  }
  return rest + plan.cost === plan.continuous
}), true)
const invalidWindow = api.planLeave(api.sanitize({}), { budget: 3, from: '2026-10-10', to: '2026-10-01', sort: 'longest' })
check('planner rejects inverted window', invalidWindow.length, 0)
const byValue = api.planLeave(api.sanitize({}), { budget: 3, from: '2026-09-20', to: '2026-10-15', sort: 'value' })
check('value sort by ratio', byValue[0].ratio >= byValue[byValue.length - 1].ratio, true)

/* --- RC: leave consistency and payday guards ----------------------- */
const consistency = api.sanitize(api.defaultState())
consistency.profile.leaveQuota = 5
consistency.leaves = [{ id: 'l1', type: 'annual', name: '年假', start: '2026-12-28', end: '2027-01-02', countsAsLeave: true }]
check('cross-year leave counted in start year', api.leaveStats(consistency, 2026).used, 4)
check('cross-year leave not double counted', api.leaveStats(consistency, 2027).used, 0)
consistency.leaves.push({ id: 'l2', type: 'sick', name: '病假', start: '2026-06-01', end: '2026-06-01', countsAsLeave: false })
check('non-annual leave ignored', api.leaveStats(consistency, 2026).used, 4)
check('leave on weekend uses no annual leave', api.leaveWorkDays({ start: '2026-11-14', end: '2026-11-15' }), 0)
check('leave on holiday uses no annual leave', api.leaveWorkDays({ start: '2026-10-01', end: '2026-10-07' }), 0)
check('make-up workday counts as leave day', api.leaveWorkDays({ start: '2026-10-10', end: '2026-10-10' }), 1)
check('payday clamps day 99 to 28', api.toISO(api.nextPayday({ salaryDay: 99 }, today)), '2026-11-28')
check('payday empty is null', api.nextPayday({ salaryDay: '' }, today), null)

/* --- RC: custom countdowns in the past ----------------------------- */
check('past one-off countdown keeps its date', api.toISO(api.nextOccurrence('2020-01-01', false, today)), '2020-01-01')
check('past yearly countdown rolls forward', api.toISO(api.nextOccurrence('2020-03-01', true, today)), '2027-03-01')
check('yearly 29 Feb skips to leap year', api.toISO(api.nextOccurrence('2028-02-29', true, today)), '2028-02-29')

/* --- RC: sanitize is idempotent ------------------------------------ */
check('sanitize idempotent', JSON.stringify(api.sanitize(api.sanitize(roundTrip))), JSON.stringify(api.sanitize(roundTrip)))

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('\nall LifeOS checks passed')
