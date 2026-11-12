---
title: aiti-cursor-agent
icon: 🖥️
description: "Drives Cursor Agent CLI sessions (agentKey: cursor) — stream-json print mode + --resume multi-turn; Cursor IDE sessions parsed read-only"
---

# aiti-cursor-agent

The Cursor CLI session integration extension: brings Cursor Agent CLI sessions into unified All Sessions management.

- **Driving**: sessions launched in stream-json print mode, `--resume` continues multi-turn chats; model switching goes through the next turn's `-m` (shared `ext-model-state.ts` temporary model state file).
- **Capability surface**: prompt/abort/followUp/queueManage/setModel (next turn's `-m`) /listModels/setPermissionMode (`--mode plan|ask` + `--yolo` effective next turn) /getMessages ✅; steer/getUsage/contextUsage/fileAttachments ❌. CLI version baseline: cursor 2026.10.22 (the 3.17 findings are outdated; the format regression test sentinel lives in `session-manager/lib/agents/cursor-cli-store.test.mjs`).
- **Read-only parsing**: **Cursor Agent CLI sessions** go through the shared layer `cursor-cli-store.ts` (`~/.cursor/chats/<workspaceKey>/<chatId>/store.db` blob graph decoding preferred + jsonl fallback; fixtures pin the wire assumptions; single source of truth in the shared layer, with both the extension and session-manager importing `@aiti-ai/ext-shared/cursor-cli-store`); **Cursor IDE (state.vscdb) sessions are parsed separately by the session-manager cursor adapter** — the two chains are independent.


## 🔑 Controlled Login (ext-controlled-login standard, 2026-09-08)

Toolbar **🔑 Login** (initiated via the aiti-agent-manager panel): spawns the official CLI's browserless login (`cursor login` + `NO_OPEN_BROWSER=1`) — **just open it in a browser on any device to complete authorization**; credentials are persisted automatically by the official CLI, and the extension's existing credential chain picks them up automatically.

- API: `POST /api/extensions/aiti-cursor-agent/login/start` (idempotent) · `GET /login/status` · `POST /login/cancel`
- State machine: waiting (spinner) → success ✅ / failed / timeout / cancelled, all with retry; while the dialog is open, status is polled every 2s, stopping on close
