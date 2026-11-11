# Harness capabilities used by DAYS

Verification basis: installed desktop Harness (0.2.2-rc line), live `Slots`/`Theme` inspection, the shipped plugin-development skill, and the working local `zhiyong-orchestrator` bundle in the same profile.

## Verified and used

| 能力 | 用法 |
| --- | --- |
| Client module loader | `window.__ModuleLoader__.load({ id, factory(require) })`，React 来自模块表 |
| Slot `sidebar.panellist` | 注册 DAYS 图标，`label` 支持函数 |
| Slot `main` (keyed) | 注册 `key = 'days'` 的整页 |
| Client `slots` service | `ctx.slots.inject(key, () => ctx.slots.register(options, Component))` |
| Theme tokens | `--dsw-alias-bg-base / bg-layer-1 / bg-layer-2 / border-l1 / border-l2 / label-primary / label-secondary / brand-primary / state-error-primary / state-warn-primary` |
| Bundle + patch | `package.json` 的 `dsh.bundle.patch` + `cordis.patch.yml` 插入行 |
| Install | `plugin_manager install_bundle`，`application: applied` |

## Verified but deliberately not used

| 能力 | 原因 |
| --- | --- |
| `settings.section` slot | 本版本设置面板不呈现自定义分区，旧插件已移除 |
| `conversation.composer.dock` | 用户明确不需要常驻条 |
| `ctx.layout.selectPanel` | 侧边栏图标已能导航，无需额外调用 |

## Not verified → not implemented

| 能力 | 状态 |
| --- | --- |
| Host Tools（`ctx.tools` 注册、Schema、审批） | **未核验**。本轮 `cordis_inspect_query` 的对象参数在该会话中被字符串化（`input must be an object`），无法读取运行时契约；为避免编造 API，v1.0 不注册任何 Tool，见 [TOOL_REFERENCE.md](TOOL_REFERENCE.md) |
| Host 侧持久化服务 / 配置 schema | 未使用；数据在客户端 localStorage |
| 定时任务与通知 | 未使用；v1 不做后台提醒 |
| 设置页持久化（`ctx.remote.settings`） | 未使用；避免跨版本契约风险 |

## 版本兼容策略

- 只依赖稳定的 Slot 形状与主题 token；token 改名只会影响外观，不阻断渲染。
- 不 import 任何 Harness Client 包，组件与控件自绘。
- 页面高度自适应宿主面板，窄屏（<820px）自动单列。
