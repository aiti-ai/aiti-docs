---
title: Qoder Session Backend (aiti-qoder-agent)
icon: ⚡
description: Qoder CLI-exclusive backend — dual-region credits/listModels, WASM-signed requests, extension APIs that query without opening a session
---

# aiti-qoder-agent

> ❝ **Others take the ACP highway; it insists on the signed single-plank bridge — because the scenery is on the other side.** ❞

Session backend exclusive to the Qoder CLI (qodercli/qoderclicn). Both are members of the claude-code protocol family, with a driving layer isomorphic to aiti-claude-code-agent; this extension exclusively owns the two qoder members and adds on top of them:

| Capability | Notes |
|---|---|
| `getUsage` | Account credits/quota — `{openapi}/api/v2/quota/usage` (Bearer dt-token) |
| `listModels` | Model catalog — infer gateway `/api/v2/model/list?Encode=1` (WASM-signed request) |
| Extension APIs | `GET /api/extensions/aiti-qoder-agent/{usage,models}` (no session needed) |

**Dual region**: variant distinguishes the domestic/international CLI and gateway pairs (intl=`qodercli`+api2-v2.qoder.sh; cn=`qoderclicn`+gateway.qoder.com.cn).

**steer probe gating**: the injection surface exists but is off by default — enabled only when `tools/steer-probe.mjs --record` passes for this binary (realpath normalization + version freshness check).

**Takeover/cold-restore replay**: tool calls in history are replayed into pi-native tool cards (same shape as live, no longer just `🛠 {json}` text lines) —
producer = session-manager claude-like adapter (`tool_use`/`tool_result` paired by id), consumer = `seedHistory`
via the shared layer `@aiti-ai/ext-shared/seed-tool`.


## 🔑 Controlled login (ext-controlled-login standard, 2026-09-08)

Toolbar **🔑 Login** (initiated via the aiti-agent-manager panel): spawns the official CLI's browserless login (`NO_BROWSER=true`, with the dual-region domains each on their own `qoder.com`/`qoder.com.cn` channel; the regex pins no domain and grabs `/device/selectAccounts`) — **just open it in a browser on any device to complete authorization**; credentials are persisted automatically by the official CLI, and the extension's existing credential chain picks it up automatically.

- API: `POST /api/extensions/aiti-qoder-agent/login/start` (idempotent) · `GET /login/status` · `POST /login/cancel`
- State machine: waiting (spinner) → success ✅ / failed / timeout / cancelled, all retryable; status is polled every 2s while the dialog is open and stops when it closes
