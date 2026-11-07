---
title: aiti-bridge Roadmap
icon: 🔗
description: Bridge layer plan — server, sessions, IDE plugins, messages delivered straight into IDE AI windows
tags: [roadmap, aiti-bridge, ide]
---

# aiti-bridge Roadmap (the AI Agent Enablement Layer)

> Core goals: **configure aiti-devtools usage**, **enable any AI agent**, support aiti-devtools and vscode/idea plugins to complete injection, and **let aiti-bridge send messages directly to the AI agent window inside the IDE**.

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **R0 · Bridge link** | Protocol end-to-end | Full bridge endpoints (claim/sessions/register/sse/result/event + MCP); plans D/E done | ✅ |
| **R1 · Config minimization** | AI only needs to be told one pageId | claim/secret/TTL full verification; sessions discovery documented; `AITI_*` unification | 🚧 |
| **R2 · Agent enablement** | Any AI can connect | Claude Code / Cursor onboarding docs + examples; system prompt guidance templates | 📋 |
| **R3 · IDE plugins** | Messages delivered into IDE AI windows | devtools-vscode (Copilot Chat panel + answer cards); devtools-idea (AI Assistant Tool Window) | 📋 |
| **R4 · Platform** | Open ecosystem | MCP tool extension registration, bridge pluggable, public protocol docs | 📋 |

## R3 Acceptance Scenario (IDE Bug Fixing)

```
1. vscode opens the project → aiti: enable page debugging (inject + start bridge + write .vscode/mcp.json)
2. Copilot Chat: "the home page button doesn't respond, help me investigate"
3. AI: page_exec click → collect errors → locate LoginForm.vue:23 (open_file opens the source)
4. AI: user_confirm "add the Content-Type header?" → Chat pops up a confirmation card → approved
5. AI fixes the code → page refresh verifies → error gone
```

## Todo List

- [ ] **claim/secret/TTL regression tests**: reload keeps the connection, cross-page isolation, TTL expiry reclamation
- [ ] **sessions discovery API documentation** + AI guidance prompt (written into skills/templates)
- [ ] **`AITI_*` env var unification**: `AITI_BRIDGE_URL` (shim access), `AITI_OPEN_CMD`, `AITI_BRIDGE_PORT`
- [ ] **IDE config interoperability**: `.vscode/mcp.json` / JetBrains `mcp.xml` two-way sync
- [ ] **AI window extension-point research**: Copilot Chat Webview, JetBrains AI Assistant plugin API (fallback uniformly via cockpit)
- [ ] **Multiple IDE windows**: multiple windows of the same project share an instanceId; secret arbitration on conflict
- [ ] **`user_*` tool family experience polish**: countdown/pause/notify/reject semantics tested end to end

## Architecture Note

```
IDE AI agent window / Claude Code / Cursor / aiti-agent
        │ MCP (stdio / HTTP / SSE)
        ▼
aiti-bridge (local service) → pageId session → SSE → aiti-devtools injected page
        ▲
        └── page events (open_file / element selection / user_* answers) pushed back to the AI window in real time
```

> Protocol details: [MCP Bridge · Server](/en/guide/mcp/server.md); sessions: [Session System](/en/guide/mcp/session.md).
