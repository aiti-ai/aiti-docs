---
title: Claude Code session backend (aiti-claude-code-agent)
icon: 🟠
description: "Drives Claude Code CLI sessions — restores history rows from All Sessions (agentKey: claude); claude 2.1.318+ keyring credentials with a three-tier login-state adjudication"
---

# aiti-claude-code-agent

> ❝ **Historical sessions are not fossils — one click brings them back to life.** ❞

Claude Code CLI session backend: drives claude CLI sessions and restores historical session rows from All Sessions (agentKey: claude). The claude-code protocol family drives through an isomorphic layer (the qoder/qoder-cn members have been handed over to the dedicated extension aiti-qoder-agent — double registration under the same agentKey would show duplicate backends in the UI; only claude-code remains in FAMILY).

## Mechanism

- **History revival**: CC history rows in the panel (`claude:<sid>`) go through openExternalSession → spawn `claude -p --resume <sid>` to become live sessions
- **Brand-new sessions**: started without `--resume`; the real session_id is captured from the system/init frame and written back
- Protocol: stdin/stdout JSON frames (`{"type":"user","message":{...}}`, verified on claude 2.x)
- **Capability surface**: prompt/abort/followUp (local queue)/queueManage/respondPermission/getUsage/listModels/fileAttachments/setModel (control_request `set_model`)/contextUsage/getMessages/listTools/getCommands ✅; setPermissionMode for the claude-code member only ✅; steer/fork ❌

## Login state and credentials (claude 2.1.318+)

OAuth credentials have moved out of `~/.claude/.credentials.json` (system keyring, path not statable) — the agent-manager panel's login state is adjudicated in **three tiers** by this extension's `GET /login/status`: credentials file → env token (`CLAUDE_CODE_OAUTH_TOKEN`/`ANTHROPIC_AUTH_TOKEN`/`ANTHROPIC_API_KEY`) → `claude auth status` (the CLI as the only trusted source; 60s cache prevents the manager scan from amplifying spawns). The usage panel needs a readable token: in the keyring state it degrades with `available:false` and hints "run `claude setup-token` once — it self-heals after the export".

## 🔑 Controlled login (ext-controlled-login standard, 2026-09-08)

Toolbar **🔑 Login** (initiated via the aiti-agent-manager panel; the controlled-login dialog has been retired, while the server-side /login/* and the .agent descriptor are kept): spawns the official CLI's browser-free login (`claude auth login`, paste-relay B mode) — **complete the authorization in the browser of any device**; credentials are persisted automatically by the official CLI and the extension's existing credential chain picks them up automatically.

- API: `POST /api/extensions/aiti-claude-code-agent/login/start` (idempotent) · `GET /login/status` · `POST /login/cancel`
- B mode (paste-relay): after authorization completes the page shows a one-time code; copy and paste it back into the dialog to submit (a full callback URL is also accepted)
- State machine: waiting (spinner) → success ✅ / failed / timeout / cancelled, all with retry; while the dialog is open the status polls every 2s and stops the moment it closes
