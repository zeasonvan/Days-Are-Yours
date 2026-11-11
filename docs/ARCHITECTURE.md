# Architecture

```
DSH Client (browser)
└── @local/days (client.js, 14 sections)
    ├── 1  copy/i18n            COPY + t(key, params)
    ├── 2  dates                parse/format/diff/addMonths/breakdown
    ├── 3  retirement policy    RETIRE_RULES + retirementInfo(profile)
    ├── 4  holiday engine       HOLIDAY_DATA + dayInfo + holidayPeriods
    ├── 5  store                defaultState/sanitize/migrate/load/commit
    ├── 6  engines              countdowns, leaveStats, planLeave,
    │                           workStatus, nextPayday, dailyFun, monthGrid
    ├── 7  UI primitives        Card/Field/Input/Select/DateField/Mascot
    ├── 8  Home                 hero + next holiday + quick stats + quote
    ├── 9  Calendar+Leave       month grid, year list, leave, planner
    ├── 10 Fun Lab              work/pay, meters, pet, achievements
    ├── 11 Me                   profile, schedule, goals, capsules, data
    ├── 12 Shell                header, tabs, nav
    ├── 13 Styles               token-based CSS string
    └── 14 Registration         sidebar icon + main panel
```

## 分层

- **Core（纯函数）**：`retirementInfo`、`dayInfo`、`holidayPeriods`、`planLeave`、`leaveStats`、`workStatus`、`nextPayday`、`monthGrid`、`sanitize`、`migrateLegacy`。不依赖 React，可被 `tests/check.mjs` 直接调用。
- **Store**：单一 `currentState` + 订阅；所有写入走 `commit()`，`withAchievements()` 在提交前评估成就。
- **Views**：函数组件，不直接写 localStorage；通过 `patch/patchProfile/patchSettings` 提交。
- **Host**：v1.0 为空，不注册工具、不读用户数据。

## 设计约束

1. 页面只注册到 `sidebar.panellist` 与 `main`，不改动宿主其他区域。
2. 不 import 宿主 Client 包；控件自绘。
3. 表面与文字只用 `--dsw-alias-*` token，品牌色只用于装饰（团子、进度、标记点）。
4. 所有日期计算确定，AI 不参与；模型不可用时产品完整可用。
5. 单文件即可安装（无构建步骤），但内部按模块分区并导出纯函数供测试。

## 为什么不是多包 monorepo

DSH Client 插件以单个 `client.js` 交给模块加载器，没有 ESM import 或打包器保证。拆成多个包需要构建步骤与额外依赖，收益小于风险；当前以「单文件 + 纯函数导出 + 独立测试」换取可测试性与零构建。
