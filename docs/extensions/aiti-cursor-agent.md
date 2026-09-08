---
title: aiti-cursor-agent
icon: 🖥️
ext:
  id: aiti-cursor-agent
  name: Cursor CLI 会话接入
  description: "驱动 Cursor Agent CLI 会话（agentKey: cursor）——stream-json print 模式 + --resume 多轮；Cursor IDE 会话只读解析"
  soul: Cursor 的会话，也进 All Sessions。
  type: dev-repo
  category: 会话管理
  version: 0.1.0
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [cursor, agent, sessions, cli]
---

# aiti-cursor-agent

Cursor CLI 会话接入扩展：把 Cursor Agent CLI 会话纳入 All Sessions 统一管理。

- **驱动**：stream-json print 模式起会话，`--resume` 续聊多轮；模型切换走下轮 `-m`（共享 `dev-repo/_shared/ext-model-state.ts` 临时模型状态文件）。
- **只读解析**：Cursor IDE（vscdb）会话经 `cursor-cli-store.ts` 读取器解析（store.db blob 图 + jsonl 兜底；fixture 测试钉死 wire 假设）。权威读取器在 `dev-repo/_shared/`，本扩展与 session-manager 各持同步副本。
- **依赖**：历史解析消费 `session-manager.sessions` 服务（fallback 内置副本）。

设计文档：`dev-repo/docs/aiti-cursor-cli-sessions.md`（存储格式逆向 + 排障对照表）。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（或本面板）一键发起：后端 spawn 官方 CLI 的无浏览器登录（`cursor.com` 通道），把授权链接推到本弹窗——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-cursor-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
- 标准与五家 driver 契约：`docs/ext-controlled-login-standard.md`
