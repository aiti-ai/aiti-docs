---
title: Claude Code 会话后端（aiti-claude-code-agent）
icon: 🟠
ext:
  id: aiti-claude-code-agent
  name: Claude Code 会话后端
  description: "驱动 Claude Code CLI 会话 —— 从 All Sessions 恢复历史行（agentKey: claude）；claude 2.1.318+ keyring 凭据三级裁决登录态"
  soul: 历史会话不是化石——点一下就活过来。
  type: aiti-ext
  category: 多 agent 后端
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-claude-code-agent/ 后 reload
  license: MIT
  tags: [claude-code, cli, session, multi-agent]
---

# aiti-claude-code-agent

> ❝ **历史会话不是化石——点一下就活过来。** ❞

Claude Code CLI 会话后端：驱动 claude CLI 会话，从 All Sessions 恢复历史会话行（agentKey: claude）。claude-code 协议族驱动层同构（qoder/qoder-cn 成员已移交专属扩展 aiti-qoder-agent——同 agentKey 双注册会在 UI 出现重复后端，FAMILY 仅剩 claude-code）。

## 机制

- **历史复活**：面板里的 CC 历史行（`claude:<sid>`）经 openExternalSession → spawn `claude -p --resume <sid>` 变成 live 会话
- **全新会话**：不带 `--resume` 启动，从 system/init 帧捕获真实 session_id 回写
- 协议：stdin/stdout JSON 帧（`{"type":"user","message":{...}}`，claude 2.x 实测）
- **能力面**：prompt/abort/followUp（本地队列）/queueManage/respondPermission/getUsage/listModels/fileAttachments/setModel（control_request `set_model`）/contextUsage/getMessages/listTools/getCommands ✅；setPermissionMode 仅 claude-code 成员 ✅；steer/fork ❌

## 登录态与凭据（claude 2.1.318+）

OAuth 凭据已迁出 `~/.claude/.credentials.json`（系统 keyring，路径不可 stat）——agent-manager 面板登录态由本扩展 `GET /login/status` **三级裁决**：凭据文件 → env token（`CLAUDE_CODE_OAUTH_TOKEN`/`ANTHROPIC_AUTH_TOKEN`/`ANTHROPIC_API_KEY`）→ `claude auth status`（CLI 唯一可信源；60s 缓存防 manager 扫描放大 spawn）。额度面板需可读 token：keyring 态 `available:false` 降级并提示「跑一次 `claude setup-token` 导出后自愈」。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（经 aiti-agent-manager 面板发起；受控登录弹窗已退役，服务端 /login/* 与 .agent 描述符保留）：spawn 官方 CLI 的无浏览器登录（`claude auth login`，paste-relay B 模式）——**在任意设备的浏览器完成授权**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-claude-code-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- B 模式（paste-relay）：授权完成后页面显示一次性 code，复制粘回弹窗提交（也接受完整回调 URL）
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
