# Data model

Storage key: `lifeos/store` (JSON) — a stable historical key name, intentionally unchanged so existing browser data keeps loading. Legacy key `countdown/store/v1` is read once and never modified.

```ts
interface DAYSState {
  v: 1
  profile: {
    name: string
    birthDate: string        // YYYY-MM-DD, validated
    sex: '' | 'male' | 'female55' | 'female50'
    retireMode: 'auto' | 'manual'
    retireDate: string       // manual mode only
    flexMonths: -36 | -24 | -12 | 0 | 12 | 24 | 36
    careerStart: string
    workStart: string        // HH:MM
    workEnd: string
    workdays: number[]       // 1..7, ISO weekday, 7 = Sunday
    salaryDay: number | ''   // 1..28
    leaveQuota: number
    leaveCarry: number
    location: { name: string, latitude: number, longitude: number } | null
  }
  countdowns: { id, name, date, yearly }[]
  leaves: { id, type, name, start, end, countsAsLeave, half: 'none'|'am'|'pm', note }[]
  goals: { id, title, category, target, progress, done, note }[]
  capsules: { id, title, body, unlockDate, createdAt }[]
  pet: { xp, lastPet, actions: { date, pat, feed, play, coffee, soothe } }
  achievements: Record<string, string>   // id -> unlocked date
  stats: { plannerRuns, exports, visits }
  settings: { lang: 'zh'|'en', showHolidays: boolean, tab: 'home'|'calendar'|'fun'|'me' }
}
```

## 规则

- 所有日期是本地日历日（无时区偏移），比较用 UTC 毫秒差避免 DST。
- `sanitize()` 丢弃非法条目而不是抛错；未知字段不保留。
- 年假余额只在请假**结束之后**扣减：`used = Σ(workdays(已完成且 countsAsLeave 且开始年份匹配))`；`upcoming = Σ(未结束)`；`left = quota + carry - used`；`available = left - upcoming`。
- 年假按**工作日**扣减：周末与法定假期不计入；调休补班日算工作日。单日 `half` 为 `am`/`pm` 时按 0.5 天。记录的自然日天数仍用于展示。
- `half` 是 1.2.0 的增量字段，旧数据缺失时按 `none` 处理，不需要迁移。
- 请假 `days` 为闭区间天数；跨年请假按开始年份计入余额。
- 假期数据 `HOLIDAY_DATA[year] = [name, firstOffDay, lastOffDay, makeUpDays[]]`，只收录国务院已公布年份；未收录年份只按周末计算，并在 UI 中不伪造假期。
- 时间胶囊正文只存本地，锁定期间 UI 不渲染正文。

## Weather cache

- Separate key `days/weather-cache:v1`: `{ location, fetchedAt, data }`.
- TTL 30 minutes; coordinates must match the current profile location or the cache is ignored.
- Never part of the main state or the JSON export.

## Pet interactions

- `pet.actions.date` is the local day the counts belong to; a different date means the counts are treated as zero (no migration needed).
- Each interaction adds XP and one count. Index effects are capped per day: mood +4, coffee +2, slack +2, regardless of how many times the blob is petted.
- Counts are persisted with the main state, so they survive refresh and reset at midnight.

## 迁移

见 [MIGRATION_PLAN.md](MIGRATION_PLAN.md)。

## 导入/导出

`exportData()` 输出 `{ app:'DAYS', schema:1, exportedAt, data }`；`parseImport()` 同时接受 1.0 的旧导出与 `app:'DAYS'`，校验 schema/`data.v` 后整体替换并清洗。导入前建议先导出备份。
