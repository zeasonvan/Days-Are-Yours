# Release checklist — v1.1.0 (DAYS)

Date: 2026-11-11 · Bundle: `@local/days@1.5.0` · Installed: yes (`application: applied`); old `@local/lifeos` bundle removed, dangling link cleaned

## Functional

| 项 | 状态 | 依据 |
| --- | --- | --- |
| 退休倒计时 / 手动日期 / 弹性 | 通过 | 单元测试 + 逻辑走查 |
| 自定义倒计时（含每年重复、过期） | 通过 | 单元测试 |
| 法定假期与补班（2025–2027） | 通过 | 单元测试 + 数据核对 |
| 年假额度/结转/已用/剩余（工作日口径） | 通过 | 单元测试 |
| 请假记录增删、点选日期、半天 | 通过 | 单元测试 + 代码走查（编辑未实现，见下） |
| 拼假计算器三种排序 | 通过 | 专项测试（预算、边界、不变量） |
| 月历标记（假/班/假/薪/生） | 通过 | 单元测试（标记计算）+ 类覆盖检查 |
| 下班 / 发薪倒计时 | 通过 | 单元测试 |
| 团子互动 / 指数 / 成就 | 通过 | 单元测试 + 代码走查 |
| 天气（可选） | 通过 | 逻辑测试（编码映射/缓存）；网络由运行环境决定 |
| 愿望清单 / 时间胶囊 | 通过 | 代码走查 |
| 中英文切换 | 通过 | key 覆盖检查 |
| JSON 导出 / 导入 / 重置 | 通过 | 往返 + 非法文件测试；导入/重置二次确认 |
| 旧数据迁移 | 通过 | 迁移测试（只读旧 key） |
| 跨标签页同步 | 通过 | `storage` 事件（逻辑走查） |

## 数据与安全

- [x] 导入先校验后确认，失败不覆盖
- [x] 重置二次确认
- [x] 无网络请求（全文件无 fetch/XHR）
- [x] 无 console 输出用户数据
- [x] 无第三方依赖
- [x] 私人信件默认不上送模型（未注册任何 Tool）

## 构建与仓库

- [x] `node --check` 通过
- [x] `node tests/check.mjs` 106 条通过
- [x] CSS 类覆盖 / i18n key 覆盖检查
- [x] Git 提交、MIT LICENSE、README/README_EN、CHANGELOG、Issue/PR 模板、CI
- [ ] 真实页面截图（环境无 CDP/鉴权，未完成）
- [ ] 远程仓库与 Release（无 GitHub 授权，未执行）

## 已知限制

1. 请假记录只能新增/删除，不能原地编辑。
2. 拼假方案不能一键写入请假记录。
3. 2027 年假期数据随包提供，但最新一年仍需以国务院最终公告为准。
4. 未实现 Host Tools / AI 自然语言操作（契约未核验）。
5. 无后台提醒、图片附件、云同步。

## 发布步骤（待授权）

```bash
git remote add origin <your-repo-url>
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
# 在 GitHub 创建 Release，附本文件与 CHANGELOG 片段
```
