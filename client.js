/**
 * DAYS (Days Are Yours) client half — make every day count.
 *
 * One panel ("main" key = days) reached from the sidebar glyph, with four tabs:
 * Home, Calendar, Fun and Me. All state is local-first. The storage key keeps
 * its historical `lifeos/store` name so the 1.0 data of every user stays
 * readable after the rename; `countdown/store/v1` is migrated once and never
 * modified.
 *
 * Sections below: copy, dates, retirement policy, holiday data, store,
 * engines, views, styles, registration.
 */

window.__ModuleLoader__.load({
  id: '@local/days',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef } = React

    const PANEL_ID = 'days'
    // Deliberately unchanged across the brand rename: existing local data must survive.
    const STORE_KEY = 'lifeos/store'
    const LEGACY_KEY = 'countdown/store/v1'
    const SCHEMA = 1
    const DAY_MS = 86400000

    /* ------------------------------------------------------------------ *
     * 1. Copy — "中文|English", picked at render time
     * ------------------------------------------------------------------ */

    let LANG = 'zh'

    const COPY = {
      appName: 'DAYS|DAYS',
      slogan: '每一天，都属于你。|Make Every Day Count.',
      tabHome: '首页|Home',
      tabCalendar: '日历|Calendar',
      tabFun: '趣味|Fun',
      tabMe: '我的|Me',
      settings: '设置|Settings',
      retry: '重试|Retry',
      save: '保存|Save',
      cancel: '取消|Cancel',
      add: '添加|Add',
      edit: '编辑|Edit',
      delete: '删除|Delete',
      name: '名称|Name',
      start: '开始|Start',
      end: '结束|End',
      note: '备注|Note',
      type: '类型|Type',
      days: '天|days',
      day: '天|day',
      today: '今天|Today',
      datePlaceholder: 'YYYY-MM-DD|YYYY-MM-DD',
      none: '未设置|Not set',
      empty: '还没有内容|Nothing here yet',
      confirmDelete: '确认删除？|Delete this?',
      saved: '已保存|Saved',

      retireTitle: '退休倒计时|Retirement',
      retireUntil: '距离退休|Until retirement',
      retireRetired: '已退休|Retired',
      retireSpan: '还有 {span}|{span} to go',
      retireOn: '{date} 退休|Retires {date}',
      retireManual: '手动指定退休日期|Manually set retirement date',
      retireAuto: '按政策自动推算|Derived from policy',
      retireSetup: '填写出生信息|Set birth details',
      retireEmpty: '填写出生日期和性别后，这里会显示退休倒计时。|Enter birth date and sex to see the retirement countdown.',
      birthDate: '出生日期|Date of birth',
      sex: '性别|Sex',
      sexUnset: '请选择|Select',
      sexMale: '男|Male',
      sexFemale55: '女（管理/技术岗）|Female (management/technical)',
      sexFemale50: '女（工人岗）|Female (manual worker)',
      retireDate: '退休日期|Retirement date',
      flex: '弹性退休|Flexible retirement',
      flexNone: '按法定年龄|Statutory age',
      flexEarly: '提前 {n} 年|{n} yr earlier',
      flexLate: '延迟 {n} 年|{n} yr later',
      careerStart: '入职日期|Career start',

      nextHoliday: '下一个假期|Next holiday',
      onHoliday: '正在放假|On holiday',
      holidayLeft: '还剩 {n} 天|{n} days left',
      holidayRange: '{start} – {end}|{start} – {end}',
      holidaySpan: '{n} 天假期|{n} days off',
      makeupDays: '补班 {dates}|Make-up days {dates}',
      holidaysTitle: '法定假期|Public holidays',
      showHolidays: '显示法定假期|Show public holidays',
      allHolidays: '全年假期|This year',
      upcomingHolidays: '即将到来的假期|Upcoming holidays',
      noUpcomingHolidays: '暂时没有即将到来的假期|No upcoming holidays right now',
      yearsData: '数据覆盖 {range}|Data covers {range}',

      leaveTitle: '年假与请假|Annual leave',
      leaveQuota: '年假额度|Annual quota',
      leaveCarry: '上年结转|Carried over',
      leaveUsed: '已用|Used',
      leaveLeft: '剩余|Left',
      annualLeft: '年假剩余|Annual leave left',
      leaveUpcoming: '待休|Upcoming',
      leaveDone: '已休|Taken',
      halfDay: '时长|Duration',
      fullDay: '全天|Full day',
      morningHalf: '上午半天（0.5 天）|Morning (0.5 day)',
      afternoonHalf: '下午半天（0.5 天）|Afternoon (0.5 day)',
      selectDatesHint: '在日历上点两下选日期：第一下开始，第二下结束|Tap the calendar twice: first start, second end',
      selectedRange: '已选 {range}|Selected {range}',
      addFromDay: '为这一天请假|Add leave for this day',
      pickDates: '选择日期|Pick dates',
      paydayLabel: '发薪日|Payday',
      birthdayLabel: '生日|Birthday',
      paydayShort: '薪|P',
      birthdayShort: '生|B',
      funDesc: '下班与发薪倒计时、每日小确幸、时光团子和成就都在这里。|Off-work and payday countdowns, daily joys, the blob and achievements.',
      weatherTitle: '天气|Weather',
      weatherSetCity: '设置城市，查看天气|Set a city to see the weather',
      weatherLoading: '正在获取天气…|Fetching weather…',
      weatherError: '天气暂时不可用|Weather is unavailable right now',
      weatherUpdated: '{time} 更新|Updated {time}',
      weatherHighLow: '最高 {high}° / 最低 {low}°|H {high}° / L {low}°',
      weatherFeels: '体感 {temp}°|Feels {temp}°',
      weatherSource: '数据：Open-Meteo|Source: Open-Meteo',
      cityLabel: '城市|City',
      cityPlaceholder: '输入城市，例如 上海|Type a city, e.g. Shanghai',
      citySearch: '搜索|Search',
      citySearching: '搜索中…|Searching…',
      cityNoResult: '没有找到这个城市|No city found',
      cityError: '城市搜索失败|City search failed',
      cityClear: '清除城市|Clear city',
      slackReasonRest: '今天休息，指数自然高|A day off lifts it',
      slackReasonFriday: '周五了，心已经先下班|Friday energy',
      slackReasonWork: '还差 {n} 分钟下班|{n} min until off work',
      slackReasonHoliday: '离下个假期还有 {n} 天|{n} days to the next holiday',
      slackReasonPlain: '普通的一天，稳住了|An ordinary day, holding steady',
      coffeeReasonMorning: '上午需要一杯续命|Morning needs a cup',
      coffeeReasonAfternoon: '下午犯困，来一杯|Afternoon slump',
      coffeeReasonCold: '天冷，喝点热的|Cold outside, something warm',
      coffeeReasonHot: '天热，冰的更好|Hot outside, make it iced',
      coffeeReasonPlain: '喝不喝都行|Either way works',
      moodReasonRest: '休息日，心情不错|Off day, good mood',
      moodReasonPayday: '刚发工资，快乐加倍|Payday joy',
      moodReasonClear: '天气好，心情也亮|Nice weather, bright mood',
      moodReasonRain: '下雨天，慢一点也没关系|Rainy days can be slow',
      moodReasonPlain: '普通的一天，也挺好|An ordinary day is fine',
      petPat: '摸摸|Pat',
      petFeed: '喂食|Feed',
      petPlay: '玩耍|Play',
      petCoffee: '喝咖啡|Coffee',
      petSoothe: '安抚|Soothe',
      petPatLine: '团子眯起眼睛蹭了蹭你。|The blob leans into your hand.',
      petFeedLine: '团子小口小口地吃完了。|The blob nibbles it all up.',
      petPlayLine: '团子滚了一圈，又滚回来。|The blob rolls around and comes back.',
      petCoffeeLine: '团子捧着杯子吹了吹，慢慢喝了一口。|The blob holds the cup, blows, and takes a sip.',
      petSootheLine: '团子安静下来，往你手边靠了靠。|The blob calms down and leans closer.',
      petBonus: '今日互动加成：心情 +{mood} · 咖啡 +{coffee} · 摸鱼 +{slack}|Blob bonus today: mood +{mood} · coffee +{coffee} · slack +{slack}',
      petLevelUp: '团子升到 {n} 级了！|The blob reached level {n}!',
      addLeave: '添加请假|Add leave',
      leaveType: '假期类型|Leave type',
      leaveCustom: '自定义|Custom',
      countsAsLeave: '计入年假|Counts as annual leave',
      leaveEmpty: '还没有请假记录|No leave recorded yet',
      planner: '拼假计算器|Leave planner',
      plannerBudget: '可用年假|Leave budget',
      plannerWindow: '搜索范围|Search window',
      plannerRun: '计算方案|Plan it',
      plannerLongest: '连续休息最长|Longest break',
      plannerCheapest: '消耗最少|Cheapest',
      plannerBest: '收益最高|Best value',
      plannerResult: '连续休息 {n} 天|{n} days off in a row',
      plannerCost: '消耗 {n} 天年假|{n} leave days',
      plannerRatio: '收益率 {n}x|Efficiency {n}x',
      plannerLeaves: '请假日期|Leave dates',
      plannerEmpty: '没有找到符合条件的方案|No plan fits these limits',
      plannerHint: '按年假、法定假期与调休工作日计算|Uses leave, public holidays and make-up workdays',

      calendarTitle: '生活日历|Calendar',
      monthPrev: '上个月|Previous month',
      monthNext: '下个月|Next month',
      legendHoliday: '假期|Holiday',
      legendLeave: '请假|Leave',
      legendMakeup: '补班|Make-up',

      funTitle: '快乐研究所|Fun Lab',
      workCountdown: '下班倒计时|Off-work countdown',
      workUntil: '距离下班|Until off work',
      workStartIn: '距离上班|Until work starts',
      dayOff: '今天休息|Day off today',
      weekendIn: '距离周末|Until weekend',
      payday: '发薪日|Payday',
      paydayIn: '距离发薪|Until payday',
      slackIndex: '摸鱼指数|Slack index',
      coffeeIndex: '咖啡指数|Coffee index',
      moodIndex: '今日心情|Mood',
      forFun: '纯属娱乐|For fun only',
      quote: '今日语录|Daily quote',
      petTitle: '时光团子|Time Blob',
      petLevel: '等级 {n}|Level {n}',
      petXp: '经验 {n}|XP {n}',
      petAction: '摸摸团子|Pet the blob',
      petHint: '轻轻点一下，不会掉经验|A gentle tap, nothing is lost',
      achievements: '成就|Achievements',
      locked: '未解锁|Locked',

      profile: '个人资料|Profile',
      namePlaceholder: '怎么称呼你|What should we call you',
      workSchedule: '工作时间|Work schedule',
      workStart: '上班时间|Work starts',
      workEnd: '下班时间|Off work',
      workdays: '工作日|Workdays',
      salaryDay: '发薪日（每月）|Payday (monthly)',
      language: '语言|Language',
      goals: '愿望清单|Wishlist',
      goalTitle: '愿望|Wish',
      goalTarget: '目标日期|Target date',
      goalProgress: '进度|Progress',
      goalDone: '已完成|Done',
      goalAdd: '添加愿望|Add a wish',
      goalEmpty: '写下想做的事，给未来一个理由|Write down something worth looking forward to',
      capsules: '时间胶囊|Time capsule',
      capsuleLocked: '锁定中，{date} 后可打开|Locked until {date}',
      capsuleOpen: '可以打开了|Ready to open',
      capsuleUnlock: '打开|Open',
      capsuleAdd: '写给未来的自己|Write to future you',
      capsuleBody: '写点什么|Write something',
      capsuleEmpty: '给未来的自己留一封信|Leave a letter for future you',
      data: '数据|Data',
      exportJson: '导出 JSON|Export JSON',
      importJson: '导入 JSON|Import JSON',
      resetData: '清空本地数据|Reset local data',
      dataHint: '所有数据只保存在这台设备的浏览器里|Everything stays in this browser',
      about: '关于|About',
      version: '版本|Version',

      errName: '请填写名称|Enter a name',
      errDate: '请填写有效日期|Enter a valid date',
      errRange: '结束日期不能早于开始日期|End date cannot be before start',
      errBudget: '年假天数需要大于 0|Budget must be greater than 0',
      errImport: '文件格式不正确|Unsupported file',
      confirmReset: '将清空这台设备上的 DAYS 数据，确定吗？|This clears DAYS data on this device. Continue?',
      muted: '已过期|Past',
      passed: '已过 {n} 天|{n} days ago',
      confirmImport: '导入会替换当前全部 DAYS 数据，先导出备份了吗？继续？|Importing replaces all DAYS data on this device. Continue?',
      retireDateManual: '指定退休日期|Retirement date (manual)',
      noYearData: '这一年的放假安排还没有收录|No holiday data for this year yet',
      dataNotice: '数据来自国务院公告的放假安排；最新年份请以官方最终安排为准。|Data mirrors State Council notices; the newest year may still change.',
      weekend: '周末|Weekend',
      makeupShort: '班|W',
      makeupFor: '补班（{name}）|Make-up day for {name}',
      nothingOnDay: '这一天没有请假记录|No leave on this day',
      leaveHint: '年假余额按工作日扣减，周末与法定假期不计入。|Annual leave is deducted by working days; weekends and holidays do not count.',
      workdaysCount: '{n} 个工作日|{n} working days',
      plannerMakeup: '含补班日：{dates}|Includes make-up workdays: {dates}',
      plannerFree: '其中 {n} 天本来就是休息日|{n} of those days were already off',
      lastDay: '假期最后一天|Last day',
      retireToday: '今天退休|Retires today',
      addCountdown: '添加倒计时|Add countdown',
    }

    function t(key, params) {
      const entry = COPY[key]
      if (!entry) return key
      const parts = entry.split('|')
      let text = LANG === 'en' ? (parts[1] || parts[0]) : parts[0]
      if (params) for (const name of Object.keys(params)) text = text.split('{' + name + '}').join(String(params[name]))
      return text
    }

    function setLang(lang) { LANG = lang === 'en' ? 'en' : 'zh' }

    /* ------------------------------------------------------------------ *
     * 2. Dates
     * ------------------------------------------------------------------ */

    const pad2 = (value) => String(value).padStart(2, '0')
    const toISO = (date) => date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
    const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

    function parseISO(text) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof text === 'string' ? text : '')
      if (!match) return null
      const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
      const date = new Date(year, month - 1, day)
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
      return date
    }

    function parseAnyDate(text) {
      const raw = String(text || '').trim()
      if (!raw) return null
      let match = /^(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})$/.exec(raw)
      if (!match) match = /^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/.exec(raw)
      if (!match) match = /^(\d{4})(\d{2})(\d{2})$/.exec(raw)
      if (!match) return null
      const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
      const date = new Date(year, month - 1, day)
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
      return date
    }

    function diffDays(from, to) {
      const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
      const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
      return Math.round((b - a) / DAY_MS)
    }
    const addDays = (date, count) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + count)
    const formatInt = (value) => Math.abs(Math.round(value)).toLocaleString(LANG === 'en' ? 'en-US' : 'zh-CN')

    function formatDate(date) {
      return LANG === 'en' ? toISO(date) : date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    }
    function monthDay(date) {
      return LANG === 'en' ? (date.getMonth() + 1) + '/' + date.getDate() : (date.getMonth() + 1) + '月' + date.getDate() + '日'
    }
    function weekdayName(date) {
      const zh = ['日', '一', '二', '三', '四', '五', '六']
      const en = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return LANG === 'en' ? en[date.getDay()] : '周' + zh[date.getDay()]
    }
    function addMonths(date, months) {
      const total = date.getFullYear() * 12 + date.getMonth() + months
      const year = Math.floor(total / 12)
      const month = total - year * 12
      const lastDay = new Date(year, month + 1, 0).getDate()
      return new Date(year, month, Math.min(date.getDate(), lastDay))
    }

    function breakdown(from, to) {
      let years = to.getFullYear() - from.getFullYear()
      let months = to.getMonth() - from.getMonth()
      let days = to.getDate() - from.getDate()
      if (days < 0) { months -= 1; days += new Date(to.getFullYear(), to.getMonth(), 0).getDate() }
      if (months < 0) { years -= 1; months += 12 }
      return { years, months, days }
    }

    function breakdownText(parts) {
      const segments = []
      const zh = LANG !== 'en'
      if (parts.years > 0) segments.push(zh ? parts.years + ' 年' : parts.years + ' yr')
      if (parts.months > 0) segments.push(zh ? parts.months + ' 个月' : parts.months + ' mo')
      if (parts.days > 0 || segments.length === 0) segments.push(zh ? parts.days + ' 天' : parts.days + ' d')
      return segments.join(' ')
    }

    /* ------------------------------------------------------------------ *
     * 3. Retirement policy (China, phased reform from 2025-01-01)
     * ------------------------------------------------------------------ */

    const RETIRE_RULES = {
      male: { baseYears: 60, stepMonths: 4, capMonths: 36, startYear: 1965 },
      female55: { baseYears: 55, stepMonths: 4, capMonths: 36, startYear: 1970 },
      female50: { baseYears: 50, stepMonths: 2, capMonths: 60, startYear: 1975 },
    }

    function delayMonthsFor(rule, birth) {
      const monthsSince = (birth.getFullYear() - rule.startYear) * 12 + birth.getMonth()
      if (monthsSince < 0) return 0
      return Math.min(rule.capMonths, Math.floor(monthsSince / rule.stepMonths) + 1)
    }

    function retirementInfo(profile) {
      if (profile.retireMode === 'manual') {
        const manual = parseISO(profile.retireDate)
        if (manual) return { date: manual, manual: true }
      }
      const birth = parseISO(profile.birthDate)
      const rule = RETIRE_RULES[profile.sex]
      if (!birth || !rule) return null
      const statutory = rule.baseYears * 12 + delayMonthsFor(rule, birth)
      const flex = Number.isFinite(profile.flexMonths) ? profile.flexMonths : 0
      const effective = Math.max(rule.baseYears * 12, Math.min(statutory + flex, statutory + 36))
      return { date: addMonths(birth, effective), manual: false, statutoryMonths: statutory, effectiveMonths: effective }
    }

    /* ------------------------------------------------------------------ *
     * 4. Holiday data — State Council notices, bundled offline
     *    [name, first off day, last off day, make-up workdays]
     * ------------------------------------------------------------------ */

    const HOLIDAY_DATA = {
      2025: [
        ['元旦', '2025-01-01', '2025-01-01', []],
        ['春节', '2025-01-28', '2025-02-04', ['2025-01-26', '2025-02-08']],
        ['清明', '2025-04-04', '2025-04-06', []],
        ['劳动节', '2025-05-01', '2025-05-05', ['2025-04-27']],
        ['端午', '2025-05-31', '2025-06-02', []],
        ['国庆节、中秋', '2025-10-01', '2025-10-08', ['2025-09-28', '2025-10-11']],
      ],
      2026: [
        ['元旦', '2026-01-01', '2026-01-03', ['2026-01-04']],
        ['春节', '2026-02-15', '2026-02-23', ['2026-02-14', '2026-02-28']],
        ['清明', '2026-04-04', '2026-04-06', []],
        ['劳动节', '2026-05-01', '2026-05-05', ['2026-05-09']],
        ['端午', '2026-06-19', '2026-06-21', []],
        ['中秋', '2026-09-25', '2026-09-27', []],
        ['国庆节', '2026-10-01', '2026-10-07', ['2026-09-20', '2026-10-10']],
      ],
      2027: [
        ['元旦', '2027-01-01', '2027-01-03', []],
        ['春节', '2027-02-05', '2027-02-13', ['2027-01-31', '2027-02-14']],
        ['清明', '2027-04-03', '2027-04-05', []],
        ['劳动节', '2027-05-01', '2027-05-05', ['2027-05-08']],
        ['端午', '2027-06-09', '2027-06-09', []],
        ['中秋', '2027-09-15', '2027-09-15', []],
        ['国庆节', '2027-10-01', '2027-10-07', ['2027-09-26', '2027-10-09']],
      ],
    }

    const HOLIDAY_YEARS = Object.keys(HOLIDAY_DATA).map(Number)
    const yearMaps = new Map()

    function mapsForYear(year) {
      if (yearMaps.has(year)) return yearMaps.get(year)
      const off = new Map()
      const work = new Map()
      const rows = HOLIDAY_DATA[year] || []
      for (const row of rows) {
        let cursor = parseISO(row[1])
        const end = parseISO(row[2])
        while (cursor && end && cursor <= end) {
          off.set(toISO(cursor), row[0])
          cursor = addDays(cursor, 1)
        }
        for (const day of row[3]) work.set(day, row[0])
      }
      const maps = { off, work, hasData: rows.length > 0 }
      yearMaps.set(year, maps)
      return maps
    }

    /** 'holiday' | 'weekend' | 'makeup' | 'work' */
    function dayInfo(date) {
      const iso = toISO(date)
      const maps = mapsForYear(date.getFullYear())
      if (maps.work.has(iso)) return { type: 'makeup', name: maps.work.get(iso) }
      if (maps.off.has(iso)) return { type: 'holiday', name: maps.off.get(iso) }
      const day = date.getDay()
      return { type: day === 0 || day === 6 ? 'weekend' : 'work' }
    }

    const isRestDay = (date) => {
      const type = dayInfo(date).type
      return type === 'holiday' || type === 'weekend'
    }

    /** Upcoming statutory holiday periods, real ranges with make-up days. */
    function holidayPeriods(today) {
      const year = today.getFullYear()
      if (!HOLIDAY_DATA[year] && !HOLIDAY_DATA[year + 1]) return []
      const items = []
      for (let cursor = year; cursor <= year + 1; cursor += 1) {
        const rows = HOLIDAY_DATA[cursor]
        if (!rows) continue
        rows.forEach((row, index) => {
          const start = parseISO(row[1])
          const end = parseISO(row[2])
          const days = diffDays(today, start)
          const active = diffDays(start, today) >= 0 && diffDays(today, end) >= 0
          items.push({
            id: 'hol-' + cursor + '-' + index,
            kind: 'holiday',
            name: row[0],
            date: start,
            end,
            span: diffDays(start, end) + 1,
            days,
            active,
            remaining: active ? diffDays(today, end) : 0,
            work: row[3].map(parseISO).filter((date) => diffDays(today, date) >= 0),
          })
        })
      }
      items.sort((a, b) => (a.active ? -1 : a.days) - (b.active ? -1 : b.days))
      return items.filter((item) => item.days >= 0 || item.active)
    }

    /* ------------------------------------------------------------------ *
     * 5. Storage — local-first, versioned, legacy-safe
     * ------------------------------------------------------------------ */

    const uid = (prefix) => prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

    function defaultState() {
      return {
        v: SCHEMA,
        profile: {
          name: '', birthDate: '', sex: '', retireMode: 'auto', retireDate: '', flexMonths: 0,
          careerStart: '', workStart: '09:00', workEnd: '18:00', workdays: [1, 2, 3, 4, 5],
          salaryDay: '', leaveQuota: 5, leaveCarry: 0,
          location: null,
        },
        countdowns: [], leaves: [], goals: [], capsules: [],
        pet: { xp: 0, lastPet: '', actions: { date: '', pat: 0, feed: 0, play: 0, coffee: 0, soothe: 0 } },
        achievements: {}, stats: { plannerRuns: 0, exports: 0, visits: 0 },
        settings: { lang: 'zh', showHolidays: true, tab: 'home' },
      }
    }

    function sanitize(raw) {
      const base = defaultState()
      const source = raw && typeof raw === 'object' ? raw : {}
      const profile = source.profile && typeof source.profile === 'object' ? source.profile : {}
      base.profile.name = typeof profile.name === 'string' ? profile.name : ''
      base.profile.birthDate = parseISO(profile.birthDate) ? profile.birthDate : ''
      base.profile.sex = ['male', 'female55', 'female50'].includes(profile.sex) ? profile.sex : ''
      base.profile.retireMode = profile.retireMode === 'manual' ? 'manual' : 'auto'
      base.profile.retireDate = parseISO(profile.retireDate) ? profile.retireDate : ''
      if (base.profile.retireMode === 'manual' && !base.profile.retireDate) base.profile.retireMode = 'auto'
      base.profile.flexMonths = [-36, -24, -12, 0, 12, 24, 36].includes(profile.flexMonths) ? profile.flexMonths : 0
      base.profile.careerStart = parseISO(profile.careerStart) ? profile.careerStart : ''
      base.profile.workStart = /^\d{2}:\d{2}$/.test(profile.workStart) ? profile.workStart : '09:00'
      base.profile.workEnd = /^\d{2}:\d{2}$/.test(profile.workEnd) ? profile.workEnd : '18:00'
      base.profile.workdays = Array.isArray(profile.workdays)
        ? profile.workdays.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
        : [1, 2, 3, 4, 5]
      base.profile.salaryDay = Number.isInteger(profile.salaryDay) && profile.salaryDay >= 1 && profile.salaryDay <= 28 ? profile.salaryDay : ''
      base.profile.leaveQuota = Number.isFinite(profile.leaveQuota) && profile.leaveQuota >= 0 ? profile.leaveQuota : 5
      base.profile.leaveCarry = Number.isFinite(profile.leaveCarry) && profile.leaveCarry >= 0 ? profile.leaveCarry : 0
      const location = profile.location
      base.profile.location = location && typeof location === 'object'
        && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
        ? {
          name: typeof location.name === 'string' ? location.name : '',
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        }
        : null

      base.countdowns = Array.isArray(source.countdowns) ? source.countdowns
        .filter((item) => item && typeof item.name === 'string' && parseISO(item.date))
        .map((item) => ({ id: item.id || uid('cd'), name: item.name, date: item.date, yearly: !!item.yearly })) : []

      base.leaves = Array.isArray(source.leaves) ? source.leaves
        .filter((item) => item && typeof item.name === 'string' && parseISO(item.start))
        .map((item) => ({
          id: item.id || uid('lv'),
          type: typeof item.type === 'string' ? item.type : 'custom',
          name: item.name,
          start: item.start,
          end: parseISO(item.end) ? item.end : item.start,
          countsAsLeave: !!item.countsAsLeave,
          half: ['am', 'pm'].includes(item.half) ? item.half : 'none',
          note: typeof item.note === 'string' ? item.note : '',
        })) : []

      base.goals = Array.isArray(source.goals) ? source.goals
        .filter((item) => item && typeof item.title === 'string')
        .map((item) => ({
          id: item.id || uid('goal'),
          title: item.title,
          category: typeof item.category === 'string' ? item.category : 'life',
          target: parseISO(item.target) ? item.target : '',
          progress: Math.max(0, Math.min(100, Number.isFinite(item.progress) ? item.progress : 0)),
          done: !!item.done,
          note: typeof item.note === 'string' ? item.note : '',
        })) : []

      base.capsules = Array.isArray(source.capsules) ? source.capsules
        .filter((item) => item && typeof item.title === 'string' && typeof item.body === 'string' && parseISO(item.unlockDate))
        .map((item) => ({
          id: item.id || uid('cap'),
          title: item.title,
          body: item.body,
          unlockDate: item.unlockDate,
          createdAt: item.createdAt || toISO(new Date()),
        })) : []

      const pet = source.pet && typeof source.pet === 'object' ? source.pet : {}
      base.pet.xp = Number.isFinite(pet.xp) && pet.xp >= 0 ? pet.xp : 0
      base.pet.lastPet = typeof pet.lastPet === 'string' ? pet.lastPet : ''
      const actions = pet.actions && typeof pet.actions === 'object' ? pet.actions : {}
      base.pet.actions = {
        date: typeof actions.date === 'string' ? actions.date : '',
        pat: Math.max(0, Math.floor(Number(actions.pat) || 0)),
        feed: Math.max(0, Math.floor(Number(actions.feed) || 0)),
        play: Math.max(0, Math.floor(Number(actions.play) || 0)),
        coffee: Math.max(0, Math.floor(Number(actions.coffee) || 0)),
        soothe: Math.max(0, Math.floor(Number(actions.soothe) || 0)),
      }

      const stats = source.stats && typeof source.stats === 'object' ? source.stats : {}
      base.stats.plannerRuns = Number.isFinite(stats.plannerRuns) ? stats.plannerRuns : 0
      base.stats.exports = Number.isFinite(stats.exports) ? stats.exports : 0
      base.stats.visits = Number.isFinite(stats.visits) ? stats.visits : 0

      const settings = source.settings && typeof source.settings === 'object' ? source.settings : {}
      base.settings.lang = settings.lang === 'en' ? 'en' : 'zh'
      base.settings.showHolidays = settings.showHolidays !== false
      base.settings.tab = ['home', 'calendar', 'fun', 'me'].includes(settings.tab) ? settings.tab : 'home'

      if (source.achievements && typeof source.achievements === 'object') {
        for (const key of Object.keys(source.achievements)) {
          if (typeof source.achievements[key] === 'string') base.achievements[key] = source.achievements[key]
        }
      }
      return base
    }

    /** Map the legacy countdown plugin payload without touching its key. */
    function migrateLegacy(legacy) {
      const next = defaultState()
      if (!legacy || typeof legacy !== 'object') return next
      next.profile.birthDate = parseISO(legacy.birthDate) ? legacy.birthDate : ''
      next.profile.sex = ['male', 'female55', 'female50'].includes(legacy.sex) ? legacy.sex : ''
      next.profile.flexMonths = [-36, -24, -12, 0, 12, 24, 36].includes(legacy.flexMonths) ? legacy.flexMonths : 0
      next.profile.careerStart = parseISO(legacy.careerStart) ? legacy.careerStart : ''
      if (parseISO(legacy.retireDate)) {
        next.profile.retireMode = 'manual'
        next.profile.retireDate = legacy.retireDate
      }
      next.settings.lang = legacy.lang === 'en' ? 'en' : 'zh'
      next.settings.showHolidays = legacy.showBuiltin !== false
      next.leaves = (Array.isArray(legacy.customs) ? legacy.customs : [])
        .filter((item) => item && typeof item.name === 'string' && parseISO(item.start))
        .map((item) => ({
          id: item.id || uid('lv'), type: 'custom', name: item.name,
          start: item.start, end: parseISO(item.end) ? item.end : item.start,
          countsAsLeave: false, half: 'none', note: '',
        }))
      return next
    }

    function loadState() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY)
        if (raw) return sanitize(JSON.parse(raw))
        const legacy = window.localStorage.getItem(LEGACY_KEY)
        if (legacy) return sanitize(migrateLegacy(JSON.parse(legacy)))
      } catch (error) { /* corrupted payload falls back to defaults */ }
      return defaultState()
    }

    const ACHIEVEMENTS = [
      { id: 'retire', title: '退休梦想家|Retirement Dreamer', desc: '填写出生日期与性别，或手动指定退休日期|Add birth date and sex, or set a manual retirement date', test: (s) => !!retirementInfo(s.profile) },
      { id: 'countdown', title: '时间收藏家|Countdown Collector', desc: '添加至少一个自定义倒计时|Add at least one custom countdown', test: (s) => s.countdowns.length > 0 },
      { id: 'planner', title: '拼假大师|Leave Alchemist', desc: '运行一次拼假计算器|Run the leave planner once', test: (s) => s.stats.plannerRuns > 0 },
      { id: 'goal', title: '愿望清单|Wishlist', desc: '添加一个愿望|Add one wish', test: (s) => s.goals.length > 0 },
      { id: 'capsule', title: '写给未来|Letter to Future', desc: '写一封时间胶囊|Write one time capsule', test: (s) => s.capsules.length > 0 },
      { id: 'pet3', title: '团子好友|Blob Friend', desc: '把时光团子养到 3 级（100 经验）|Raise the blob to level 3 (100 XP)', test: (s) => petLevel(s.pet.xp) >= 3 },
      { id: 'leave5', title: '休假达人|Leave Master', desc: '记录 5 次请假|Record 5 leaves', test: (s) => s.leaves.length >= 5 },
      { id: 'export', title: '数据管家|Data Keeper', desc: '导出一次 JSON 备份|Export a JSON backup once', test: (s) => s.stats.exports > 0 },
    ]

    function withAchievements(state) {
      const unlocked = Object.assign({}, state.achievements)
      let changed = false
      const stamp = toISO(new Date())
      for (const item of ACHIEVEMENTS) {
        if (!unlocked[item.id] && item.test(state)) { unlocked[item.id] = stamp; changed = true }
      }
      return changed ? Object.assign({}, state, { achievements: unlocked }) : state
    }

    let currentState = loadState()
    const listeners = new Set()

    function commit(next) {
      currentState = withAchievements(next)
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(currentState)) } catch (error) { /* quota */ }
      for (const listener of Array.from(listeners)) listener()
    }

    function subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    }

    // Keep tabs in sync instead of silently overwriting each other.
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (event) => {
        if (event.key !== STORE_KEY || !event.newValue) return
        try {
          currentState = sanitize(JSON.parse(event.newValue))
          for (const listener of Array.from(listeners)) listener()
        } catch (error) { /* ignore a payload written by another version */ }
      })
    }

    function useDaysState() {
      const [, bump] = useState(0)
      useEffect(() => subscribe(() => bump((value) => value + 1)), [])
      setLang(currentState.settings.lang)
      return currentState
    }

    const patch = (partial) => commit(Object.assign({}, currentState, partial))
    const patchProfile = (partial) => patch({ profile: Object.assign({}, currentState.profile, partial) })
    const patchSettings = (partial) => patch({ settings: Object.assign({}, currentState.settings, partial) })
    const bumpStat = (key) => patch({ stats: Object.assign({}, currentState.stats, { [key]: currentState.stats[key] + 1 }) })

    const IMPORT_APPS = ['DAYS', 'LifeOS']

    function buildExport(state) {
      return { app: 'DAYS', schema: SCHEMA, exportedAt: new Date().toISOString(), data: state }
    }

    function parseImport(text) {
      const parsed = JSON.parse(text)
      // 'LifeOS' is the 1.0 export envelope; keep accepting those files.
      if (!parsed || !IMPORT_APPS.includes(parsed.app) || !parsed.data || parsed.data.v !== SCHEMA) throw new Error('bad-file')
      return sanitize(parsed.data)
    }

    function exportData() {
      const payload = buildExport(currentState)
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'days-' + toISO(new Date()) + '.json'
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      bumpStat('exports')
    }

    function importData(text) {
      commit(parseImport(text))
    }

    function resetData() {
      commit(defaultState())
    }

    /* ------------------------------------------------------------------ *
     * 6. Engines — countdowns, leave, planner, work status, fun
     * ------------------------------------------------------------------ */

    function nextOccurrence(startText, yearly, today) {
      const base = parseISO(startText)
      if (!base) return null
      if (!yearly) return base
      const month = base.getMonth()
      const day = base.getDate()
      for (let cursor = today.getFullYear(); cursor <= today.getFullYear() + 2; cursor += 1) {
        const candidate = new Date(cursor, month, day)
        if (candidate.getMonth() !== month) continue
        if (diffDays(today, candidate) >= 0) return candidate
      }
      return null
    }

    function customCountdowns(state, today) {
      return state.countdowns
        .map((item) => {
          const date = nextOccurrence(item.date, item.yearly, today)
          if (!date) return null
          return { id: item.id, kind: 'custom', name: item.name, date, days: diffDays(today, date), yearly: item.yearly }
        })
        .filter(Boolean)
        .sort((a, b) => a.days - b.days)
    }

    /** Nearest countdowns across retirement, holidays, leaves and custom items. */
    function lifeEntries(state, now) {
      const today = startOfDay(now)
      const items = []
      const retire = retirementInfo(state.profile)
      if (retire) items.push({ id: 'retire', kind: 'retire', name: t('retireTitle'), date: retire.date, days: diffDays(today, retire.date) })
      if (state.settings.showHolidays) items.push.apply(items, holidayPeriods(today))
      for (const item of state.countdowns) {
        const date = nextOccurrence(item.date, item.yearly, today)
        if (date) items.push({ id: item.id, kind: 'custom', name: item.name, date, days: diffDays(today, date) })
      }
      for (const leave of state.leaves) {
        const date = parseISO(leave.start)
        if (date && diffDays(today, date) >= 0) items.push({ id: leave.id, kind: 'leave', name: leave.name, date, days: diffDays(today, date) })
      }
      return items.sort((a, b) => (a.days < 0 ? 1 : 0) - (b.days < 0 ? 1 : 0) || a.days - b.days)
    }

    function leaveDays(leave) {
      const start = parseISO(leave.start)
      const end = parseISO(leave.end) || start
      if (!start) return 0
      return diffDays(start, end) + 1
    }

    /** Working days only — weekends and statutory holidays are not deducted. */
    function leaveWorkDays(leave) {
      const start = parseISO(leave.start)
      const end = parseISO(leave.end) || start
      if (!start) return 0
      if (leave.half && leave.half !== 'none' && diffDays(start, end) === 0) {
        return isRestDay(start) ? 0 : 0.5
      }
      let count = 0
      for (let cursor = start; diffDays(cursor, end) >= 0; cursor = addDays(cursor, 1)) {
        if (!isRestDay(cursor)) count += 1
      }
      return count
    }

    /**
     * Annual leave is deducted only after the leave has ended. Future leave is
     * reported as `upcoming`, so planning a holiday in advance does not make the
     * balance look empty.
     */
    function leaveStats(state, year, reference) {
      const target = year || new Date().getFullYear()
      const today = startOfDay(reference || new Date())
      const rows = state.leaves.filter((leave) => leave.countsAsLeave && parseISO(leave.start) && parseISO(leave.start).getFullYear() === target)
      let used = 0
      let upcoming = 0
      for (const leave of rows) {
        const end = parseISO(leave.end) || parseISO(leave.start)
        const days = leaveWorkDays(leave)
        if (diffDays(today, end) < 0) used += days
        else upcoming += days
      }
      const quota = state.profile.leaveQuota + state.profile.leaveCarry
      const left = quota - used
      return { quota, used, upcoming, left, available: left - upcoming }
    }

    /**
     * Deterministic leave planner: for every working day in the window, take
     * the longest run of working days that fits the budget and keep the rest
     * days it joins into one continuous break.
     */
    function planLeave(state, options) {
      const budget = Math.max(1, Math.min(15, options.budget | 0))
      const from = parseISO(options.from)
      const to = parseISO(options.to)
      if (!from || !to || diffDays(from, to) < 0) return []
      const days = []
      for (let cursor = from; diffDays(cursor, to) >= 0; cursor = addDays(cursor, 1)) days.push(startOfDay(cursor))

      const plans = []
      for (let index = 0; index < days.length; index += 1) {
        if (isRestDay(days[index])) continue
        let cursor = index
        while (cursor < days.length && cursor - index < budget && !isRestDay(days[cursor])) cursor += 1
        const cost = cursor - index
        if (cost <= 0) continue
        let left = index - 1
        while (left >= 0 && isRestDay(days[left])) left -= 1
        let right = cursor
        while (right < days.length && isRestDay(days[right])) right += 1
        const continuous = (cursor - index) + (index - 1 - left) + (right - cursor)
        if (continuous <= cost) continue
        const leaveDates = days.slice(index, cursor)
        plans.push({
          id: toISO(days[index]) + '-' + cost,
          leaveDates,
          first: days[left + 1],
          last: days[right - 1],
          continuous,
          cost,
          ratio: continuous / cost,
          makeup: leaveDates.filter((date) => dayInfo(date).type === 'makeup'),
        })
      }

      const seen = new Set()
      const unique = []
      for (const plan of plans) {
        const key = toISO(plan.first) + '|' + toISO(plan.last) + '|' + plan.cost
        if (seen.has(key)) continue
        seen.add(key)
        unique.push(plan)
      }
      const sorters = {
        longest: (a, b) => b.continuous - a.continuous || a.cost - b.cost,
        cheapest: (a, b) => a.cost - b.cost || b.continuous - a.continuous,
        value: (a, b) => b.ratio - a.ratio || b.continuous - a.continuous,
      }
      return unique.sort(sorters[options.sort] || sorters.longest).slice(0, 5)
    }

    function minutesFromTime(text) {
      const match = /^(\d{1,2}):(\d{2})$/.exec(text || '')
      if (!match) return null
      const hours = Number(match[1])
      const minutes = Number(match[2])
      if (hours > 23 || minutes > 59) return null
      return hours * 60 + minutes
    }

    function workStatus(profile, now) {
      const workdays = profile.workdays.length ? profile.workdays : [1, 2, 3, 4, 5]
      const dayNumber = now.getDay() === 0 ? 7 : now.getDay()
      const todayInfo = dayInfo(now)
      const scheduled = (todayInfo.type === 'makeup' || workdays.includes(dayNumber)) && !isRestDay(now)
      const start = minutesFromTime(profile.workStart)
      const end = minutesFromTime(profile.workEnd)
      const minutes = now.getHours() * 60 + now.getMinutes()
      const today = startOfDay(now)

      if (scheduled && start != null && end != null && minutes < start) {
        return { state: 'before', minutes: start - minutes }
      }
      if (scheduled && start != null && end != null && minutes >= start && minutes < end) {
        return { state: 'working', minutes: end - minutes }
      }
      let next = null
      for (let offset = 0; offset <= 10 && !next; offset += 1) {
        const day = addDays(today, offset)
        const number = day.getDay() === 0 ? 7 : day.getDay()
        const dayIsMakeup = dayInfo(day).type === 'makeup'
        if (isRestDay(day)) continue
        if (!dayIsMakeup && !workdays.includes(number)) continue
        if (offset === 0 && end != null && minutes >= end) continue
        next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, start || 0)
      }
      return { state: 'off', next }
    }

    function nextPayday(profile, now) {
      if (profile.salaryDay === '' || profile.salaryDay == null) return null
      const parsed = Number(profile.salaryDay)
      if (!Number.isFinite(parsed) || parsed < 1) return null
      const day = Math.min(28, Math.floor(parsed))
      const today = startOfDay(now)
      let candidate = new Date(today.getFullYear(), today.getMonth(), day)
      if (diffDays(today, candidate) < 0) candidate = new Date(today.getFullYear(), today.getMonth() + 1, day)
      return candidate
    }

    function hashString(text) {
      let hash = 2166136261
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
      }
      return hash >>> 0
    }

    const WEATHER_CACHE_KEY = 'days/weather-cache:v1'
    const WEATHER_TTL = 30 * 60 * 1000

    const WEATHER_CODES = {
      clear: '晴|Clear',
      partly: '多云|Partly cloudy',
      overcast: '阴|Overcast',
      fog: '雾|Fog',
      drizzle: '小雨|Drizzle',
      rain: '雨|Rain',
      snow: '雪|Snow',
      storm: '雷雨|Thunderstorm',
    }

    function weatherKind(code) {
      if (code === 0) return 'clear'
      if (code === 1 || code === 2) return 'partly'
      if (code === 3) return 'overcast'
      if (code === 45 || code === 48) return 'fog'
      if (code >= 51 && code <= 57) return 'drizzle'
      if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
      if (code >= 95) return 'storm'
      return 'partly'
    }

    function weatherLabel(code) {
      const entry = WEATHER_CODES[weatherKind(code)] || WEATHER_CODES.partly
      const parts = entry.split('|')
      return LANG === 'en' ? parts[1] || parts[0] : parts[0]
    }

    function readWeatherCache() {
      try {
        const raw = window.localStorage.getItem(WEATHER_CACHE_KEY)
        if (!raw) return null
        const cache = JSON.parse(raw)
        if (!cache || !cache.location || !cache.data || !Number.isFinite(cache.fetchedAt)) return null
        return cache
      } catch (error) {
        return null
      }
    }

    function isWeatherFresh(cache, now) {
      return !!cache && Number.isFinite(cache.fetchedAt) && now - cache.fetchedAt < WEATHER_TTL
    }

    function sameLocation(left, right) {
      return !!left && !!right && Number(left.latitude) === Number(right.latitude) && Number(left.longitude) === Number(right.longitude)
    }

    async function fetchWeather(location, signal) {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(location.latitude)
        + '&longitude=' + encodeURIComponent(location.longitude)
        + '&current=temperature_2m,apparent_temperature,weather_code,is_day'
        + '&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1'
      const response = await window.fetch(url, { signal })
      if (!response.ok) throw new Error('weather-http')
      const data = await response.json()
      if (!data || !data.current || !data.daily) throw new Error('weather-shape')
      return {
        temperature: data.current.temperature_2m,
        apparent: data.current.apparent_temperature,
        code: data.current.weather_code,
        isDay: data.current.is_day === 1,
        high: data.daily.temperature_2m_max && data.daily.temperature_2m_max[0],
        low: data.daily.temperature_2m_min && data.daily.temperature_2m_min[0],
        updatedAt: Date.now(),
      }
    }

    function cacheWeather(location, data) {
      try {
        window.localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ location, fetchedAt: Date.now(), data }))
      } catch (error) { /* quota */ }
    }

    async function searchCity(name, signal) {
      const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name)
        + '&count=5&language=' + (LANG === 'en' ? 'en' : 'zh') + '&format=json'
      const response = await window.fetch(url, { signal })
      if (!response.ok) throw new Error('city-http')
      const data = await response.json()
      return (data.results || []).map((row) => ({
        name: [row.name, row.admin1, row.country].filter(Boolean).join(' · '),
        latitude: row.latitude,
        longitude: row.longitude,
      }))
    }

    const QUOTES = [
      '把今天过好，就已经赢了一半。',
      '假期不是奖励，是生活本来的样子。',
      '摸鱼的时候，时间也会温柔一点。',
      '你不需要每一天都闪闪发光，偶尔发呆也算数。',
      '距离下班越近，咖啡越香。',
      '计划赶不上变化，但计划本身让人安心。',
      '认真休息，是认真工作的一部分。',
      '今天的你，已经比昨天多活了一天。',
      '别忘了抬头看看窗外，云也在上班。',
      '攒下的不是年假，是值得期待的日子。',
      '人生是长跑，但可以先想想晚饭吃什么。',
      '把想做的事写下来，未来就有了形状。',
      '今天也辛苦了，记得喝口水。',
      '慢一点没关系，方向对就好。',
      '周一的早上，先允许自己发五分钟呆。',
      '假期的意义，是让平常的日子有盼头。',
      '不必追赶别人，你有自己的时区。',
      '把窗户打开一点，风会带来新的消息。',
      '今天的太阳，也在按时上班。',
      '发呆不是浪费时间，是给大脑留白。',
      '如果今天很难，那就先过完今天。',
      '年假不是偷懒，是提前预约的快乐。',
      '下班路上的晚霞，是免费的奖励。',
      '买一杯喜欢的饮料，理由可以很简单。',
      '把待办清单划掉一项，就值得高兴一下。',
      '你不需要向任何人证明今天过得很好。',
      '周末的计划可以只是躺着。',
      '想念一个人的时候，就给他发条消息。',
      '生活不是项目管理，允许临时改动。',
      '今天适合做一件小事，然后夸夸自己。',
      '把手机放下十分钟，世界不会塌。',
      '所有的假期，都是从上班第一天开始攒的。',
      '愿你的加班都有意义，愿你的下班都很准时。',
      '记得给自己留一点没有名字的时间。',
      '日历翻过去的那一页，也曾经是未来。',
      '如果可以，今天早点睡。',
      '平凡的一天，也值得被认真记录。',
      '你已经做得很好了，真的。',
    ]

    function dailyQuote(date) {
      return QUOTES[hashString(toISO(date)) % QUOTES.length]
    }

    const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)))

    /** Scores follow today's actual schedule, payday and weather instead of a hash. */
    function funScores(state, now, weather) {
      const rest = isRestDay(now)
      const weekday = now.getDay()
      const work = workStatus(state.profile, now)
      const start = minutesFromTime(state.profile.workStart)
      const end = minutesFromTime(state.profile.workEnd)
      const hour = now.getHours()
      const nextHoliday = holidayPeriods(startOfDay(now))[0]
      const payday = nextPayday(state.profile, now)
      const paydaySoon = payday && Math.abs(diffDays(startOfDay(now), payday)) <= 2
      const kind = weather ? weatherKind(weather.code) : null
      const temp = weather && Number.isFinite(weather.temperature) ? weather.temperature : null

      let slack = 45
      let slackReason = 'slackReasonPlain'
      if (rest) { slack += 35; slackReason = 'slackReasonRest' }
      else if (weekday === 5) { slack += 15; slackReason = 'slackReasonFriday' }
      else if (work.state === 'working' && start != null && end != null && end > start) {
        slack += Math.round(15 * (1 - work.minutes / (end - start)))
        slackReason = 'slackReasonWork'
      } else if (nextHoliday && nextHoliday.days <= 7) {
        slack += 10
        slackReason = 'slackReasonHoliday'
      }

      let coffee = 42
      let coffeeReason = 'coffeeReasonPlain'
      if (hour >= 8 && hour < 11) { coffee += 28; coffeeReason = 'coffeeReasonMorning' }
      else if (hour >= 13 && hour < 16) { coffee += 18; coffeeReason = 'coffeeReasonAfternoon' }
      if (temp != null && temp <= 12) { coffee += 12; coffeeReason = 'coffeeReasonCold' }
      else if (temp != null && temp >= 29) { coffee -= 10; coffeeReason = 'coffeeReasonHot' }
      if (!rest) coffee += 8

      let mood = 58
      let moodReason = 'moodReasonPlain'
      if (rest) { mood += 22; moodReason = 'moodReasonRest' }
      if (paydaySoon) { mood += 12; moodReason = 'moodReasonPayday' }
      if (kind === 'clear') { mood += 10; moodReason = 'moodReasonClear' }
      else if (kind === 'rain' || kind === 'drizzle' || kind === 'storm' || kind === 'snow') { mood -= 12; moodReason = 'moodReasonRain' }

      const bonus = interactionBonus(state, now)
      const slackValue = clampScore(slack + bonus.slack)
      const coffeeValue = clampScore(coffee + bonus.coffee)
      const moodValue = clampScore(mood + bonus.mood)
      const reason = (key, params) => {
        const raw = t(key)
        if (!params) return raw
        let text = raw
        for (const name of Object.keys(params)) text = text.split('{' + name + '}').join(String(params[name]))
        return text
      }

      return {
        slack: slackValue,
        coffee: coffeeValue,
        mood: moodValue,
        bonus,
        reasons: {
          slack: reason(slackReason, { n: work.state === 'working' ? work.minutes : nextHoliday ? nextHoliday.days : 0 }),
          coffee: reason(coffeeReason),
          mood: reason(moodReason),
        },
      }
    }

    function petLevel(xp) { return 1 + Math.floor(Math.max(0, xp) / 50) }

    const PET_ACTION_IDS = ['pat', 'feed', 'play', 'coffee', 'soothe']

    function petActionsFor(state, now) {
      const today = toISO(startOfDay(now))
      const actions = state.pet && state.pet.actions
      if (!actions || actions.date !== today) {
        return { date: today, pat: 0, feed: 0, play: 0, coffee: 0, soothe: 0 }
      }
      return actions
    }

    /**
     * Interaction nudges the daily indices, but only a little: mood +4, coffee
     * +2, slack +2 at most per day, however often the blob is petted.
     */
    function interactionBonus(state, now) {
      const actions = petActionsFor(state, now)
      const total = PET_ACTION_IDS.reduce((sum, id) => sum + (actions[id] || 0), 0)
      return {
        mood: Math.min(4, total),
        coffee: Math.min(2, actions.coffee || 0),
        slack: Math.min(2, actions.play || 0),
      }
    }

    function petMood(now) {
      const hour = now.getHours()
      if (hour < 7) return 'sleepy'
      if (hour < 12) return 'happy'
      if (hour < 18) return 'focused'
      return 'cozy'
    }

    /** Birthday and payday are yearly/monthly marks, not stored events. */
    function dayMarks(date, profile) {
      const birth = parseISO(profile.birthDate)
      const birthday = !!birth && birth.getMonth() === date.getMonth() && birth.getDate() === date.getDate()
      const payday = !!profile.salaryDay && Number(profile.salaryDay) === date.getDate()
      return { birthday, payday }
    }

    function monthGrid(year, month, state) {
      const first = new Date(year, month, 1)
      const offset = (first.getDay() + 6) % 7
      const cells = []
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(year, month, 1 - offset + index)
        const info = dayInfo(date)
        const leaves = state.leaves.filter((leave) => {
          const start = parseISO(leave.start)
          const end = parseISO(leave.end) || start
          return start && diffDays(start, date) >= 0 && diffDays(date, end) >= 0
        })
        cells.push({ date, info, leaves, outside: date.getMonth() !== month })
      }
      return cells
    }

    /* ------------------------------------------------------------------ *
     * 7. UI primitives
     * ------------------------------------------------------------------ */

    const cx = (...names) => names.filter(Boolean).join(' ')

    function useNow(intervalMs) {
      const [now, setNow] = useState(() => new Date())
      useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), intervalMs || 30000)
        return () => window.clearInterval(timer)
      }, [intervalMs])
      return now
    }

    function Card({ title, action, children, className }) {
      return h('section', { className: cx('lo-card', className) },
        (title || action)
          ? h('div', { className: 'lo-card-head' },
            h('h2', { className: 'lo-card-title' }, title),
            action || null)
          : null,
        children)
    }

    function Field({ label, children }) {
      return h('label', { className: 'lo-field' },
        h('span', { className: 'lo-field-label' }, label),
        children)
    }

    function TextInput({ value, onChange, placeholder, maxLength }) {
      return h('input', {
        className: 'lo-input',
        value: value == null ? '' : value,
        placeholder: placeholder || '',
        maxLength: maxLength || 64,
        onChange: (event) => onChange(event.target.value),
      })
    }

    function Select({ value, onChange, options, disabled }) {
      return h('select', {
        className: 'lo-input',
        value: value,
        disabled: !!disabled,
        onChange: (event) => onChange(event.target.value),
      },
      options.map((option) => h('option', { key: option.value, value: option.value }, option.label)))
    }

    function Button({ children, onClick, variant, type }) {
      return h('button', {
        type: type || 'button',
        className: cx('lo-btn', variant === 'primary' && 'lo-btn-primary', variant === 'ghost' && 'lo-btn-ghost'),
        onClick,
      }, children)
    }

    function DateField({ value, onChange, max }) {
      const [draft, setDraft] = useState(null)
      const committed = value ? parseISO(value) : null
      const text = draft == null ? (committed ? formatDate(committed) : '') : draft
      const invalid = draft != null && draft.trim() !== '' && !parseAnyDate(draft)

      const commitValue = (raw) => {
        const parsed = parseAnyDate(raw)
        if (!parsed) return false
        if (max && diffDays(max, parsed) > 0) return false
        onChange(toISO(parsed))
        return true
      }

      return h('input', {
        className: cx('lo-input', invalid && 'lo-input-invalid'),
        type: 'text',
        inputMode: 'numeric',
        autoComplete: 'off',
        spellCheck: false,
        value: text,
        placeholder: t('datePlaceholder'),
        onFocus: (event) => {
          setDraft(committed ? toISO(committed) : '')
          const target = event.target
          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(() => { try { target.select() } catch (error) { /* ignore */ } })
          }
        },
        onChange: (event) => {
          setDraft(event.target.value)
          commitValue(event.target.value)
        },
        onBlur: () => {
          if (draft != null && draft.trim() === '') onChange('')
          setDraft(null)
        },
        onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur() },
      })
    }

    /** Original mascot: a round "time blob" drawn with simple geometry. */
    function Mascot({ size, mood, action }) {
      const s = size || 64
      const closedEyes = mood === 'sleepy' || mood === 'cozy'
      const eyeRadius = mood === 'focused' ? 2.0 : 2.6
      const mouth = mood === 'celebrate'
        ? 'M25 40c2.6 3.4 4.8 4.8 7 4.8s4.4-1.4 7-4.8'
        : mood === 'focused'
          ? 'M28 42h8'
          : 'M27 41c1.8 1.8 3.4 2.6 5 2.6s3.2-.8 5-2.6'

      return h('svg', {
        width: s, height: s, viewBox: '0 0 64 64', 'aria-hidden': true,
        className: 'lo-mascot',
        'data-action': action || '',
        style: { display: 'block', flex: 'none' },
      },
      h('ellipse', { cx: 32, cy: 58, rx: 18, ry: 4, fill: '#354B43', opacity: 0.1 }),
      h('g', { className: 'lo-arm lo-arm-left' },
        h('rect', { x: 9, y: 34, width: 7.5, height: 15, rx: 3.75, fill: '#F5F0E6', stroke: '#E8B88F', strokeWidth: 1.5 })),
      h('g', { className: 'lo-arm lo-arm-right' },
        h('rect', { x: 47.5, y: 34, width: 7.5, height: 15, rx: 3.75, fill: '#F5F0E6', stroke: '#E8B88F', strokeWidth: 1.5 })),
      h('circle', { cx: 32, cy: 33, r: 21.5, fill: '#F5F0E6', stroke: '#E8B88F', strokeWidth: 2 }),
      h('ellipse', { cx: 25.5, cy: 23, rx: 9, ry: 5.5, fill: '#FFFFFF', opacity: 0.6, transform: 'rotate(-18 25.5 23)' }),
      h('ellipse', { cx: 32, cy: 47, rx: 12, ry: 5, fill: '#E9D9CE', opacity: 0.32 }),
      closedEyes
        ? h('path', { d: 'M24 33c1.4-1.2 3.6-1.2 5 0M35 33c1.4-1.2 3.6-1.2 5 0', stroke: '#354B43', strokeWidth: 2, strokeLinecap: 'round', fill: 'none' })
        : h('g', null,
          h('circle', { cx: 26, cy: 32, r: eyeRadius, fill: '#354B43' }),
          h('circle', { cx: 38, cy: 32, r: eyeRadius, fill: '#354B43' })),
      h('path', { d: mouth, stroke: '#354B43', strokeWidth: mood === 'celebrate' ? 2.4 : 2.2, strokeLinecap: 'round', fill: 'none' }),
      h('circle', { cx: 20.5, cy: 38, r: 3, fill: '#E9D9CE' }),
      h('circle', { cx: 43.5, cy: 38, r: 3, fill: '#E9D9CE' }),
      h('g', { className: 'lo-cup' },
        h('rect', { x: 44, y: 33.5, width: 10, height: 9.5, rx: 2.4, fill: '#F5F0E6', stroke: '#354B43', strokeWidth: 1.5 }),
        h('path', { d: 'M54 35.6c3.2 0 3.2 5.2 0 5.2', fill: 'none', stroke: '#354B43', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { d: 'M47 30.5c-1-2 1-3 0-4.6M50 30.5c-1-2 1-3 0-4.6', fill: 'none', stroke: '#E8B88F', strokeWidth: 1.3, strokeLinecap: 'round' })))
    }

    /* ------------------------------------------------------------------ *
     * 8. Home
     * ------------------------------------------------------------------ */

    function clockTime(timestamp) {
      const date = new Date(timestamp)
      return pad2(date.getHours()) + ':' + pad2(date.getMinutes())
    }

    function WeatherIcon({ kind, size }) {
      const s = size || 30
      const ink = '#354B43'
      const cream = '#F5F0E6'
      const peach = '#E8B88F'
      const frame = { width: s, height: s, viewBox: '0 0 32 32', 'aria-hidden': true, style: { display: 'block', flex: 'none' } }
      const cloud = (x, y, scale) => h('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + scale + ')' },
        h('path', { d: 'M8 20a5 5 0 0 1 .7-9.9A7 7 0 0 1 22 11a4.6 4.6 0 0 1 1 9.1z', fill: cream, stroke: ink, strokeWidth: 1.4 }))
      if (kind === 'clear') {
        return h('svg', frame,
          h('circle', { cx: 16, cy: 16, r: 7, fill: peach }),
          h('path', { d: 'M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8', stroke: peach, strokeWidth: 1.8, strokeLinecap: 'round' }))
      }
      if (kind === 'partly') {
        return h('svg', frame,
          h('circle', { cx: 21, cy: 11, r: 5.5, fill: peach }),
          cloud(3, 6, 1))
      }
      if (kind === 'overcast' || kind === 'fog') {
        return h('svg', frame,
          cloud(3, 3, 1),
          kind === 'fog'
            ? h('path', { d: 'M7 26h18M9 30h14', stroke: ink, strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.7 })
            : h('path', { d: 'M10 26h12', stroke: ink, strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.55 }))
      }
      if (kind === 'snow') {
        return h('svg', frame,
          cloud(3, 2, 1),
          h('path', { d: 'M10 25v4M8 27h4M20 25v4M18 27h4', stroke: ink, strokeWidth: 1.5, strokeLinecap: 'round' }))
      }
      if (kind === 'storm') {
        return h('svg', frame,
          cloud(3, 2, 1),
          h('path', { d: 'M17 23l-4 6h5l-2 4 6-6h-5z', fill: peach, stroke: ink, strokeWidth: 1 }))
      }
      return h('svg', frame,
        cloud(3, 2, 1),
        h('path', { d: 'M10 25l-1.5 5M16 25l-1.5 5M22 25l-1.5 5', stroke: ink, strokeWidth: 1.6, strokeLinecap: 'round' }))
    }

    function WeatherBar({ location, weather, weatherState, onSetupCity }) {
      if (!location) {
        return h('section', { className: 'lo-weather' },
          h(WeatherIcon, { kind: 'partly', size: 30 }),
          h('div', { className: 'lo-weather-body' },
            h('span', { className: 'lo-weather-label' }, t('weatherTitle')),
            h('span', { className: 'lo-weather-meta' }, t('weatherSetCity'))),
          h('button', { type: 'button', className: 'lo-link', onClick: onSetupCity }, t('cityLabel')))
      }
      if (!weather) {
        return h('section', { className: 'lo-weather' },
          h(WeatherIcon, { kind: 'partly', size: 30 }),
          h('div', { className: 'lo-weather-body' },
            h('span', { className: 'lo-weather-label' }, location.name || t('weatherTitle')),
            h('span', { className: 'lo-weather-meta' }, weatherState === 'error' ? t('weatherError') : t('weatherLoading'))))
      }
      const kind = weatherKind(weather.code)
      return h('section', { className: 'lo-weather' },
        h(WeatherIcon, { kind: kind, size: 32 }),
        h('div', { className: 'lo-weather-body' },
          h('div', { className: 'lo-weather-line' },
            h('span', { className: 'lo-weather-temp' }, Math.round(weather.temperature) + '°'),
            h('span', { className: 'lo-weather-state' }, weatherLabel(weather.code))),
          h('div', { className: 'lo-weather-meta' },
            (location.name ? location.name + ' · ' : '')
            + t('weatherHighLow', { high: Math.round(weather.high), low: Math.round(weather.low) })
            + ' · ' + t('weatherFeels', { temp: Math.round(weather.apparent) }))),
        h('div', { className: 'lo-weather-side' },
          h('span', { className: 'lo-weather-updated' }, t('weatherUpdated', { time: clockTime(weather.updatedAt) }))))
    }

    function RetirementHero({ state, today, onSetup }) {
      const info = retirementInfo(state.profile)
      const start = parseISO(state.profile.careerStart)
      const days = info ? diffDays(today, info.date) : 0
      let progress = null
      if (info && start) {
        const total = diffDays(start, info.date)
        if (total > 0) progress = Math.max(0, Math.min(1, diffDays(start, today) / total))
      }
      const parts = info ? breakdown(days >= 0 ? today : info.date, days >= 0 ? info.date : today) : null

      if (!info) {
        return h('section', { className: 'lo-hero lo-hero-empty' },
          h('div', { className: 'lo-hero-top' },
            h(Mascot, { size: 46, mood: 'happy' }),
            h('div', null,
              h('p', { className: 'lo-hero-label' }, t('retireTitle')),
              h('p', { className: 'lo-hero-empty-text' }, t('retireEmpty')))),
          h(Button, { variant: 'primary', onClick: onSetup }, t('retireSetup')))
      }

      return h('section', { className: 'lo-hero' },
        h('div', { className: 'lo-hero-top' },
          h('div', null,
            h('p', { className: 'lo-hero-label' }, days > 0 ? t('retireUntil') : days === 0 ? t('retireToday') : t('retireRetired')),
            h('div', { className: 'lo-hero-value' },
              h('span', { className: 'lo-hero-num' }, formatInt(days)),
              h('span', { className: 'lo-hero-unit' }, t('days'))),
            days > 0
              ? h('p', { className: 'lo-hero-span' }, t('retireSpan', { span: breakdownText(parts) }))
              : null,
            h('p', { className: 'lo-hero-date' }, t('retireOn', { date: formatDate(info.date) })),
            info.manual ? h('p', { className: 'lo-hero-tag' }, t('retireManual')) : null),
          h('div', { className: 'lo-hero-art' }, h(Mascot, { size: 84, mood: days >= 0 ? 'happy' : 'celebrate' }))),
        progress == null ? null : h('div', { className: 'lo-progress-wrap' },
          h('div', { className: 'lo-progress-head' },
            h('span', null, LANG === 'en' ? 'Career ' + Math.round(progress * 100) + '%' : '职业生涯已过 ' + Math.round(progress * 100) + '%')),
          h('div', { className: 'lo-progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(progress * 100) },
            h('i', { style: { width: Math.max(0, Math.min(100, Math.round(progress * 100))) + '%' } }))))
    }

    function NextHolidayCard({ entry }) {
      if (!entry) return null
      return h('section', { className: 'lo-next' },
        h('p', { className: 'lo-next-label' }, entry.active ? t('onHoliday') : t('nextHoliday')),
        h('div', { className: 'lo-next-value' },
          h('span', { className: 'lo-next-num' }, formatInt(entry.active ? entry.remaining : entry.days)),
          h('span', { className: 'lo-next-unit' }, t('days'))),
        h('p', { className: 'lo-next-name' }, entry.name),
        h('p', { className: 'lo-next-meta' }, t('holidayRange', { start: monthDay(entry.date), end: monthDay(entry.end) }) + ' · ' + t('holidaySpan', { n: entry.span })),
        entry.active
          ? h('p', { className: 'lo-next-active' }, entry.remaining === 0 ? t('lastDay') : t('holidayLeft', { n: entry.remaining }))
          : null,
        entry.work.length ? h('p', { className: 'lo-next-work' }, t('makeupDays', { dates: entry.work.map(monthDay).join('、') })) : null)
    }

    function QuickStats({ state, now }) {
      const work = workStatus(state.profile, now)
      const payday = nextPayday(state.profile, now)
      const leave = leaveStats(state, now.getFullYear(), now)
      const workText = work.state === 'working'
        ? (LANG === 'en' ? Math.floor(work.minutes / 60) + 'h ' + (work.minutes % 60) + 'm' : Math.floor(work.minutes / 60) + ' 小时 ' + (work.minutes % 60) + ' 分')
        : work.state === 'before'
          ? (LANG === 'en' ? 'in ' + work.minutes + 'm' : '还有 ' + work.minutes + ' 分钟')
          : t('dayOff')
      const leaveText = leave.left + ' ' + t('days')
        + (leave.upcoming > 0 ? (LANG === 'en' ? ' · ' + leave.upcoming + ' upcoming' : ' · 待休 ' + leave.upcoming + ' 天') : '')
      return h('div', { className: 'lo-strip' },
        h('div', { className: 'lo-strip-item' },
          h('span', { className: 'lo-strip-label' }, work.state === 'working' ? t('workUntil') : work.state === 'before' ? t('workStartIn') : t('dayOff')),
          h('span', { className: 'lo-strip-value' }, workText)),
        h('div', { className: 'lo-strip-item' },
          h('span', { className: 'lo-strip-label' }, t('payday')),
          h('span', { className: 'lo-strip-value' }, payday ? (LANG === 'en' ? Math.max(0, diffDays(startOfDay(now), payday)) + ' d' : Math.max(0, diffDays(startOfDay(now), payday)) + ' 天') : t('none'))),
        h('div', { className: 'lo-strip-item' },
          h('span', { className: 'lo-strip-label' }, t('annualLeft')),
          h('span', { className: 'lo-strip-value' + (leave.left < 0 ? ' lo-negative' : '') }, leaveText)))
    }

    function DailyQuote({ quote }) {
      return h('section', { className: 'lo-quote' },
        h(Mascot, { size: 40, mood: 'cozy' }),
        h('div', { className: 'lo-quote-body' },
          h('p', { className: 'lo-quote-text' }, '“' + quote + '”'),
          h('p', { className: 'lo-quote-label' }, t('quote'))))
    }

    function CountdownList({ state }) {
      const [adding, setAdding] = useState(false)
      const [name, setName] = useState('')
      const [date, setDate] = useState('')
      const [yearly, setYearly] = useState(false)
      const [error, setError] = useState('')
      const today = startOfDay(new Date())

      const submit = () => {
        if (!name.trim()) return setError(t('errName'))
        if (!parseISO(date)) return setError(t('errDate'))
        patch({ countdowns: state.countdowns.concat([{ id: uid('cd'), name: name.trim(), date, yearly }]) })
        setName(''); setDate(''); setYearly(false); setError(''); setAdding(false)
      }

      return h(Card, {
        title: LANG === 'en' ? 'My countdowns' : '我的倒计时',
        action: h('div', { className: 'lo-card-actions' },
          h('span', { className: 'lo-count' }, state.countdowns.length),
          h('button', { type: 'button', className: 'lo-link', onClick: () => setAdding((value) => !value) }, adding ? t('cancel') : '+ ' + t('addCountdown'))),
      },
      adding ? h('div', { className: 'lo-form lo-form-inline' },
        h(Field, { label: t('name') }, h(TextInput, { value: name, onChange: setName, placeholder: LANG === 'en' ? 'e.g. trip to Japan' : '例如：旅行、纪念日' })),
        h(Field, { label: t('datePlaceholder') }, h(DateField, { value: date, onChange: setDate })),
        h('label', { className: 'lo-check' },
          h('input', { type: 'checkbox', checked: yearly, onChange: (event) => setYearly(event.target.checked) }),
          h('span', null, LANG === 'en' ? 'Repeats yearly' : '每年重复')),
        h(Button, { variant: 'primary', onClick: submit }, t('add')))
        : null,
      error ? h('p', { className: 'lo-error' }, error) : null,
      state.countdowns.length === 0
        ? h('p', { className: 'lo-empty' }, t('empty'))
        : h('ul', { className: 'lo-list' }, state.countdowns
          .map((item) => ({ item, date: nextOccurrence(item.date, item.yearly, today) }))
          .filter((entry) => entry.date)
          .sort((a, b) => {
            const da = diffDays(today, a.date)
            const db = diffDays(today, b.date)
            if ((da < 0) !== (db < 0)) return da < 0 ? 1 : -1
            return da - db
          })
          .map(({ item, date: when }) => {
            const days = diffDays(today, when)
            return h('li', { key: item.id, className: 'lo-row' },
              h('div', { className: 'lo-row-main' },
                h('span', { className: 'lo-row-name' }, item.name, item.yearly ? h('em', { className: 'lo-chip' }, LANG === 'en' ? 'yearly' : '每年') : null),
                h('span', { className: 'lo-row-meta' }, formatDate(when))),
              h('span', { className: 'lo-row-days' + (days < 0 ? ' lo-muted' : '') },
                days < 0 ? t('passed', { n: formatInt(days) }) : [formatInt(days), h('em', { key: 'u' }, t('days'))]),
              h('button', { type: 'button', className: 'lo-link lo-danger', onClick: () => patch({ countdowns: state.countdowns.filter((entry) => entry.id !== item.id) }) }, t('delete')))
          })))
    }

    function HomeView({ state, now, onTab, weather, weatherState }) {
      const today = startOfDay(now)
      const holidays = state.settings.showHolidays ? holidayPeriods(today) : []
      const featured = holidays.length ? holidays[0] : null
      const quote = dailyQuote(today)

      return h('div', { className: 'lo-view' },
        h(WeatherBar, {
          location: state.profile.location,
          weather,
          weatherState,
          onSetupCity: () => onTab('me'),
        }),
        h('div', { className: cx('lo-hero-row', !featured && 'lo-hero-single') },
          h(RetirementHero, { state, today, onSetup: () => onTab('me') }),
          h(NextHolidayCard, { entry: featured })),
        h(QuickStats, { state, now }),
        h(DailyQuote, { quote }),
        h(CountdownList, { state }),
        state.goals.length
          ? h(Card, { title: t('goals'), action: h('button', { type: 'button', className: 'lo-link', onClick: () => onTab('me') }, t('edit')) },
            h('ul', { className: 'lo-list' }, state.goals.slice(0, 3).map((goal) => h('li', { key: goal.id, className: 'lo-goal' },
              h('div', { className: 'lo-goal-head' },
                h('span', { className: 'lo-row-name' }, goal.title),
                h('span', { className: 'lo-row-days' }, goal.progress + '%')),
              h('div', { className: 'lo-progress lo-progress-sm' }, h('i', { style: { width: goal.progress + '%' } }))))))
          : null)
    }

    /* ------------------------------------------------------------------ *
     * 9. Calendar, leave and planner
     * ------------------------------------------------------------------ */

    const LEAVE_TYPES = [
      { value: 'annual', label: '年假|Annual' },
      { value: 'custom', label: '自定义|Custom' },
      { value: 'marriage', label: '婚假|Marriage' },
      { value: 'maternity', label: '产假/陪产|Parental' },
      { value: 'sick', label: '病假|Sick' },
      { value: 'personal', label: '事假|Personal' },
      { value: 'travel', label: '旅行|Travel' },
    ]
    const leaveTypeLabel = (value) => {
      const entry = LEAVE_TYPES.find((item) => item.value === value)
      if (!entry) return value
      const parts = entry.label.split('|')
      return LANG === 'en' ? parts[1] || parts[0] : parts[0]
    }

    function MonthGrid({ state, profile, cursor, selected, draft, onSelect }) {
      const cells = monthGrid(cursor.getFullYear(), cursor.getMonth(), state)
      const todayISO = toISO(new Date())
      const weeks = []
      for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))

      return h('div', { className: 'lo-month' },
        h('div', { className: 'lo-weekdays' },
          ['一', '二', '三', '四', '五', '六', '日'].map((day, index) => h('span', { key: day, className: 'lo-weekday' }, LANG === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : day))),
        weeks.map((week, weekIndex) => h('div', { key: weekIndex, className: 'lo-week' }, week.map((cell) => {
          const iso = toISO(cell.date)
          const isSelected = selected && iso === toISO(selected)
          const isToday = iso === todayISO
          const marks = dayMarks(cell.date, profile)
          const inRange = !!draft && diffDays(draft.start, cell.date) >= 0 && diffDays(cell.date, draft.end) >= 0
          const rangeStart = inRange && iso === toISO(draft.start)
          const rangeEnd = inRange && iso === toISO(draft.end)
          const label = [
            formatDate(cell.date),
            cell.info.name || '',
            cell.leaves.length ? cell.leaves.map((leave) => leave.name).join('、') : '',
            marks.birthday ? t('birthdayLabel') : '',
            marks.payday ? t('paydayLabel') : '',
          ].filter(Boolean).join(' · ')
          return h('button', {
            key: iso,
            type: 'button',
            'aria-label': label,
            className: cx(
              'lo-day',
              cell.outside && 'lo-day-outside',
              cell.info.type === 'weekend' && 'lo-day-weekend',
              cell.info.type === 'holiday' && 'lo-day-holiday',
              cell.info.type === 'makeup' && 'lo-day-makeup',
              isToday && 'lo-day-today',
              isSelected && 'lo-day-selected',
              inRange && 'lo-day-in-range',
              rangeStart && 'lo-day-range-start',
              rangeEnd && 'lo-day-range-end',
            ),
            onClick: () => onSelect(startOfDay(cell.date)),
          },
          h('span', { className: 'lo-day-num' }, cell.date.getDate()),
          h('span', { className: 'lo-day-marks' },
            cell.info.type === 'holiday' ? h('i', { className: 'lo-day-mark' }) : null,
            cell.leaves.length ? h('i', { className: 'lo-day-mark lo-day-mark-leave' }) : null,
            cell.info.type === 'makeup' ? h('span', { className: 'lo-day-badge' }, t('makeupShort')) : null,
            marks.payday ? h('span', { className: 'lo-day-badge' }, t('paydayShort')) : null,
            marks.birthday ? h('span', { className: 'lo-day-badge lo-day-badge-birthday' }, t('birthdayShort')) : null))
        }))))
    }

    function CalendarView({ state, now }) {
      const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
      const [selected, setSelected] = useState(() => startOfDay(now))
      const [draft, setDraft] = useState(null)
      const viewYear = cursor.getFullYear()
      const info = selected ? dayInfo(selected) : null
      const marks = selected ? dayMarks(selected, state.profile) : { birthday: false, payday: false }
      const selectedLeaves = selected
        ? state.leaves.filter((leave) => {
          const start = parseISO(leave.start)
          const end = parseISO(leave.end) || start
          return start && diffDays(start, selected) >= 0 && diffDays(selected, end) >= 0
        })
        : []

      const startDraft = (date) => setDraft({ start: startOfDay(date), end: startOfDay(date) })

      const onSelect = (date) => {
        setSelected(date)
        if (!draft) return
        setDraft((current) => {
          if (!current) return current
          const single = diffDays(current.start, current.end) === 0
          if (single) {
            if (diffDays(date, current.start) < 0) return { start: date, end: current.start }
            return { start: current.start, end: date }
          }
          return { start: date, end: date }
        })
      }

      const rangeText = draft
        ? (diffDays(draft.start, draft.end) === 0
          ? formatDate(draft.start)
          : formatDate(draft.start) + ' – ' + formatDate(draft.end))
        : ''

      return h('div', { className: 'lo-view' },
        h(Card, {
          title: LANG === 'en' ? viewYear + '/' + (cursor.getMonth() + 1) : viewYear + ' 年 ' + (cursor.getMonth() + 1) + ' 月',
          action: h('div', { className: 'lo-month-nav' },
            h('button', { type: 'button', className: 'lo-link', onClick: () => setCursor(new Date(viewYear, cursor.getMonth() - 1, 1)) }, t('monthPrev')),
            h('button', { type: 'button', className: 'lo-link', onClick: () => setCursor(new Date(now.getFullYear(), now.getMonth(), 1)) }, t('today')),
            h('button', { type: 'button', className: 'lo-link', onClick: () => setCursor(new Date(viewYear, cursor.getMonth() + 1, 1)) }, t('monthNext'))),
        },
        h(MonthGrid, { state, profile: state.profile, cursor, selected, draft, onSelect }),
        draft
          ? h('p', { className: 'lo-hint' }, t('selectDatesHint') + ' · ' + t('selectedRange', { range: rangeText }))
          : null,
        h('div', { className: 'lo-legend' },
          h('span', null, h('i', { className: 'lo-dot lo-dot-holiday' }), t('legendHoliday')),
          h('span', null, h('i', { className: 'lo-dot lo-dot-leave' }), t('legendLeave')),
          h('span', null, h('i', { className: 'lo-dot lo-dot-work' }), t('legendMakeup')))),
        selected
          ? h(Card, { title: formatDate(selected) + ' · ' + weekdayName(selected) },
            info && info.name
              ? h('p', { className: 'lo-note' }, info.type === 'makeup' ? t('makeupFor', { name: info.name }) : info.name)
              : null,
            marks.payday ? h('p', { className: 'lo-note' }, t('paydayLabel')) : null,
            selectedLeaves.length
              ? h('ul', { className: 'lo-list' }, selectedLeaves.map((leave) => h('li', { key: leave.id, className: 'lo-row' },
                h('div', { className: 'lo-row-main' },
                  h('span', { className: 'lo-row-name' }, leave.name, leave.half && leave.half !== 'none' ? h('em', { className: 'lo-chip' }, leave.half === 'am' ? t('morningHalf') : t('afternoonHalf')) : null),
                  h('span', { className: 'lo-row-meta' }, leaveTypeLabel(leave.type) + ' · ' + formatDate(parseISO(leave.start)) + ' – ' + formatDate(parseISO(leave.end) || parseISO(leave.start)))))))
              : h('p', { className: 'lo-empty' }, t('nothingOnDay')),
            h('div', { className: 'lo-actions' },
              h(Button, { onClick: () => startDraft(selected) }, t('addFromDay'))))
          : null,
        h(LeaveSection, { state, now, draft, setDraft, defaultDate: selected }),
        h(UpcomingHolidays, { today: startOfDay(now) }),
        h(Planner, { state, now }))
    }

    function LeaveSection({ state, now, draft, setDraft, defaultDate }) {
      const stats = leaveStats(state, now.getFullYear(), now)
      const [form, setForm] = useState({ type: 'annual', name: '', countsAsLeave: true, half: 'none', note: '' })
      const [error, setError] = useState('')
      const single = !!draft && diffDays(draft.start, draft.end) === 0
      const rangeText = draft
        ? (single ? formatDate(draft.start) : formatDate(draft.start) + ' – ' + formatDate(draft.end))
        : ''

      const openForm = () => {
        setDraft({ start: startOfDay(defaultDate || now), end: startOfDay(defaultDate || now) })
        setError('')
      }

      const submit = () => {
        if (!draft) return
        if (!form.name.trim()) return setError(t('errName'))
        patch({
          leaves: state.leaves.concat([{
            id: uid('lv'), type: form.type, name: form.name.trim(),
            start: toISO(draft.start), end: toISO(draft.end),
            countsAsLeave: form.countsAsLeave,
            half: single ? form.half : 'none',
            note: form.note,
          }]),
        })
        setDraft(null)
        setForm({ type: 'annual', name: '', countsAsLeave: true, half: 'none', note: '' })
        setError('')
      }

      return h(Card, {
        title: t('leaveTitle'),
        action: h('span', { className: 'lo-count' }, stats.left + ' / ' + stats.quota),
      },
      h('div', { className: 'lo-stats' },
        h('div', { className: 'lo-stat' }, h('span', { className: 'lo-stat-label' }, t('leaveQuota')), h('b', null, stats.quota)),
        h('div', { className: 'lo-stat' }, h('span', { className: 'lo-stat-label' }, t('leaveUsed')), h('b', null, stats.used)),
        h('div', { className: 'lo-stat' }, h('span', { className: 'lo-stat-label' }, t('leaveUpcoming')), h('b', null, stats.upcoming)),
        h('div', { className: 'lo-stat' }, h('span', { className: 'lo-stat-label' }, t('leaveLeft')), h('b', { className: stats.left < 0 ? 'lo-negative' : '' }, stats.left))),
      draft
        ? h('div', { className: 'lo-form' },
          h('div', { className: 'lo-field lo-field-wide' },
            h('span', { className: 'lo-field-label' }, t('selectDatesHint')),
            h('span', { className: 'lo-range-display' }, t('selectedRange', { range: rangeText }))),
          h(Field, { label: t('leaveType') },
            h(Select, { value: form.type, onChange: (value) => setForm(Object.assign({}, form, { type: value })), options: LEAVE_TYPES.map((item) => {
              const parts = item.label.split('|')
              return { value: item.value, label: LANG === 'en' ? parts[1] || parts[0] : parts[0] }
            }) })),
          h(Field, { label: t('name') }, h(TextInput, { value: form.name, onChange: (value) => setForm(Object.assign({}, form, { name: value })) })),
          h(Field, { label: t('halfDay') }, h(Select, {
            value: single ? form.half : 'none',
            disabled: !single,
            onChange: (value) => setForm(Object.assign({}, form, { half: value })),
            options: [
              { value: 'none', label: t('fullDay') },
              { value: 'am', label: t('morningHalf') },
              { value: 'pm', label: t('afternoonHalf') },
            ],
          })),
          h('label', { className: 'lo-check' },
            h('input', { type: 'checkbox', checked: form.countsAsLeave, onChange: (event) => setForm(Object.assign({}, form, { countsAsLeave: event.target.checked })) }),
            h('span', null, t('countsAsLeave'))),
          h(Button, { onClick: () => { setDraft(null); setError('') } }, t('cancel')),
          h(Button, { variant: 'primary', onClick: submit }, t('addLeave')))
        : h('div', { className: 'lo-actions' },
          h(Button, { onClick: openForm }, t('pickDates'))),
      h('p', { className: 'lo-hint' }, t('leaveHint')),
      error ? h('p', { className: 'lo-error' }, error) : null,
      state.leaves.length === 0
        ? h('p', { className: 'lo-empty' }, t('leaveEmpty'))
        : h('ul', { className: 'lo-list' }, state.leaves.slice().sort((a, b) => diffDays(parseISO(b.start), parseISO(a.start))).map((leave) => {
          const end = parseISO(leave.end) || parseISO(leave.start)
          const completed = diffDays(startOfDay(now), end) < 0
          const amount = leave.countsAsLeave ? leaveWorkDays(leave) : leaveDays(leave)
          const halfLabel = leave.half === 'am' ? t('morningHalf') : leave.half === 'pm' ? t('afternoonHalf') : ''
          return h('li', { key: leave.id, className: 'lo-row' },
            h('div', { className: 'lo-row-main' },
              h('span', { className: 'lo-row-name' }, leave.name,
                leave.countsAsLeave ? h('em', { className: 'lo-chip' }, LANG === 'en' ? 'leave' : '年假') : null,
                h('em', { className: 'lo-chip' }, completed ? t('leaveDone') : t('leaveUpcoming'))),
              h('span', { className: 'lo-row-meta' },
                leaveTypeLabel(leave.type) + ' · ' + formatDate(parseISO(leave.start)) + ' – ' + formatDate(end)
                + (halfLabel ? ' · ' + halfLabel : '')
                + (leave.countsAsLeave ? ' · ' + t('workdaysCount', { n: amount }) : ''))),
            h('span', { className: 'lo-row-days' }, amount, h('em', null, t('days'))),
            h('button', { type: 'button', className: 'lo-link lo-danger', onClick: () => patch({ leaves: state.leaves.filter((item) => item.id !== leave.id) }) }, t('delete')))
        })))
    }

    function UpcomingHolidays({ today }) {
      const periods = holidayPeriods(today).slice(0, 6)
      return h(Card, { title: t('upcomingHolidays') },
        periods.length
          ? h('ul', { className: 'lo-list' }, periods.map((entry) => h('li', { key: entry.id, className: 'lo-row' },
            h('div', { className: 'lo-row-main' },
              h('span', { className: 'lo-row-name' }, entry.name,
                entry.active ? h('em', { className: 'lo-chip' }, t('onHoliday')) : null),
              h('span', { className: 'lo-row-meta' },
                t('holidayRange', { start: formatDate(entry.date), end: formatDate(entry.end) })
                + (entry.work.length ? ' · ' + t('makeupDays', { dates: entry.work.map((date) => monthDay(date)).join('、') }) : ''))),
            h('span', { className: 'lo-row-days' }, entry.active ? entry.remaining : entry.days, h('em', null, t('days'))))))
          : h('p', { className: 'lo-empty' }, t('noUpcomingHolidays')),
        h('p', { className: 'lo-hint' }, t('dataNotice')))
    }

    function Planner({ state, now }) {
      const stats = leaveStats(state, now.getFullYear(), now)
      const [budget, setBudget] = useState(String(Math.max(1, Math.floor(stats.available) || 1)))
      const [from, setFrom] = useState(toISO(startOfDay(now)))
      const [to, setTo] = useState(toISO(addDays(startOfDay(now), 90)))
      const [sort, setSort] = useState('longest')
      const [plans, setPlans] = useState(null)
      const [error, setError] = useState('')

      const run = () => {
        const amount = Number(budget)
        if (!Number.isFinite(amount) || amount < 1) return setError(t('errBudget'))
        if (!parseISO(from) || !parseISO(to) || diffDays(parseISO(from), parseISO(to)) < 0) return setError(t('errDate'))
        setError('')
        setPlans(planLeave(state, { budget: amount, from, to, sort }))
        bumpStat('plannerRuns')
      }

      return h(Card, { title: t('planner') },
        h('p', { className: 'lo-hint' }, t('plannerHint')),
        h('div', { className: 'lo-form' },
          h(Field, { label: t('plannerBudget') }, h(TextInput, { value: budget, onChange: setBudget })),
          h(Field, { label: t('plannerWindow') + ' · ' + t('start') }, h(DateField, { value: from, onChange: setFrom })),
          h(Field, { label: t('end') }, h(DateField, { value: to, onChange: setTo })),
          h(Field, { label: t('type') }, h(Select, {
            value: sort,
            onChange: setSort,
            options: [
              { value: 'longest', label: t('plannerLongest') },
              { value: 'cheapest', label: t('plannerCheapest') },
              { value: 'value', label: t('plannerBest') },
            ],
          })),
          h(Button, { variant: 'primary', onClick: run }, t('plannerRun'))),
        error ? h('p', { className: 'lo-error' }, error) : null,
        plans == null ? null : plans.length === 0
          ? h('p', { className: 'lo-empty' }, t('plannerEmpty'))
          : h('ul', { className: 'lo-list lo-plans' }, plans.map((plan) => h('li', { key: plan.id, className: 'lo-plan' },
            h('div', { className: 'lo-plan-head' },
              h('span', { className: 'lo-plan-title' }, monthDay(plan.first) + ' – ' + monthDay(plan.last)),
              h('span', { className: 'lo-plan-badge' }, t('plannerResult', { n: plan.continuous }))),
            h('div', { className: 'lo-plan-meta' },
              t('plannerCost', { n: plan.cost }),
              ' · ',
              t('plannerRatio', { n: (Math.round(plan.ratio * 100) / 100).toFixed(2) })),
            h('div', { className: 'lo-plan-dates' }, t('plannerFree', { n: plan.continuous - plan.cost })),
            h('div', { className: 'lo-plan-dates' }, t('plannerLeaves') + '：' + plan.leaveDates.map(monthDay).join('、')),
            plan.makeup.length ? h('div', { className: 'lo-plan-warn' }, t('plannerMakeup', { dates: plan.makeup.map(monthDay).join('、') })) : null))))
    }

    /* ------------------------------------------------------------------ *
     * 10. Fun Lab
     * ------------------------------------------------------------------ */

    const PET_ACTIONS = [
      { id: 'pat', label: 'petPat', xp: 5, line: 'petPatLine', mood: 'happy' },
      { id: 'feed', label: 'petFeed', xp: 8, line: 'petFeedLine', mood: 'cozy' },
      { id: 'play', label: 'petPlay', xp: 10, line: 'petPlayLine', mood: 'celebrate' },
      { id: 'coffee', label: 'petCoffee', xp: 6, line: 'petCoffeeLine', mood: 'happy' },
      { id: 'soothe', label: 'petSoothe', xp: 4, line: 'petSootheLine', mood: 'cozy' },
    ]

    function FunView({ state, now, weather }) {
      const work = workStatus(state.profile, now)
      const payday = nextPayday(state.profile, now)
      const fun = funScores(state, now, weather)
      const level = petLevel(state.pet.xp)
      const into = state.pet.xp % 50
      const today = toISO(startOfDay(now))
      const [reaction, setReaction] = useState(null)
      const [bump, setBump] = useState(0)

      const interact = (action) => {
        const before = petLevel(state.pet.xp)
        const nextXp = state.pet.xp + action.xp
        const after = petLevel(nextXp)
        const todayActions = petActionsFor(state, now)
        const nextActions = Object.assign({}, todayActions, { [action.id]: (todayActions[action.id] || 0) + 1 })
        patch({ pet: { xp: nextXp, lastPet: today, actions: nextActions } })
        const text = after > before ? t('petLevelUp', { n: after }) : t(action.line)
        setReaction({ mood: after > before ? 'celebrate' : action.mood, text, xp: action.xp, action: action.id, key: bump + 1 })
        setBump(bump + 1)
        window.setTimeout(() => setReaction(null), 2000)
      }

      const workValue = work.state === 'working'
        ? (LANG === 'en' ? Math.floor(work.minutes / 60) + 'h ' + (work.minutes % 60) + 'm' : Math.floor(work.minutes / 60) + ' 小时 ' + (work.minutes % 60) + ' 分')
        : work.state === 'before'
          ? (LANG === 'en' ? work.minutes + ' min' : work.minutes + ' 分钟')
          : t('dayOff')

      return h('div', { className: 'lo-view' },
        h('p', { className: 'lo-hint' }, t('funDesc')),
        h('div', { className: 'lo-duo' },
          h('section', { className: 'lo-tile' },
            h('span', { className: 'lo-tile-label' }, work.state === 'working' ? t('workUntil') : work.state === 'before' ? t('workStartIn') : t('dayOff')),
            h('span', { className: 'lo-tile-value' }, workValue),
            h('span', { className: 'lo-tile-meta' }, state.profile.workStart + ' – ' + state.profile.workEnd)),
          h('section', { className: 'lo-tile' },
            h('span', { className: 'lo-tile-label' }, t('payday')),
            h('span', { className: 'lo-tile-value' }, payday ? (LANG === 'en' ? diffDays(startOfDay(now), payday) + ' d' : diffDays(startOfDay(now), payday) + ' 天') : t('none')),
            h('span', { className: 'lo-tile-meta' }, payday ? formatDate(payday) : t('none')))),
        h(Card, { title: t('funTitle') },
          h('div', { className: 'lo-meters' },
            h(Meter, { label: t('slackIndex'), value: fun.slack, reason: fun.reasons.slack }),
            h(Meter, { label: t('coffeeIndex'), value: fun.coffee, reason: fun.reasons.coffee }),
            h(Meter, { label: t('moodIndex'), value: fun.mood, reason: fun.reasons.mood })),
          h('p', { className: 'lo-hint' }, t('forFun'))),
        h('section', { className: 'lo-pet' },
          h('button', {
            type: 'button',
            className: 'lo-pet-hit',
            'aria-label': t('petAction'),
            onClick: () => interact(PET_ACTIONS[0]),
          },
          h('span', {
            key: reaction ? reaction.key : 'idle',
            className: 'lo-pet-art',
          }, h(Mascot, { size: 96, mood: reaction ? reaction.mood : petMood(now), action: reaction ? reaction.action : '' })),
          reaction ? h('span', { className: 'lo-pet-xp', key: 'xp-' + reaction.key }, '+' + reaction.xp) : null),
          h('div', { className: 'lo-pet-body' },
            h('p', { className: 'lo-pet-name' }, t('petTitle')),
            h('p', { className: 'lo-pet-level' }, t('petLevel', { n: level }) + ' · ' + t('petXp', { n: state.pet.xp })),
            h('div', { className: 'lo-progress lo-progress-sm' }, h('i', { style: { width: Math.round((into / 50) * 100) + '%' } })),
            h('p', { className: 'lo-pet-message' + (reaction ? ' lo-pet-message-active' : '') }, reaction ? reaction.text : t('petHint')),
            h('div', { className: 'lo-pet-actions' }, PET_ACTIONS.map((action) => h('button', {
              key: action.id,
              type: 'button',
              className: 'lo-pet-action',
              onClick: () => interact(action),
            }, t(action.label)))),
            h('p', { className: 'lo-hint' }, t('petBonus', interactionBonus(state, now))))),
        h(Card, { title: t('achievements'), action: h('span', { className: 'lo-count' }, Object.keys(state.achievements).length + ' / ' + ACHIEVEMENTS.length) },
          h('div', { className: 'lo-achievements' }, ACHIEVEMENTS.map((item) => {
            const unlockedAt = state.achievements[item.id]
            const parts = item.title.split('|')
            const title = LANG === 'en' ? parts[1] || parts[0] : parts[0]
            const descParts = item.desc.split('|')
            const desc = LANG === 'en' ? descParts[1] || descParts[0] : descParts[0]
            return h('div', { key: item.id, className: cx('lo-achievement', unlockedAt && 'lo-achievement-on'), title: desc },
              h('span', { className: 'lo-achievement-dot' }),
              h('div', null,
                h('span', { className: 'lo-achievement-name' }, title),
                h('span', { className: 'lo-achievement-meta' }, unlockedAt ? unlockedAt : t('locked')),
                h('span', { className: 'lo-achievement-desc' }, desc)))
          }))))
    }

    function Meter({ label, value, reason }) {
      return h('div', { className: 'lo-meter' },
        h('div', { className: 'lo-meter-head' },
          h('span', null, label),
          h('b', null, value)),
        h('div', { className: 'lo-progress lo-progress-sm' }, h('i', { style: { width: value + '%' } })),
        h('span', { className: 'lo-meter-reason' }, reason))
    }

    /* ------------------------------------------------------------------ *
     * 11. Me — profile, work schedule, goals, capsules, data
     * ------------------------------------------------------------------ */

    function MeView({ state }) {
      const fileRef = useRef(null)
      const [opened, setOpened] = useState([])
      const [importError, setImportError] = useState('')
      const [notice, setNotice] = useState('')
      const [cityQuery, setCityQuery] = useState('')
      const [cityState, setCityState] = useState('idle')
      const [cityResults, setCityResults] = useState(null)
      const [goalDraft, setGoalDraft] = useState({ title: '', category: 'life', target: '' })
      const [capsuleDraft, setCapsuleDraft] = useState({ title: '', unlockDate: '', body: '' })
      const [capsuleError, setCapsuleError] = useState('')
      const today = startOfDay(new Date())

      const searchCityNow = async () => {
        const query = cityQuery.trim()
        if (!query) return
        setCityState('searching')
        setCityResults(null)
        try {
          const results = await searchCity(query)
          setCityResults(results)
          setCityState(results.length ? 'done' : 'empty')
        } catch (error) {
          setCityState('error')
        }
      }

      const addGoal = () => {
        if (!goalDraft.title.trim()) return
        patch({ goals: state.goals.concat([{ id: uid('goal'), title: goalDraft.title.trim(), category: goalDraft.category, target: goalDraft.target, progress: 0, done: false, note: '' }]) })
        setGoalDraft({ title: '', category: 'life', target: '' })
      }

      const addCapsule = () => {
        if (!capsuleDraft.title.trim() || !capsuleDraft.body.trim()) return setCapsuleError(t('errName'))
        if (!parseISO(capsuleDraft.unlockDate)) return setCapsuleError(t('errDate'))
        patch({ capsules: state.capsules.concat([{ id: uid('cap'), title: capsuleDraft.title.trim(), body: capsuleDraft.body, unlockDate: capsuleDraft.unlockDate, createdAt: toISO(new Date()) }]) })
        setCapsuleDraft({ title: '', unlockDate: '', body: '' })
        setCapsuleError('')
      }

      const onFile = async (event) => {
        const file = event.target.files && event.target.files[0]
        if (!file) return
        try {
          const next = parseImport(await file.text())
          if (window.confirm(t('confirmImport'))) {
            commit(next)
            setImportError('')
            setNotice(t('saved'))
          }
        } catch (error) {
          setImportError(t('errImport'))
          setNotice('')
        }
        event.target.value = ''
      }

      return h('div', { className: 'lo-view' },
        h(Card, { title: t('profile') },
          h('div', { className: 'lo-form' },
            h(Field, { label: t('name') }, h(TextInput, { value: state.profile.name, onChange: (value) => patchProfile({ name: value }), placeholder: t('namePlaceholder') })),
            h(Field, { label: t('birthDate') }, h(DateField, { value: state.profile.birthDate, onChange: (value) => patchProfile({ birthDate: value }), max: today })),
            h(Field, { label: t('sex') }, h(Select, {
              value: state.profile.sex,
              onChange: (value) => patchProfile({ sex: value }),
              options: [
                { value: '', label: t('sexUnset') },
                { value: 'male', label: t('sexMale') },
                { value: 'female55', label: t('sexFemale55') },
                { value: 'female50', label: t('sexFemale50') },
              ],
            })),
            h(Field, { label: t('retireDate') }, h(Select, {
              value: state.profile.retireMode,
              onChange: (value) => patchProfile({ retireMode: value }),
              options: [{ value: 'auto', label: t('retireAuto') }, { value: 'manual', label: t('retireManual') }],
            })),
            state.profile.retireMode === 'manual'
              ? h(Field, { label: t('retireDateManual') }, h(DateField, { value: state.profile.retireDate, onChange: (value) => patchProfile({ retireDate: value }) }))
              : null,
            state.profile.retireMode === 'auto'
              ? h(Field, { label: t('flex') }, h(Select, {
                value: String(state.profile.flexMonths),
                onChange: (value) => patchProfile({ flexMonths: Number(value) }),
                options: [
                  { value: '-36', label: t('flexEarly', { n: 3 }) },
                  { value: '-24', label: t('flexEarly', { n: 2 }) },
                  { value: '-12', label: t('flexEarly', { n: 1 }) },
                  { value: '0', label: t('flexNone') },
                  { value: '12', label: t('flexLate', { n: 1 }) },
                  { value: '24', label: t('flexLate', { n: 2 }) },
                  { value: '36', label: t('flexLate', { n: 3 }) },
                ],
              }))
              : null,
            h(Field, { label: t('careerStart') }, h(DateField, { value: state.profile.careerStart, onChange: (value) => patchProfile({ careerStart: value }), max: today })),
            h(Field, { label: t('language') }, h(Select, {
              value: state.settings.lang,
              onChange: (value) => patchSettings({ lang: value }),
              options: [{ value: 'zh', label: '中文' }, { value: 'en', label: 'English' }],
            })),
            h('div', { className: 'lo-field lo-field-wide' },
              h('span', { className: 'lo-field-label' }, t('cityLabel')),
              h('div', { className: 'lo-city-row' },
                h('input', {
                  className: 'lo-input',
                  value: cityQuery,
                  placeholder: t('cityPlaceholder'),
                  'aria-label': t('cityLabel'),
                  onChange: (event) => setCityQuery(event.target.value),
                  onKeyDown: (event) => { if (event.key === 'Enter') searchCityNow() },
                }),
                h(Button, { onClick: searchCityNow }, t('citySearch'))),
              state.profile.location
                ? h('div', { className: 'lo-city-current' },
                  h('span', null, state.profile.location.name),
                  h('button', { type: 'button', className: 'lo-link lo-danger', onClick: () => patchProfile({ location: null }) }, t('cityClear')))
                : null,
              cityState === 'searching' ? h('span', { className: 'lo-hint' }, t('citySearching')) : null,
              cityState === 'empty' ? h('span', { className: 'lo-hint' }, t('cityNoResult')) : null,
              cityState === 'error' ? h('span', { className: 'lo-error' }, t('cityError')) : null,
              cityResults && cityResults.length
                ? h('div', { className: 'lo-city-results' }, cityResults.map((row) => h('button', {
                  key: row.name + row.latitude,
                  type: 'button',
                  className: 'lo-city-result',
                  onClick: () => {
                    patchProfile({ location: row })
                    setCityQuery('')
                    setCityResults(null)
                    setCityState('idle')
                  },
                }, row.name)))
                : null))),
        h(Card, { title: t('workSchedule') },
          h('div', { className: 'lo-form' },
            h(Field, { label: t('workStart') }, h(TextInput, { value: state.profile.workStart, onChange: (value) => patchProfile({ workStart: value }) })),
            h(Field, { label: t('workEnd') }, h(TextInput, { value: state.profile.workEnd, onChange: (value) => patchProfile({ workEnd: value }) })),
            h(Field, { label: t('salaryDay') }, h(TextInput, { value: state.profile.salaryDay, onChange: (value) => patchProfile({ salaryDay: value.trim() === '' ? '' : Math.min(28, Math.max(1, Number(value) || 1)) }) })),
            h(Field, { label: t('leaveQuota') }, h(TextInput, { value: state.profile.leaveQuota, onChange: (value) => patchProfile({ leaveQuota: Math.max(0, Number(value) || 0) }) })),
            h(Field, { label: t('leaveCarry') }, h(TextInput, { value: state.profile.leaveCarry, onChange: (value) => patchProfile({ leaveCarry: Math.max(0, Number(value) || 0) }) }))),
          h('div', { className: 'lo-workdays' }, [1, 2, 3, 4, 5, 6, 7].map((day) => h('label', { key: day, className: 'lo-check' },
            h('input', {
              type: 'checkbox',
              checked: state.profile.workdays.includes(day),
              onChange: (event) => {
                const next = event.target.checked
                  ? state.profile.workdays.concat([day]).sort((a, b) => a - b)
                  : state.profile.workdays.filter((item) => item !== day)
                patchProfile({ workdays: next })
              },
            }),
            h('span', null, LANG === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1] : '周' + ['一', '二', '三', '四', '五', '六', '日'][day - 1]))))),
        h(Card, { title: t('goals'), action: h('span', { className: 'lo-count' }, state.goals.length) },
          h('div', { className: 'lo-form' },
            h(Field, { label: t('goalTitle') }, h(TextInput, { value: goalDraft.title, onChange: (value) => setGoalDraft(Object.assign({}, goalDraft, { title: value })) })),
            h(Field, { label: t('goalTarget') }, h(DateField, { value: goalDraft.target, onChange: (value) => setGoalDraft(Object.assign({}, goalDraft, { target: value })) })),
            h(Button, { variant: 'primary', onClick: addGoal }, t('goalAdd'))),
          state.goals.length === 0 ? h('p', { className: 'lo-empty' }, t('goalEmpty')) : h('ul', { className: 'lo-list' }, state.goals.map((goal) => h('li', { key: goal.id, className: 'lo-goal' },
            h('div', { className: 'lo-goal-head' },
              h('span', { className: 'lo-row-name' }, goal.title, goal.target ? h('em', { className: 'lo-chip' }, formatDate(parseISO(goal.target))) : null),
              h('span', { className: 'lo-row-days' }, goal.progress + '%')),
            h('input', {
              type: 'range', min: 0, max: 100, value: goal.progress,
              className: 'lo-range',
              'aria-label': t('goalProgress'),
              onChange: (event) => patch({ goals: state.goals.map((item) => item.id === goal.id ? Object.assign({}, item, { progress: Number(event.target.value), done: Number(event.target.value) >= 100 }) : item) }),
            }),
            h('div', { className: 'lo-goal-foot' },
              h('button', { type: 'button', className: 'lo-link lo-danger', onClick: () => patch({ goals: state.goals.filter((item) => item.id !== goal.id) }) }, t('delete'))))))),
        h(Card, { title: t('capsules'), action: h('span', { className: 'lo-count' }, state.capsules.length) },
          h('div', { className: 'lo-form' },
            h(Field, { label: t('name') }, h(TextInput, { value: capsuleDraft.title, onChange: (value) => setCapsuleDraft(Object.assign({}, capsuleDraft, { title: value })) })),
            h(Field, { label: t('goalTarget') }, h(DateField, { value: capsuleDraft.unlockDate, onChange: (value) => setCapsuleDraft(Object.assign({}, capsuleDraft, { unlockDate: value })) })),
            h('label', { className: 'lo-field lo-field-wide' },
              h('span', { className: 'lo-field-label' }, t('capsuleBody')),
              h('textarea', {
                className: 'lo-input lo-textarea',
                value: capsuleDraft.body,
                onChange: (event) => setCapsuleDraft(Object.assign({}, capsuleDraft, { body: event.target.value })),
              })),
            h(Button, { variant: 'primary', onClick: addCapsule }, t('capsuleAdd'))),
          capsuleError ? h('p', { className: 'lo-error' }, capsuleError) : null,
          state.capsules.length === 0 ? h('p', { className: 'lo-empty' }, t('capsuleEmpty')) : h('ul', { className: 'lo-list' }, state.capsules.map((capsule) => {
            const unlock = parseISO(capsule.unlockDate)
            const ready = unlock && diffDays(today, unlock) <= 0
            const open = ready && opened.includes(capsule.id)
            return h('li', { key: capsule.id, className: 'lo-capsule' },
              h('div', { className: 'lo-goal-head' },
                h('span', { className: 'lo-row-name' }, capsule.title),
                h('span', { className: 'lo-chip' }, capsule.unlockDate)),
              open
                ? h('p', { className: 'lo-capsule-body' }, capsule.body)
                : h('p', { className: 'lo-hint' }, ready ? t('capsuleOpen') : t('capsuleLocked', { date: capsule.unlockDate })),
              h('div', { className: 'lo-goal-foot' },
                ready && !open ? h('button', { type: 'button', className: 'lo-link', onClick: () => setOpened(opened.concat([capsule.id])) }, t('capsuleUnlock')) : null,
                h('button', { type: 'button', className: 'lo-link lo-danger', onClick: () => patch({ capsules: state.capsules.filter((item) => item.id !== capsule.id) }) }, t('delete'))))
          }))),
        h(Card, { title: t('data') },
          h('p', { className: 'lo-hint' }, t('dataHint')),
          h('div', { className: 'lo-actions' },
            h(Button, { onClick: () => { exportData(); setNotice(t('saved')) } }, t('exportJson')),
            h(Button, { onClick: () => fileRef.current && fileRef.current.click() }, t('importJson')),
            h(Button, { variant: 'ghost', onClick: () => { if (window.confirm(t('confirmReset'))) resetData() } }, t('resetData'))),
          h('input', { type: 'file', accept: 'application/json', ref: fileRef, style: { display: 'none' }, onChange: onFile }),
          importError ? h('p', { className: 'lo-error' }, importError) : null,
          notice ? h('p', { className: 'lo-hint', 'aria-live': 'polite' }, notice) : null),
        h(Card, { title: t('about') },
          h('p', { className: 'lo-hint' }, 'DAYS — Days Are Yours · ' + t('slogan')),
          h('p', { className: 'lo-hint' }, t('version') + ' 1.5.0 · MIT License')))
    }

    /* ------------------------------------------------------------------ *
     * 12. Shell
     * ------------------------------------------------------------------ */

    const TABS = [
      { id: 'home', label: 'tabHome', icon: 'home' },
      { id: 'calendar', label: 'tabCalendar', icon: 'calendar' },
      { id: 'fun', label: 'tabFun', icon: 'spark' },
      { id: 'me', label: 'tabMe', icon: 'user' },
    ]

    function TabIcon({ name, active }) {
      const color = active ? 'currentColor' : 'currentColor'
      const props = { stroke: color, strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
      const frame = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } }
      if (name === 'home') {
        return h('svg', frame,
          h('path', Object.assign({ d: 'M4 11l8-6.5 8 6.5v8.2a1 1 0 0 1-1 1h-4.6v-5.4H9.6v5.4H5a1 1 0 0 1-1-1z' }, props)))
      }
      if (name === 'calendar') {
        return h('svg', frame,
          h('rect', Object.assign({ x: 4, y: 5.5, width: 16, height: 14.5, rx: 3 }, props)),
          h('path', Object.assign({ d: 'M4 10h16M8.5 3.5v4M15.5 3.5v4' }, props)))
      }
      if (name === 'spark') {
        return h('svg', frame,
          h('path', Object.assign({ d: 'M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z' }, props)),
          h('path', Object.assign({ d: 'M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z' }, props)))
      }
      return h('svg', frame,
        h('circle', Object.assign({ cx: 12, cy: 8, r: 3.4 }, props)),
        h('path', Object.assign({ d: 'M4.8 20c.8-3.7 3.6-5.6 7.2-5.6s6.4 1.9 7.2 5.6' }, props)))
    }

    function App() {
      const state = useDaysState()
      const now = useNow(30000)
      const [tab, setTab] = useState(() => state.settings.tab || 'home')
      const [counted, setCounted] = useState(false)
      const [weather, setWeather] = useState(null)
      const [weatherState, setWeatherState] = useState('none')
      const [weatherTick, setWeatherTick] = useState(0)
      const location = state.profile.location
      const locationKey = location ? location.latitude + ',' + location.longitude : ''

      useEffect(() => {
        if (counted) return
        setCounted(true)
        bumpStat('visits')
      }, [counted])

      useEffect(() => {
        const timer = window.setInterval(() => setWeatherTick((value) => value + 1), 10 * 60 * 1000)
        return () => window.clearInterval(timer)
      }, [])

      useEffect(() => {
        if (!location) {
          setWeather(null)
          setWeatherState('none')
          return
        }
        const cached = readWeatherCache()
        if (cached && sameLocation(cached.location, location) && isWeatherFresh(cached, Date.now())) {
          setWeather(cached.data)
          setWeatherState('ready')
          return
        }
        let cancelled = false
        const controller = new AbortController()
        const timer = window.setTimeout(() => controller.abort(), 7000)
        setWeather(null)
        setWeatherState('loading')
        fetchWeather(location, controller.signal)
          .then((data) => {
            if (cancelled) return
            cacheWeather(location, data)
            setWeather(data)
            setWeatherState('ready')
          })
          .catch(() => { if (!cancelled) setWeatherState('error') })
          .finally(() => window.clearTimeout(timer))
        return () => {
          cancelled = true
          controller.abort()
          window.clearTimeout(timer)
        }
      }, [locationKey, weatherTick])

      const switchTab = (next) => {
        setTab(next)
        patchSettings({ tab: next })
      }

      return h('div', { className: 'lo-root' },
        h('style', null, CSS),
        h('div', { className: 'lo-scroll' },
          h('div', { className: 'lo-inner' },
            h('header', { className: 'lo-top' },
              h('div', { className: 'lo-brand' },
                h(Mascot, { size: 36, mood: 'happy' }),
                h('div', null,
                  h('h1', { className: 'lo-title' }, 'DAYS'),
                  h('p', { className: 'lo-slogan' }, t('slogan')))),
              h('span', { className: 'lo-date' }, formatDate(startOfDay(now)))),
            tab === 'home'
              ? h(HomeView, {
                state,
                now,
                onTab: switchTab,
                weather,
                weatherState,
              })
              : tab === 'calendar'
                ? h(CalendarView, { state, now })
                : tab === 'fun'
                  ? h(FunView, { state, now, weather })
                  : h(MeView, { state }))),
        h('nav', { className: 'lo-nav' }, TABS.map((item) => h('button', {
          key: item.id,
          type: 'button',
          className: cx('lo-nav-item', tab === item.id && 'lo-nav-active'),
          onClick: () => switchTab(item.id),
        }, h(TabIcon, { name: item.icon, active: tab === item.id }), h('span', null, t(item.label))))))
    }

    /* ------------------------------------------------------------------ *
     * 13. Styles — host tokens for surfaces, DAYS palette for accents
     * ------------------------------------------------------------------ */

    const CSS = `
.lo-root{--lo-forest:#354B43;--lo-peach:#E8B88F;--lo-sage:#DDE8D8;--lo-blush:#E9D9CE;--lo-sand:#D6C9AA;height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:14px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}
.lo-root *{box-sizing:border-box}
.lo-scroll{flex:1;min-height:0;overflow:auto}
.lo-inner{max-width:880px;margin:0 auto;padding:34px 30px 40px}
.lo-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}
.lo-brand{display:flex;align-items:center;gap:11px}
.lo-title{margin:0;font-size:17px;font-weight:600;letter-spacing:.01em}
.lo-slogan{margin:1px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-date{font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;padding-top:5px}
.lo-view{display:flex;flex-direction:column;gap:16px}
.lo-card{position:relative;padding:20px 22px;border:1px solid var(--dsw-alias-border-l1);border-radius:18px;background:var(--dsw-alias-bg-base);box-shadow:0 1px 1px rgba(16,24,40,.03),0 4px 14px -12px rgba(16,24,40,.11)}
@supports (box-shadow:0 0 0 1px color-mix(in srgb,red 10%,transparent)){
.lo-card{box-shadow:0 1px 1px color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent),0 4px 14px -12px color-mix(in srgb,var(--dsw-alias-label-primary) 13%,transparent)}
}
.lo-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.lo-card-title{margin:0;font-size:13px;font-weight:600;letter-spacing:.01em}
.lo-count{font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.lo-card-actions{display:flex;align-items:center;gap:14px}
.lo-hero-row{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:16px;align-items:stretch}
.lo-hero-row.lo-hero-single{grid-template-columns:minmax(0,1fr)}
.lo-hero{display:flex;flex-direction:column;padding:24px 26px 26px;border:1px solid var(--dsw-alias-border-l1);border-radius:22px;background:var(--dsw-alias-bg-base);box-shadow:0 1px 1px rgba(16,24,40,.03),0 10px 26px -18px rgba(16,24,40,.2);overflow:hidden}
@supports (box-shadow:0 0 0 1px color-mix(in srgb,red 10%,transparent)){
.lo-hero{box-shadow:0 1px 1px color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent),0 10px 26px -18px color-mix(in srgb,var(--dsw-alias-label-primary) 22%,transparent)}
}
.lo-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex:1}
.lo-hero-label{margin:0;font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.lo-hero-value{display:flex;align-items:baseline;gap:10px;margin:10px 0 0}
.lo-hero-num{font-size:clamp(52px,8.5vw,86px);line-height:.88;font-weight:600;letter-spacing:-.05em;font-variant-numeric:tabular-nums}
.lo-hero-unit{font-size:14px;color:var(--dsw-alias-label-secondary)}
.lo-hero-span{margin:14px 0 0;font-size:15px;font-variant-numeric:tabular-nums}
.lo-hero-date{margin:3px 0 0;font-size:12.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.lo-hero-tag{margin:6px 0 0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-hero-art{align-self:center;opacity:.95}
.lo-hero-empty{gap:16px}
.lo-hero-empty .lo-hero-top{flex:0 0 auto;align-items:center}
.lo-hero-empty-text{margin:4px 0 0;max-width:26em;font-size:13px;color:var(--dsw-alias-label-secondary)}
.lo-next{display:flex;flex-direction:column;padding:24px 24px 22px;border:1px solid var(--dsw-alias-border-l1);border-radius:22px;background:var(--dsw-alias-bg-base);box-shadow:0 1px 1px rgba(16,24,40,.03),0 4px 14px -12px rgba(16,24,40,.11)}
@supports (box-shadow:0 0 0 1px color-mix(in srgb,red 10%,transparent)){
.lo-next{box-shadow:0 1px 1px color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent),0 4px 14px -12px color-mix(in srgb,var(--dsw-alias-label-primary) 13%,transparent)}
}
.lo-next-label{margin:0;font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.lo-next-value{display:flex;align-items:baseline;gap:8px;margin:14px 0 0}
.lo-next-num{font-size:clamp(40px,6vw,58px);line-height:.95;font-weight:600;letter-spacing:-.045em;font-variant-numeric:tabular-nums}
.lo-next-unit{font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.lo-next-name{margin:8px 0 0;font-size:16px;font-weight:600;overflow-wrap:anywhere}
.lo-next-meta{margin:auto 0 0;padding-top:16px;font-size:12.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.lo-next-active{margin:5px 0 0;font-size:12px;color:var(--dsw-alias-brand-primary)}
.lo-next-work{margin:4px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-base);overflow:hidden}
.lo-strip-item{display:flex;flex-direction:column;gap:3px;padding:13px 16px;min-width:0}
.lo-strip-item + .lo-strip-item{border-left:1px solid var(--dsw-alias-border-l1)}
.lo-strip-label{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lo-strip-value{font-size:15px;font-weight:600;font-variant-numeric:tabular-nums}
.lo-negative{color:var(--dsw-alias-state-error-primary)}
.lo-weather{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-base);box-shadow:0 1px 1px rgba(16,24,40,.03),0 3px 10px -8px rgba(16,24,40,.08)}
@supports (box-shadow:0 0 0 1px color-mix(in srgb,red 10%,transparent)){
.lo-weather{box-shadow:0 1px 1px color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent),0 3px 10px -8px color-mix(in srgb,var(--dsw-alias-label-primary) 11%,transparent)}
}
.lo-weather-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.lo-weather-label{font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-weather-line{display:flex;align-items:baseline;gap:10px}
.lo-weather-temp{font-size:26px;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.lo-weather-state{font-size:13px}
.lo-weather-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.lo-weather-side{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none}
.lo-weather-updated{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.lo-meter-reason{display:block;margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4}
.lo-pet-message{margin:5px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary);min-height:18px}
.lo-pet-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
.lo-pet-action{height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;cursor:pointer}
.lo-pet-action:hover{background:var(--dsw-alias-bg-layer-2)}
.lo-city-row{display:flex;gap:8px;align-items:center}
.lo-city-row .lo-input{flex:1}
.lo-city-current{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:2px}
.lo-city-results{display:flex;flex-direction:column;margin-top:6px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}
.lo-city-result{text-align:left;padding:8px 10px;border:0;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;font-size:12px;cursor:pointer}
.lo-city-result:first-child{border-top:0}
.lo-city-result:hover{background:var(--dsw-alias-bg-layer-2)}
.lo-quote{display:flex;align-items:center;gap:14px;padding:8px 2px}
.lo-quote-body{min-width:0}
.lo-quote-text{margin:0;font-size:13.5px}
.lo-quote-label{margin:3px 0 0;font-size:11px;color:var(--dsw-alias-label-secondary)}
.lo-progress-wrap{margin-top:22px}
.lo-progress-head{display:flex;justify-content:space-between;font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:8px}
.lo-progress{height:4px;border-radius:99px;background:var(--dsw-alias-border-l1);overflow:hidden}
.lo-progress > i{display:block;height:100%;min-width:2px;border-radius:99px;background:var(--dsw-alias-brand-primary)}
.lo-progress-sm{height:5px;margin-top:7px}
.lo-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:13px 16px;align-items:end}
.lo-form-inline{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.lo-field{display:flex;flex-direction:column;gap:6px;min-width:0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-field-wide{grid-column:1/-1}
.lo-field-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lo-input{height:34px;min-width:0;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.lo-input:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px}
.lo-input:disabled{opacity:.5;cursor:not-allowed}
.lo-input-invalid{border-color:var(--dsw-alias-state-error-primary)}
.lo-textarea{height:auto;min-height:92px;padding:9px 10px;resize:vertical;line-height:1.6}
.lo-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none}
.lo-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}
.lo-btn{min-height:34px;padding:0 13px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap}
.lo-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.lo-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.lo-btn-primary:hover{opacity:.92;background:var(--dsw-alias-brand-primary)}
.lo-btn-ghost{border-style:dashed}
.lo-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.lo-list{list-style:none;margin:6px 0 0;padding:0}
.lo-row{display:flex;align-items:center;gap:14px;padding:11px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.lo-row:last-child{border-bottom:0;padding-bottom:2px}
.lo-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.lo-row-name{display:flex;align-items:center;gap:7px;font-size:13.5px;overflow-wrap:anywhere}
.lo-row-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.lo-row-days{font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--dsw-alias-label-primary)}
.lo-row-days em{font-style:normal;margin-left:3px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.lo-chip{font-style:normal;font-size:10.5px;line-height:17px;padding:0 6px;border-radius:5px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.lo-link{border:0;background:none;padding:2px 0;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.lo-link:hover{color:var(--dsw-alias-label-primary)}
.lo-danger:hover{color:var(--dsw-alias-state-error-primary)}
.lo-muted{color:var(--dsw-alias-label-secondary)}
.lo-empty{margin:6px 0 0;font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.lo-hint{margin:6px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-error{margin:8px 0 0;font-size:12px;color:var(--dsw-alias-state-error-primary)}
.lo-note{margin:0 0 6px;font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.lo-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
.lo-stat{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:11px}
.lo-stat-label{font-size:11px;color:var(--dsw-alias-label-secondary)}
.lo-stat b{font-size:15px;font-variant-numeric:tabular-nums}
.lo-month{margin:4px 0 10px}
.lo-weekdays,.lo-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.lo-weekday{font-size:11px;color:var(--dsw-alias-label-secondary);text-align:center;padding:4px 0}
.lo-week{margin-top:4px}
.lo-day{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:50px;padding:5px 3px;border:1px solid transparent;border-radius:11px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.lo-day:hover{background:var(--dsw-alias-bg-layer-2)}
.lo-day-num{font-size:13px;font-variant-numeric:tabular-nums}
.lo-day-outside .lo-day-num{color:var(--dsw-alias-label-secondary);opacity:.55}
.lo-day-holiday .lo-day-num{font-weight:600}
.lo-day-weekend .lo-day-num{color:var(--dsw-alias-label-secondary)}
.lo-day-makeup .lo-day-num{text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.lo-day-today{border-color:var(--dsw-alias-border-l2)}
.lo-day-selected{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.lo-day-mark{width:4px;height:4px;border-radius:50%;background:var(--lo-peach)}
.lo-day-mark-leave{background:var(--dsw-alias-brand-primary)}
.lo-day-marks{display:flex;align-items:center;justify-content:center;gap:3px;min-height:10px}
.lo-day-badge{font-size:8.5px;line-height:11px;padding:0 3px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.lo-day-badge-birthday{color:var(--lo-forest);background:var(--lo-sage)}
.lo-day-in-range{background:var(--dsw-alias-bg-layer-2)}
.lo-day-range-start,.lo-day-range-end{border-color:var(--dsw-alias-brand-primary)}
.lo-range-display{display:block;padding:3px 0 0;font-size:12.5px;color:var(--dsw-alias-label-primary)}
.lo-day:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.lo-legend{display:flex;flex-wrap:wrap;gap:14px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-legend span{display:inline-flex;align-items:center;gap:6px}
.lo-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.lo-dot-holiday{background:var(--lo-peach)}
.lo-dot-leave{background:var(--dsw-alias-brand-primary)}
.lo-dot-work{background:var(--dsw-alias-label-secondary)}
.lo-month-nav{display:flex;gap:12px;flex-wrap:wrap}
.lo-duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.lo-tile{display:flex;flex-direction:column;gap:4px;padding:18px 20px;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-base)}
.lo-tile-label{font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-tile-value{font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3}
.lo-tile-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.lo-meters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.lo-meter{display:flex;flex-direction:column;gap:6px}
.lo-meter-head{display:flex;justify-content:space-between;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-meter-head b{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.lo-pet{position:relative;display:flex;align-items:center;gap:18px;padding:20px 22px;border:1px solid var(--dsw-alias-border-l1);border-radius:18px;background:var(--dsw-alias-bg-base)}
.lo-pet-hit{position:relative;display:block;flex:none;padding:0;border:0;background:none;cursor:pointer;border-radius:18px}
.lo-pet-hit:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:4px}
.lo-pet-art{display:block;transition:transform .18s ease}
.lo-pet-hit:hover .lo-pet-art{transform:translateY(-2px) scale(1.04)}
.lo-mascot{filter:drop-shadow(0 6px 10px rgba(16,24,40,.12))}
.lo-arm{opacity:0;transform-box:fill-box;transform-origin:50% 6%}
.lo-cup{opacity:0;transform-box:fill-box;transform-origin:50% 50%}
.lo-mascot[data-action] .lo-arm{opacity:1}
.lo-mascot[data-action="coffee"] .lo-cup{opacity:1}
.lo-mascot[data-action="pat"]{animation:lo-body-sway .8s ease}
.lo-mascot[data-action="pat"] .lo-arm-right{animation:lo-arm-wave .8s ease}
.lo-mascot[data-action="feed"]{animation:lo-body-chew .8s ease}
.lo-mascot[data-action="feed"] .lo-arm-left,.lo-mascot[data-action="feed"] .lo-arm-right{animation:lo-arm-reach .8s ease}
.lo-mascot[data-action="play"]{animation:lo-body-hop .8s ease}
.lo-mascot[data-action="play"] .lo-arm-left{animation:lo-arm-up-left .8s ease}
.lo-mascot[data-action="play"] .lo-arm-right{animation:lo-arm-up-right .8s ease}
.lo-mascot[data-action="coffee"]{animation:lo-body-sip .9s ease}
.lo-mascot[data-action="coffee"] .lo-arm-right{animation:lo-arm-reach .9s ease}
.lo-mascot[data-action="coffee"] .lo-cup{animation:lo-cup-in .9s ease}
.lo-mascot[data-action="soothe"]{animation:lo-body-calm .9s ease}
.lo-mascot[data-action="soothe"] .lo-arm-left{animation:lo-arm-hug-left .9s ease}
.lo-mascot[data-action="soothe"] .lo-arm-right{animation:lo-arm-hug-right .9s ease}
@keyframes lo-body-sway{0%,100%{transform:rotate(0)}30%{transform:rotate(-3deg)}65%{transform:rotate(2deg)}}
@keyframes lo-body-chew{0%,100%{transform:scale(1)}35%{transform:scale(1.05,.95)}70%{transform:scale(.98,1.02)}}
@keyframes lo-body-hop{0%,100%{transform:translateY(0)}35%{transform:translateY(-5px)}60%{transform:translateY(1px)}}
@keyframes lo-body-sip{0%,100%{transform:rotate(0)}50%{transform:rotate(2.5deg) translateY(-1px)}}
@keyframes lo-body-calm{0%,100%{transform:scale(1)}50%{transform:scale(.96)}}
@keyframes lo-arm-wave{0%{opacity:0;transform:translateY(6px) rotate(0)}30%{opacity:1;transform:translateY(-2px) rotate(-18deg)}60%{transform:rotate(12deg)}100%{opacity:1;transform:rotate(0)}}
@keyframes lo-arm-reach{0%{opacity:0;transform:translateY(8px) scaleY(.6)}45%{opacity:1;transform:translateY(-3px) scaleY(1.1)}100%{opacity:1;transform:translateY(0) scaleY(1)}}
@keyframes lo-arm-up-left{0%{opacity:0;transform:rotate(0)}55%{opacity:1;transform:rotate(-42deg)}100%{opacity:1;transform:rotate(-18deg)}}
@keyframes lo-arm-up-right{0%{opacity:0;transform:rotate(0)}55%{opacity:1;transform:rotate(42deg)}100%{opacity:1;transform:rotate(18deg)}}
@keyframes lo-arm-hug-left{0%{opacity:0;transform:translateX(-4px) rotate(0)}100%{opacity:1;transform:translateX(4px) rotate(-16deg)}}
@keyframes lo-arm-hug-right{0%{opacity:0;transform:translateX(4px) rotate(0)}100%{opacity:1;transform:translateX(-4px) rotate(16deg)}}
@keyframes lo-cup-in{0%{opacity:0;transform:translateY(5px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes lo-pet-float{0%{opacity:0;transform:translate(-50%,6px)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-16px)}}
.lo-pet-xp{position:absolute;left:50%;top:-2px;transform:translateX(-50%);font-size:12px;font-weight:600;color:var(--lo-forest);pointer-events:none;animation:lo-pet-float .9s ease-out forwards}
@keyframes lo-pet-float{0%{opacity:0;transform:translate(-50%,6px)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-16px)}}
.lo-pet-message-active{color:var(--dsw-alias-label-primary)}
@media (prefers-reduced-motion: reduce){
.lo-mascot,.lo-mascot .lo-arm,.lo-mascot .lo-cup,.lo-pet-xp{animation:none !important}
}
.lo-pet-body{flex:1;min-width:0}
.lo-pet-name{margin:0;font-size:15px;font-weight:600}
.lo-pet-level{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-achievements{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.lo-achievement{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:11px;opacity:.55}
.lo-achievement-on{opacity:1}
.lo-achievement-dot{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l2);flex:none}
.lo-achievement-on .lo-achievement-dot{background:var(--lo-peach);border-color:var(--lo-peach)}
.lo-achievement-name{display:block;font-size:12.5px}
.lo-achievement-meta{display:block;font-size:11px;color:var(--dsw-alias-label-secondary)}
.lo-achievement-desc{display:block;margin-top:1px;font-size:10.5px;line-height:1.4;color:var(--dsw-alias-label-secondary)}
.lo-workdays{display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:12px}
.lo-goal{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.lo-goal:last-child{border-bottom:0}
.lo-goal-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.lo-goal-foot{display:flex;justify-content:flex-end;margin-top:4px}
.lo-range{width:100%;margin:8px 0 0;accent-color:var(--dsw-alias-brand-primary)}
.lo-capsule{padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.lo-capsule:last-child{border-bottom:0}
.lo-capsule-body{margin:8px 0 0;padding:12px 14px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);font-size:13px;white-space:pre-wrap}
.lo-plans{margin-top:12px}
.lo-plan{padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.lo-plan:last-child{border-bottom:0}
.lo-plan-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.lo-plan-title{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.lo-plan-badge{font-size:12px;color:var(--lo-forest);background:var(--lo-sage);padding:1px 8px;border-radius:6px}
.lo-plan-meta{margin-top:3px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.lo-plan-dates{margin-top:2px;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.lo-plan-warn{margin-top:2px;font-size:11.5px;color:var(--dsw-alias-state-warn-primary)}
.lo-nav{flex:none;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px 10px 10px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.lo-nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:44px;padding:5px 4px;border:0;border-radius:11px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer}
.lo-nav-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.lo-nav-item:hover{background:var(--dsw-alias-bg-layer-2)}
.lo-nav-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
@media (max-width:820px){
.lo-inner{padding:24px 18px 28px}
.lo-hero-row{grid-template-columns:minmax(0,1fr)}
.lo-duo{grid-template-columns:minmax(0,1fr)}
.lo-meters{grid-template-columns:minmax(0,1fr)}
.lo-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
.lo-achievements{grid-template-columns:minmax(0,1fr)}
.lo-hero{padding:20px}
.lo-pet{flex-wrap:wrap}
}
`

    /* ------------------------------------------------------------------ *
     * 14. Registration
     * ------------------------------------------------------------------ */

    function PanelGlyph({ size, active }) {
      const ink = 'currentColor'
      return h('svg', {
        width: size || 16, height: size || 16, viewBox: '0 0 24 24', 'aria-hidden': true,
        style: { display: 'block' },
      },
      h('circle', {
        cx: 12, cy: 12.2, r: 7.9,
        fill: active ? '#F5F0E6' : 'none',
        stroke: active ? 'none' : ink,
        strokeWidth: active ? 0 : 1.7,
      }),
      h('path', {
        d: 'M12 8.4v4.6l3 1.8',
        stroke: active ? '#354B43' : ink,
        strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none',
      }),
      h('path', {
        d: 'M4.6 20.8h14.8',
        stroke: active ? '#E8B88F' : ink,
        strokeWidth: 1.6, strokeLinecap: 'round', opacity: active ? 1 : 0.75,
      }))
    }

    return {
      inject: ['slots'],
      /** Pure helpers exposed for the regression script. */
      __internal: {
        defaultState, sanitize, migrateLegacy, parseISO, parseAnyDate, toISO, diffDays, addDays,
        breakdown, monthDay, retirementInfo, delayMonthsFor, addMonths, RETIRE_RULES,
        STORE_KEY, loadState, buildExport, parseImport, holidayPeriods, HOLIDAY_DATA, dayInfo, isRestDay, nextOccurrence,
        customCountdowns, lifeEntries, leaveDays, leaveWorkDays, leaveStats, dayMarks, planLeave,
        weatherKind, weatherLabel, isWeatherFresh, sameLocation, funScores, dailyQuote, QUOTES,
        petActionsFor, interactionBonus, workStatus, nextPayday,
        petLevel, petMood, monthGrid, ACHIEVEMENTS, withAchievements, hashString,
      },
      apply(ctx) {
        setLang(currentState.settings.lang)

        function Page() {
          return h(App)
        }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 40,
          label: () => 'DAYS',
        }, PanelGlyph))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
        }, Page))
      },
    }
  },
})
