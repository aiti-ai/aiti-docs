---
title: aiti-bridge
icon: 🔗
description: Configures aiti-devtools usage, enables AI agents, delivers messages straight into the IDE AI agent window
tags: [product, aiti-bridge, mcp, ai-agent]
---

# aiti-bridge — the AI Agent Enablement Layer

> **In one sentence**: the MCP bridge turns "page debugging capability" into **tools for any AI agent** — it configures aiti-devtools usage; enables AI agents; supports aiti-devtools, aiti-devtools-vscode/idea and other plugins to complete injection; and **delivers messages directly to the AI agent window inside the IDE via aiti-bridge**.

## 1. Product Composition

| Package | Form | Responsibility |
|---|---|---|
| `@aiti-ai/aiti-bridge` | Local bridge service (CLI) | Bridge address/pageId configuration, session registration & routing, event broadcasting, IDE AI window hookup; **built-in MCP endpoint** (stdio shim + HTTP + Streamable HTTP) exposing the `page_*` / `user_*` tool families |

## 2. What It Solves

| Pain Point | Solution |
|---|---|
| AI cannot see the page | `page_exec` (CDP-like commands) / `page_snapshot` let the AI operate and read the real page |
| AI needs user cooperation | `user_*` tool family: element picking, yes/no confirmation, option selection, text input, presence probing, non-blocking notifications |
| Cumbersome configuration | **Config minimization**: inspect only needs the AI address passed in; the host assembles the environment (`pageId`), and the AI window works on open |
| Hard-coded tokens, multi-connection confusion | `token → instanceId` (connection identity, short numeric/alphanumeric), `uid → frameId` (target frame), combined `pageId` |
| Disconnects on refresh | instanceId persistence + TTL retention + secret verification, **reload keeps the connection** |
| Messages never reach the IDE's AI | IDE plugin + bridge direct connection: the AI agent window receives page events/interaction results in real time |

## 3. Architecture Pipeline

```
IDE AI agent window / Claude Code / Cursor / aiti-agent
        │  MCP (stdio / HTTP / SSE)
        ▼
┌─────────────────────────────┐
│ aiti-bridge (local svc)  │  session registration / routing / broadcast
│  ├─ /bridge/claim            │  connection registration/reuse (instanceId + secret)
│  ├─ /bridge/sessions         │  discovery: all operable pageIds
│  ├─ /bridge/sse              │  persistent connections (role=page|ai)
│  ├─ /bridge/result           │  execution results back to the bridge
│  ├─ /bridge/event            │  page events (open_file etc.)
│  └─ /mcp/mcp                 │  MCP JSON-RPC (tools/list / tools/call; Streamable HTTP)
└────────────┬────────────────┘
             │ SSE
             ▼
   aiti-devtools (page injection) → aiti-devtools client → target frame execution
```

## 4. MCP Tool Families

### page_* (page operations, one-way commands)

| Tool | Description |
|---|---|
| `page_exec` | execute CDP-like commands on the `pageId` target frame (DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser) |
| `page_snapshot` | collect a page snapshot (DOM outline + viewport + framework detection) |
| `bridge_status` | bridge connection status, active connections, list of operable pageIds |

### user_* (human interaction, AI calls the human to the scene)

| Tool | Scenario | Where the User Answers |
|---|---|---|
| `user_pick_element` | AI asks the user to pick a page element | Page (pick panel + Inspector) |
| `user_confirm` | yes/no (approve/reject, with reason) | AI window answer card |
| `user_choose` | option A/B/C selection (multi-select allowed) | AI window answer card |
| `user_input` | text input | AI window answer card |
| `user_presence` | probe whether the user is online | AI window answer card |
| `user_notify` | non-blocking notification | browser Notification |

Unified semantics: controllable timeouts (frontend countdown + server-synced pause), notifications that reach the user (Notification + title flashing + sound), rejection with semantics (presets + custom reason).

## 5. Quick Usage

```bash
# 1. Start the bridge
npx @aiti-ai/aiti-bridge --port 8777

# 2. Configure any MCP client (one-shot stdio shim registration, idempotent; agents connect via the AITI_BRIDGE_URL env var)
npx @aiti-ai/aiti-bridge --register-shim
# or point an MCP client straight at the HTTP endpoint: http://127.0.0.1:8777/aiti/mcp/mcp

# 3. Tell the AI the target page
# "Use bridge_status to see which pageIds are available, then run page_snapshot on 01234/f0"
```

## 6. Security

- token/secret authentication (verified across SSE / result / event)
- secret prevents cross-page conflicts: only the original page can reuse its own instanceId
- dangerous-command confirmation + gesture bridge (transient activation)
- the bridge endpoint listens on localhost (127.0.0.1) only; page connections are verified via claim/secret
- external auth for the MCP endpoint: planned adaptation to service-tunnels (auth + token coexistence)

## 7. New Capabilities in 2026-08

| Capability | Description | Docs |
|---|---|---|
| **Streamable HTTP transport** | `GET /mcp/mcp` persistent stream + `Mcp-Session-Id`; the server can push messages proactively | [MCP Server](/en/guide/mcp/server.md) |
| **`aiti_inbox` message main channel** | human messages / async answers / page events enter a queue; agents poll via a tool — 100% usable by any agent | [AI Agent Integration](/en/guide/mcp/ai-agents.md) |
| **`/bridge/push`** | human → AI proactive messages (sampling push / inbox enqueue fallback) | [MCP Server](/en/guide/mcp/server.md) |
| **Message session storage** | pi-session-style JSONL (append-only event stream); consumed history retained | [MCP Server](/en/guide/mcp/server.md) |
| **cockpit universal AI window** | onboarding page + address configuration hub + console; opened by default when no aiUrl is set | [cockpit](/en/guide/mcp/cockpit.md) |
| **Message consumption states** | pending → delivered → consumed, shown in a sliding window | [cockpit](/en/guide/mcp/cockpit.md) |

> Session system details: [MCP Bridge · Sessions](/en/guide/mcp/session.md); AI agent integration: [MCP Bridge · AI Agents](/en/guide/mcp/ai-agents.md); the human-side UI: [cockpit](/en/guide/mcp/cockpit.md).
