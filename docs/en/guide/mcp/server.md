---
title: MCP Server
icon: 🖥️
description: Startup, endpoints, transports (incl. Streamable HTTP), MCP tool reference (incl. aiti_inbox)
tags: [guide, aiti-bridge, server, reference]
---

# MCP server (built into aiti-bridge)

MCP endpoints: three transports — **stdio + HTTP (stateless) + Streamable HTTP (persistent stream)**; the bridge side additionally exposes REST endpoints for session registration/routing/broadcast.

## Startup

```bash
# Bridge (local service: session registration/routing/broadcast + MCP endpoint)
npx @aiti-ai/aiti-bridge --port 8777

# MCP client access
npx @aiti-ai/aiti-bridge --register-shim   # one-shot stdio shim registration (`aiti` entry, connects via AITI_BRIDGE_URL; no URL in config)
# or hit HTTP directly: http://127.0.0.1:8777/aiti/mcp/mcp
```

## Transports

| Transport | Endpoint | Description |
|---|---|---|
| stdio | child process | Local MCP client (Claude Code / Cursor) |
| HTTP (stateless) | `POST /mcp/mcp` | Immediate JSON-RPC response; no session, compatible with legacy clients |
| **Streamable HTTP** | `GET /mcp/mcp` + `POST /mcp/mcp` | **Persistent GET stream + `Mcp-Session-Id`**: the server can proactively write messages (sampling requests/progress); modern clients such as pi auto-probe it first |

### Streamable HTTP protocol essentials

1. `POST /mcp/mcp` sends `initialize` → returns the result plus the **`Mcp-Session-Id` response header** (a new session is created).
2. `POST /mcp/mcp` (with the `Mcp-Session-Id` header) sends `notifications/initialized` / `tools/call` etc. → immediate response (204 for notifications).
3. `GET /mcp/mcp` (`Accept: text/event-stream` + `Mcp-Session-Id`) → persistent SSE stream; the server writes server→client messages into it (ping every 15s as keepalive).
4. POST without `Mcp-Session-Id` = stateless (legacy client compatibility).
5. GET stream disconnects → session destroyed, agent marked offline (registration info + outbox kept for a TTL).

## Bridge endpoints

| Endpoint | Description |
|---|---|
| `POST /bridge/claim` | Connection registration/reuse (instanceId + secret + pageKey) |
| `GET /bridge/sessions` | Discovery: expanded per frame as `[{instanceId, frameId, pageId, url, frameworks, active, lastSeen}]` |
| `POST /bridge/register` | iframe dynamically reports additional frameIds |
| `GET /bridge/sse?instanceId=&role=page\|ai&frameId=&url=&frameworks=` | Persistent connection (SSE; role=page for pages / role=ai for the human-side window) |
| `POST /bridge/result` | `{pageId, requestId, ok, result}` (pageId validation + global pendingRequests) |
| `POST /bridge/event` | `{pageId, type, payload}` (page events such as open_file) |
| `POST /bridge/push` | **Human → AI proactive message**: `{to?: agentId\|"all", text, kind?, ref?}` → capability-based fallback (sampling push / inbox enqueue) |
| `GET /bridge/inbox-status` | Message consumption status (pending/delivered/consumed), for window display |
| `GET /bridge/messages` | Message history (sliding window + pagination, replayed from JSONL) |
| `POST /mcp/mcp` / `GET /mcp/mcp` | MCP JSON-RPC (tools/list / tools/call; Streamable HTTP) |

## MCP tools

### page_* (page operations)

