---
title: Agent 管理界面（aiti-agent-manager）
icon: 🤖
ext:
  id: aiti-agent-manager
  name: Agent 管理界面
  description: 统一聚合外部 agent 登录态 + 登录操作代理 + 多账号档（备份/别名/一键切换）+ 账号额度显示——不实现任何登录协议
  soul: 六家 agent 登录态，一屏看尽；多账号轮换，一键切换。
  type: dev-repo
  category: 多 agent 后端
  version: "0.2.8"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-agent-manager/ 后 reload
  license: MIT
  tags: [agent, manager, login, oauth, account, quota, credits, multi-agent]
---

# aiti-agent-manager

> ❝ **六家 agent 登录态，一屏看尽；多账号轮换，一键切换。** ❞

统一 Agent 管理面：工具条 🤖 打开面板，一屏聚合各家外部 agent 的登录态、账号档（多账号备份/切换/登出）与账号额度。
**不实现任何登录协议、不碰凭据内容**（转发既有 `/login/*`；账号档只做文件级快照，不解析 token）。

**动态发现（不写死六家）**：各家 agent 扩展在 startup `ctx.services.provide("<extId>.agent", descriptor)` 自报家门
（label/modes/fs 探测表/凭据槽位/登录动作/额度开关），manager 遍历宿主扩展清单动态收集。
接入契约（新 agent 清单 + 现状/待办）→ **`docs/dev-repo-agent-account-contract.md`**。

## 面板能力

| 能力 | 说明 |
|---|---|
| 登录态聚合 | 徽标 ✅/⚠/❓/🔄；CLI 账号（user/uin/有效期）；智能端点优先、fs 探测兜底 |
| 登录操作 | 行内「登录 / 取消 / 粘贴 code / API Key / 浏览器 OAuth」，代理到各家扩展既有端点 |
| **多账号档** | 「当前登录」行「保存为账号档…」弹窗起别名；已存档列表可**一键切换** / 删除；登录/切换/登出前自动存 `_auto-before-*` 保险档 |
| **账号额度** | 支持的 agent 在账号行显示额度 chip（点击强制刷新；tooltip 分包明细） |
| 登出 | 每个 agent 均可（清本机凭据文件；先自动保险） |

账号档存储：`<agent-mgr configDir>/agent-accounts.json`（单文件、0600；aiti-configs 备份时按 `**/agent-accounts.json` 加密）。

## 额度现状（2026-09-13）

| agent | 显示 | 数据源 |
|---|---|---|
| CodeBuddy | `额度 x / y credits` | 官方 usercenter billing（CLI OAuth） |
| Qoder | `额度 剩余 x credits`（+ 套餐/分包） | WASM 凭据 → OpenAPI quota/usage |
| Cursor | `额度 剩余 x%`（auto/api 分包） | Cursor Dashboard `GetCurrentPeriodUsage` |
| ZCode | `套餐：<通道> 可用` | 本地 coding-plan 缓存（无额度数值接口） |
| Claude / Codex | 登录后显示（已实现，待真机校准） | Anthropic OAuth usage / ChatGPT wham usage |

## 端点

- `GET /agents`（别名 `/login-status`）→ 聚合清单：`{agents:[{agent,label,modes,installed,authState,flowState,authSource,dependencyHint,ext?,tui?,accounts,hasContent,quota?}], piHost:[…]}`
- `POST /ctl/{agent}/start|cancel|submit` → 受控登录标准动作；非标准动作由各家 descriptor.actions 映射（如 codebuddy 的 `tui-*`/`set-key`）
- `GET /accounts` · `POST /accounts/{agent}/{save|switch|remove|logout} {alias?}` → 账号档
- `GET /quota/{agent}?force=1` → 额度代理（descriptor.accountQuota 声明的 agent 才可查）

跨扩展调用走宿主 registry 的进程内 `api()`，不做 HTTP 回环、不新增跨扩展全局。

## 边界

- fs 探测口径是「有凭据落盘/有 env」，不等价于「token 仍有效」——最终以各家 CLI 自身为准。
- 额度只对官方登录通道有效（API Key / 第三方网关档不适用，显示「不可用」）；额度接口需网络，失败自动退避 10s。
- 切换账号只影响之后新建/重建的会话；运行中的会话保持原账号。
- pi 宿主订阅 provider 只读并列（`piHost` 段：auth.json 字段，token 不出服务端）。
