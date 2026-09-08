---
title: Claude Code 会话后端（aiti-claude-code-agent）
icon: 🟠
ext:
  id: aiti-claude-code-agent
  name: Claude Code 会话后端
  description: "驱动 Claude Code CLI 会话 —— 从 All Sessions 恢复历史行（agentKey: claude）"
  soul: 历史会话不是化石——点一下就活过来。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
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

Claude Code CLI 会话后端：驱动 claude CLI 会话，从 All Sessions 恢复历史会话行（agentKey: claude）。claude-code 协议族驱动层与 qoder 后端同构。

## 机制

- **历史复活**：面板里的 CC 历史行（`claude:<sid>`）经 openExternalSession → spawn `claude -p --resume <sid>` 变成 live 会话
- **全新会话**：不带 `--resume` 启动，从 system/init 帧捕获真实 session_id 回写
- 协议：stdin/stdout JSON 帧（`{"type":"user","message":{...}}`，claude 2.x 实测）

> 待办：OpenAI↔Anthropic 协议代理（CC 模型目录受限时复用其他 provider）。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（或本面板）一键发起：后端 spawn 官方 CLI 的无浏览器登录（`claude.com` 通道），把授权链接推到本弹窗——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-claude-code-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- B 模式（paste-relay）：授权完成后页面显示一次性 code，复制粘回弹窗提交（也接受完整回调 URL）
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
- 标准与五家 driver 契约：`docs/ext-controlled-login-standard.md`
