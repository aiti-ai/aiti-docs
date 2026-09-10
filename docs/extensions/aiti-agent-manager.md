---
title: Agent 管理界面（aiti-agent-manager）
icon: 🤖
ext:
  id: aiti-agent-manager
  name: Agent 管理界面
  description: 统一聚合 6 家外部 agent（CodeBuddy/Claude/ZCode/Codex/Cursor/Qoder）登录态 + 登录操作代理——不实现任何登录协议
  soul: 六家 agent 登录态，一屏看尽。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-agent-manager/ 后 reload
  license: MIT
  tags: [agent, manager, login, oauth, codebuddy, claude, zcode, codex, cursor, qoder, multi-agent]
---

# aiti-agent-manager

> ❝ **六家 agent 登录态，一屏看尽。** ❞

统一 Agent 管理面（`docs/aiti-codebuddy-agent-plan.md` §9 · §9.5）：工具条 🤖 打开面板，一屏聚合 6 家外部 agent 的登录态，行内直接发起登录。**不实现任何登录协议、不碰凭据内容**——聚合只做 stat 级探测与既有 `/login/*` 端点转发（受控登录标准哲学）。

## 聚合口径

| agent | 登录形态 | 登录态来源 |
|---|---|---|
| CodeBuddy Code (腾讯) | API Key / 浏览器 OAuth（服务端 PTY） | 扩展智能端点（`/login/status` 的 ready/missing） |
| Claude Code | 粘贴 code（paste-relay） | fs 探测（`~/.claude/.credentials.json` / env token） |
| ZCode CLI (智谱) | 授权链接（url-only） | fs 探测（`~/.zcode/v2/credentials.json` / env key） |
| Codex CLI | 授权链接 | fs 探测（`~/.codex/auth.json` / env key） |
| Cursor Agent CLI | 授权链接 | fs 探测（`~/.cursor/agent-cli-state.json`） |
| Qoder CLI | 授权链接 | unknown（无公开凭据口径，fail-honest） |

徽标：✅ 已登录 / ⚠ 未登录 / ❓ 未知 / 🔄 登录中（任一扩展受控登录 `state:"waiting"`）。

## 端点

- `GET /api/extensions/aiti-agent-manager/agents`（别名 `/login-status`）→ 聚合清单：`{agent,label,modes,installed,authState,flowState,authSource,dependencyHint,ext?,tui?}`
- `POST /ctl/{agent}/start|cancel|submit` → 代理到受控登录标准 5 家的 `/login/*`
- `POST /ctl/codebuddy/tui-start {site?}` · `GET /ctl/codebuddy/tui-status` · `POST /ctl/codebuddy/tui-input {text}` · `POST /ctl/codebuddy/tui-cancel` · `POST /ctl/codebuddy/set-key {apiKey?,authToken?,baseUrl?}` · `POST /ctl/codebuddy/clear`

跨扩展调用走宿主 registry 的进程内 `api()`（session-manager callProvider 同款），不做 HTTP 回环、不新增跨扩展全局。

## 边界

- 5 家受控登录扩展无「登出」标准端点——面板不提供其登出（codebuddy 有：清除凭据文件）。
- fs 探测口径是「有凭据落盘/有 env」，不等价于「token 仍有效」——最终以各家 CLI 自身为准。
- pi 宿主订阅 provider 状态（模型向导 OAuth）的并列展示为可选后续项（§9.5 步 5）。
