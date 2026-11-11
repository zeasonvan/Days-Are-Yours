# Technical audit — countdown plugin (pre-LifeOS)

Date: 2026-11-11 · Target: `default-workspace/countdown` (backed up to `_archive/countdown-20261111-085156`)

## Snapshot

| 项 | 值 |
| --- | --- |
| 客户端 | `client.js`，1193 行，单文件，无构建 |
| Host | `index.js`，8 行，`apply()` 空实现 |
| 依赖 | 无（仅浏览器模块表里的 React） |
| 存储 | `localStorage` key `countdown/store/v1` |
| 测试 | 独立目录 `countdown-check/check.mjs`，约 40 条断言，不在包内 |
| 版本控制 | 无 Git 仓库 |
| 许可 | 无 LICENSE |
| 注册 | `sidebar.panellist` + `main`（key `countdown`） |

## 可用功能（已验证）

1. 退休倒计时：中国渐进式延迟退休规则（男 60→63、女管理 55→58、女工人 50→55）、弹性 ±3 年、手动日期兼容。
2. 假期：2025–2027 国务院放假区间 + 调休补班日，下一个假期 spotlight，全年列表。
3. 自定义放假：名称、起止、每年重复。
4. 中文优先界面、语言开关、日期本地化与容错输入。
5. 数据：localStorage、旧字段兼容、语言持久化。

## 已发现的缺陷

| 级别 | 缺陷 | 处理 |
| --- | --- | --- |
| 高 | 日期上限判断方向写反（`diffDays(max, parsed) < 0`），所有过去的生日都被拒绝 | 重写为 `isAllowedDate`，LifeOS 用同样的方向并测试 |
| 中 | 原生 `<input type="date">` 跟随浏览器 en-US，显示 `MM/DD/YYYY` | 改用本地化文本日期框 |
| 中 | 曾注册 `settings.section`，但该 Harness 版本的设置面板不呈现自定义分区 | 移除，改为面板内设置 |
| 中 | 曾注册 `conversation.composer.dock` 常驻条 | 按用户要求移除 |
| 低 | 单文件 1193 行，业务/渲染/样式混杂 | LifeOS 拆分区并抽核心函数 |
| 低 | 无测试、无 CI、无 LICENSE | LifeOS 补齐 |

## 风险

- **数据耦合**：旧 key 与新 key 独立，迁移只读，不会破坏旧数据。
- **假期数据时效**：国务院每年 11 月前后公布次年安排，`HOLIDAY_DATA` 需要年度更新；超出年份回退为节日当天。
- **无 AI 工具**：原插件没有注册任何 Tool，Host 仅空 `apply()`。

## 结论

代码可读性尚可、核心算法经过多轮真实修复，但单文件结构、零测试、零许可不适合作为长期开源项目。见 [REFACTOR_DECISION.md](REFACTOR_DECISION.md)。