| Tool | Parameters | Description |
|---|---|---|
| `page_exec` | `{pageId, cmd, args}` | Execute CDP-like commands (see [command set](/en/devtools/cdp-commands.md)) |
| `page_snapshot` | `{pageId?}` | Page snapshot: DOM outline + viewport + framework detection |
| `bridge_status` | — | Bridge status, active connections, list of operable pageIds, **list of connected agents** |
| `page_logs` / `page_network` | `{pageId, level/since/limit}` | Page console logs / completed request records (server-side ring buffer, queryable even after disconnect) |
| `self_ui` | `{pageId?}` | Scan the dialogs/form fields/buttons currently open on the target page (dialog title + field label/selector/type); pair with `form_fill` to locate and fill |
| `form_fill` | `{pageId?, dialog?, fields, button?}` | Fill field values back into the target page's dialogs/forms (React-compatible native setter + input/change events); optionally click a button after filling |
| `file_stat` | `{path}` | Query file existence/type/size/modification time (absolute path; for locating source code and as a pre-check before "open in backend") |

### user_* (human interaction)

| Tool | Parameters | Where the user answers |
|---|---|---|
| `user_pick_element` | `{pageId, prompt}` | On the page (pick panel + Inspector) |
| `user_confirm` | `{pageId, prompt, async?}` | AI window / host panel answer card (yes/no/extra note) |
| `user_choose` | `{pageId, prompt, choices, multiple?}` | AI window answer card (single/multi-select) |
| `user_input` | `{pageId, prompt, defaultValue?}` | AI window answer card (text) |
| `user_presence` | `{pageId, prompt?}` | AI window answer card (present/away) |
| `user_notify` | `{pageId, body, title?}` | Browser Notification (non-blocking) |

Unified semantics: sync/async (`async:true` returns immediately, the result goes into `aiti_inbox`); controllable timeout (frontend countdown + synchronized server-side pause); rejection carries semantics (presets + custom reason).

### aiti_* (agent onboarding and main message channel)

| Tool | Parameters | Description |
|---|---|---|
| `aiti_hello` | `{agentId?, pageId?, subEvents?}` | Agent self-introduction + bind the default target page + subscribe to page events (page_error/page_log/page_network) |
| `aiti_inbox` | `{ack?: [msgId]}` | **Main message channel**: pull messages addressed to this agent (human messages / async answers / page events), acknowledge with ack after processing |

**aiti_inbox return**:
```jsonc
{ "messages": [
    { "id": "ab12cd34", "kind": "user_message" | "user_answer" | "page_error" | "page_log" | "page_network" | "agent_note",
      "from": "window" | "page", "agentId", "text?", "payload?",
      "at": "ISO", "status": "pending" | "delivered" | "consumed" } ],
  "queueSize": 3 }
```
- State machine: `pending` (queued, not yet taken) → `delivered` (taken, not yet acked) → `consumed` (acknowledged)
- **consumed entries are kept forever** (history persisted, see below), shown in the window's sliding window

### Message session storage (pi-session-style JSONL)

```
<bridge dataDir>/aiti-bridge/sessions/<agentId>/<ISO-timestamp>_<uuid>.jsonl
```
- One event per line (append-only event stream): a `session` metadata first line + `message` lines + `status_change` status lines
- Rolls over by (agentId, day); a new file is opened past 2MB; the bridge replays from JSONL on restart (pending/delivered restored to pending)

## Configuration and environment variables

| Variable | Default | Description |
|---|---|---|
| `AITI_OPEN_CMD` | `code --goto file:line` | Editor command for open_file (fallback xdg-open) |
| `AITI_BRIDGE_TTL` | `600000` | Registration retention after disconnect (ms) |
| `--port` / `AITI_BRIDGE_PORT` | `8777` | Bridge listening port (also `AITI_BRIDGE_HOST` / `AITI_BRIDGE_DATA_DIR`) |

## Security

- token/secret authentication: validated on SSE / result / event
- Compatibility path: requests without a secret (legacy clients / dev token) are allowed through
- Dangerous-command confirmation + gesture bridge (see [security boundary](/en/products/aiti-devtools.md#_3-security-boundaries))
- **MCP endpoint authentication (TODO)**: a publicly exposed bridge has no standalone authentication — plan is to adapt service-tunnels (reworked so auth and token co-exist, with token as an extra switch); currently limited to intranet/tunnel use
- Page event subscriptions are not delivered by default (pushed only on explicit subscription, to avoid framework error noise)
