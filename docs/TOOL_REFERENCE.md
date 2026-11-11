# Tool reference (agent-facing)

## Status: no tools registered in v1.0

LifeOS v1.0 没有任何 Host Tool。原因不是设计缺失，而是**契约未核验**：

- 本轮会话里 `cordis_inspect_query` 的对象型 `input` 被序列化成字符串，Host/Client 两端都返回 `"input" must be an object`，无法读取 `ctx.tools` 的运行时方法签名。
- 仓库内 `@deepseek-ai/dsh-tools` 的类型产物在该桌面构建中不可读（`lib/types/index.d.ts` 不存在）。
- 项目规则要求「不得编造接口、工具名或配置项」，因此不实现猜测的 API。

## 计划中的工具（需在可运行 Harness 上核验后实现）

| Tool | 作用 | 确定性 |
| --- | --- | --- |
| `lifeos_overview` | 退休/假期/请假/目标概览 | 是 |
| `lifeos_retirement` | 退休日期与剩余天数（读 profile，不写） | 是 |
| `lifeos_holidays` | 指定年份的假期区间与补班日 | 是 |
| `lifeos_leave_balance` | 年假额度/已用/剩余 | 是 |
| `lifeos_plan_leave` | 拼假方案（预算、窗口、排序） | 是 |
| `lifeos_create_countdown` | 新建自定义倒计时 | 写，需确认 |
| `lifeos_create_leave` | 新建请假记录 | 写，需确认 |
| `lifeos_goals` | 愿望清单读取/更新进度 | 读 + 写 |
| `lifeos_summary` | 年度统计（确定性聚合） | 是 |

## 实现门槛

1. 在运行中的 Harness 上读到 tools 注册方法、参数 Schema 与返回值约定。
2. 工具只调用本文档列出的确定性函数，不自行推算日期。
3. 写操作返回真实执行结果；失败返回错误，不假装成功。
4. 删除、批量修改、修改退休日期/年假额度需二次确认。
5. 工具读取范围最小化，私人信件正文默认不提供给模型。

在此之前，用户仍可完全通过面板使用全部功能。
