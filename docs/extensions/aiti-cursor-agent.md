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
  version: "0.1.7"
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
- **能力面**：prompt/abort/followUp/queueManage/setModel（下轮 `-m`）/listModels/setPermissionMode（`--mode plan|ask` + `--yolo` 下轮生效）/getMessages ✅；steer/getUsage/contextUsage/fileAttachments ❌。CLI 版本基线 cursor 2026.10.22（3.17 实测口径已过；格式回归测试哨兵在 `session-manager/lib/agents/cursor-cli-store.test.mjs`）。
- **只读解析**：**Cursor Agent CLI 会话**经共享层 `cursor-cli-store.ts`（`~/.cursor/chats/<workspaceKey>/<chatId>/store.db` blob 图解码优先 + jsonl 兜底；fixture 钉死 wire 假设；单一事实源 `dev-repo/_shared/`，扩展与 session-manager 同走 `@aiti-ai/ext-shared/cursor-cli-store`）；**Cursor IDE（state.vscdb）会话由 session-manager cursor adapter 另路解析**——两条链路分立。

设计文档：`dev-repo/docs/aiti-cursor-cli-sessions.md`（存储格式逆向 + 排障对照表）。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（经 aiti-agent-manager 面板发起）：spawn 官方 CLI 的无浏览器登录（`cursor login` + `NO_OPEN_BROWSER=1`）——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-cursor-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
- 标准与五家 driver 契约：`docs/ext-controlled-login-standard.md`
