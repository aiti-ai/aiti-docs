---
title: aiti-bridge Roadmap
icon: 🔗
description: Bridge layer plan — server, sessions, IDE plugins, messages delivered straight into IDE AI windows
tags: [roadmap, aiti-bridge, ide]
---

# aiti-bridge Roadmap (the AI Agent Enablement Layer)

> Core goals: **configure aiti-devtools usage**, **enable any AI agent**, support aiti-devtools and vscode/idea plugins to complete injection, and **let aiti-bridge send messages directly to the AI agent window inside the IDE**.
> **Current-state baseline**: [`@aiti-ai/aiti-bridge`](https://www.npmjs.com/package/@aiti-ai/aiti-bridge) 0.2.x is on npm (incl. the stdio⇄HTTP MCP shim); per-item status lives in the [Product Matrix](/en/products/README.md).

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **R0 · Bridge link** | Protocol end-to-end | Full bridge endpoints (claim/sessions/register/sse/result/event + MCP); pageId session system + user_* tool family end-to-end | ✅ |
| **R1 · Config minimization** | AI only needs to be told one pageId | `AITI_BRIDGE_URL` shim access ✅ implemented (stdio MCP via a single env var); remaining: claim/secret/TTL full verification + sessions discovery documentation | 🚧 |
| **R2 · Agent enablement** | Any AI can connect | [AI agent onboarding docs](/en/guide/mcp/ai-agents.md) (capability matrix + per-agent guidance prompts + aiti_inbox main channel) ✅; 12 CLI adapter extensions on the pi-web side ✅; more examples added continuously | ✅ |
| **R3 · IDE plugins** | Messages delivered into IDE AI windows | devtools-vscode 0.3.x source-ready (reverse-proxy injection + bridge lifecycle + `.vscode/mcp.json` wiring + AI window jump), marketplace release pending; devtools-idea 📋 | 🚧 |
| **R4 · Platform** | Open ecosystem | MCP tool extension registration, bridge pluggable, public protocol docs | 📋 |

## R3 Acceptance Scenario (IDE Bug Fixing)

```
1. vscode opens the project → aiti: enable page debugging (inject + start bridge + write .vscode/mcp.json)
2. Copilot Chat: "the home page button doesn't respond, help me investigate"
3. AI: page_exec click → collect errors → locate LoginForm.vue:23 (open_file opens the source)
4. AI: user_confirm "add the Content-Type header?" → Chat pops up a confirmation card → approved
5. AI fixes the code → page refresh verifies → error gone
```

> vscode 0.3.x already covers every link in step 1 (injection + bridge + MCP wiring + AI window jump); steps 2-5 depend on the MCP behavior of the chosen IDE agent and await end-to-end acceptance.

## Todo List

- [ ] **claim/secret/TTL regression tests**: reload keeps the connection, cross-page isolation, TTL expiry reclamation
- [ ] **sessions discovery API documentation** + AI guidance prompt (into guide/skills templates)
- [ ] **JetBrains `mcp.xml` interoperability** (`.vscode/mcp.json` is already auto-written by the vscode extension ✅)
- [ ] **JetBrains AI Assistant plugin API research** (the Copilot Chat path is proven by the vscode extension; fallback uniformly via cockpit)
- [ ] **Multiple IDE windows**: multiple windows of the same project share an instanceId; secret arbitration on conflict
- [ ] **`user_*` tool family polish in IDE scenarios**: countdown/pause/notify/reject semantics tested end to end
- [ ] **vscode extension marketplace release**: VS Code Marketplace + Open VSX

> ✅ Done: `AITI_BRIDGE_URL` (stdio MCP access via a single env var).

## Architecture Note

```
IDE AI agent window / Claude Code / Cursor / aiti-agent
        │ MCP (stdio / HTTP / SSE)
        ▼
aiti-bridge (local service, runnable via npx) → pageId session → SSE → aiti-devtools injected page
        ▲
        └── page events (open_file / element selection / user_* answers) pushed back to the AI window in real time
```

> Protocol details: [MCP Bridge · Server](/en/guide/mcp/server.md); sessions: [Session System](/en/guide/mcp/session.md).
