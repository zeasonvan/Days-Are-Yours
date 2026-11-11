# DAYS — Days Are Yours

**Make Every Day Count.**

![DAYS](assets/banner.svg)

DAYS（中文：每一天，都属于你）是一个运行在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 里的个人生活时间助手：退休倒计时、法定假期、请假与拼假、月历、下班/发薪倒计时、每日小乐趣、愿望清单和时间胶囊，收在同一个侧边栏面板里。

仓库名：**Days-Are-Yours** · 插件包：`@local/days` · 版本：1.1.0

> 数据默认只保存在本机浏览器（`localStorage`），不上传服务器，不需要登录，也不需要 API Key。

## 功能（v1.1）

| 模块 | 已实现 |
| --- | --- |
| 人生时钟 | 退休倒计时（中国渐进式延迟退休规则，可选手动日期/弹性提前延迟）、职业生涯进度条、自定义倒计时（含每年重复） |
| 假期中心 | 2025–2027 国务院放假安排（含调休补班日）、下一个假期、全年假期列表、年假额度/结转/已用/剩余（按工作日扣减）、请假记录、拼假计算器（最长/最省/收益最高三种排序） |
| 生活日历 | 月视图（周一起始）、假期/补班/请假标记、选中日期详情、全年假期与补班 |
| 快乐研究所 | 下班倒计时、发薪日倒计时、摸鱼/咖啡/心情指数（纯娱乐）、每日语录、时光团子（经验与等级）、8 个成就 |
| 我的 | 出生信息与退休设置、工作时间与工作日、发薪日、年假额度、愿望清单（进度）、时间胶囊（到期解锁）、语言切换、JSON 导出/导入/重置 |
| 数据 | 本地优先、版本化存储、从旧 `countdown` 插件自动迁移、导入校验、可回退 |

## 安装

DAYS 以本地 bundle 的形式安装到当前 DSH profile：

```bash
# 在本仓库目录的上级执行，或在 DSH 会话里让 agent 调用 plugin_manager
plugin_manager install_bundle target=/absolute/path/to/days
```

安装后刷新 Harness 窗口（⌘R），侧边栏出现 DAYS 图标，点击即可打开。

> 品牌从 LifeOS 更名为 DAYS 时，**本地存储 key `lifeos/store` 故意保持不变**，升级不会丢数据；旧版导出的 JSON 也仍然可以导入。

## 使用

- 首次打开是空状态，去「我的」填写出生日期与性别，退休倒计时立刻出现；也可以切到「手动指定退休日期」。
- 「日历」里添加年假与请假记录，年假余额按记录自动计算；拼假计算器用真实假期 + 调休工作日 + 周末推算。
- 「趣味」里点一下时光团子会加经验，不签到、不掉经验。
- 「我的 → 数据」可以导出 JSON 备份，或导入恢复。

## 数据与隐私

- 生日、退休日期、请假、愿望、信件只保存在这台设备的浏览器里。
- 没有网络请求；不包含任何遥测。
- 详见 [PRIVACY.md](PRIVACY.md)。

## 架构

```
client.js            # 单文件客户端（DSH 模块加载器格式），按 14 个分区组织
index.js             # Host 半边：v1.0 无注册
tests/check.mjs      # 确定性核心回归（109 条断言）
docs/                # 审计、架构、数据模型、设计系统、Harness 集成
```

- 纯 JavaScript、无构建步骤、无依赖。
- 所有日期计算由确定性代码完成，AI 不参与推算（见 [docs/TOOL_REFERENCE.md](docs/TOOL_REFERENCE.md)）。
- 假期数据捆绑在 `client.js` 的 `HOLIDAY_DATA`，来源与更新方式见 [docs/DATA_MODEL.md](docs/DATA_MODEL.md)。

## 测试

```bash
node tests/check.mjs
```

覆盖：日期解析与边界、退休政策分档、假期区间与调休、请假余额、拼假算法、工作状态、发薪日、每日趣味、宠物等级、月历网格、旧数据迁移、导入导出往返与校验、存储清洗、成就解锁（109 条）。

## 截图

本轮开发环境无法对运行中的 Harness 页面截图（页面需要鉴权 token，且没有可用的 CDP 通道），因此仓库**暂不放截图**，也不使用概念图代替真实界面。拿到可用截图后会补上。

## Roadmap

见 [docs/ROADMAP.md](docs/ROADMAP.md)。V1.1 计划接 DSH Tools 实现自然语言操作；工具契约需要在可运行的 Harness 上核验后再实现，当前未注册任何工具。

## License

[MIT](LICENSE)
