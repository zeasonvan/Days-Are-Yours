# Migration plan

## 数据映射（`countdown/store/v1` → `lifeos/store`）

| 旧字段 | 新字段 | 规则 |
| --- | --- | --- |
| `birthDate` | `profile.birthDate` | 合法 ISO 才保留 |
| `sex` | `profile.sex` | 仅 `male/female55/female50` |
| `flexMonths` | `profile.flexMonths` | 仅 -36/-24/-12/0/12/24/36 |
| `careerStart` | `profile.careerStart` | 合法 ISO 才保留 |
| `retireDate` | `profile.retireMode='manual'` + `retireDate` | 旧手动日期保留 |
| `lang` | `settings.lang` | `en` 否则 `zh` |
| `showBuiltin` | `settings.showHolidays` | 默认 true |
| `customs[]` | `leaves[]` | `type='custom'`，`countsAsLeave=false` |

## 规则

1. 只在 `lifeos/store` 不存在时迁移一次；迁移后不再读取旧 key。
2. 旧 key 原样保留，旧插件重新启用后可继续使用。
3. 迁移后的数据立即通过 `sanitize()` 清洗，非法条目丢弃而不是崩溃。
4. 导入 JSON 时校验 `app === 'LifeOS'`、`schema === 1`、`data.v === 1`。

## 回退

1. 停用 LifeOS bundle，启用 `@local/countdown`。
2. 旧数据从未被改写，直接恢复。
3. 若用户在 LifeOS 中新增了数据，先导出 JSON 留存。
