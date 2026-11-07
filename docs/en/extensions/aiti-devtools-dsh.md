---
title: aiti-devtools-dsh (DSH Host Adapter)
icon: 🤧
description: Ports aiti-devtools fully onto DeepSeek Harness (DSH) — same launcher + 16 tools + agent/pre-step placeholder replacement ([元素N]/[回答N]/[错误N]) + AI window candidate bar (element/answer/error three-color chips), with the official web UI as the AI window
---

# aiti-devtools-dsh (DSH Host Adapter)

> ❝ **The AI in the page doesn't pick hosts — swap in another harness and the same face-to-face debugging plays out.** ❞

Ports the main features of `aiti-devtools` (the in-page AI debugging assistant) onto [DSH (DeepSeek Harness)](https://github.com/deepseek-ai) — DeepSeek's open-source agent harness (Cordis-pluginized, with a built-in web UI).

- **The same integration JS launcher** (`aiti-devtools-inject` artifact, reused unchanged); AI window = DSH web UI (`aiUrl` points to the DSH site)
- **host bundle** (Cordis plugin entry `apply`): in-process bridge mounted at `/aiti` (launcher / cockpit / bridge / mcp on the same port) + 16 `aiti_*` tools + the `/aiti/picked` candidate report endpoint + `agent/pre-step` placeholder replacement
- **client plugin** (browser side): `conversation.input.overlay` slot candidate bar with two chip zones (placeholder zone + description zone + ✕ + clear) + detail dialog (field filtering / open file in background) + click-picking an element → composer inserts placeholder `[元素N]` + automatic cleanup after send (`aiti_consumed` authoritative signal)
- **Interaction cards**: the model calls `aiti_user_confirm/choose/input` → bridge pushes to the AI window → postMessage forwards to the host window (`dbg_mcp_interaction`) to answer → `dbg_mcp_result` returns to the bridge; **answer candidates enter the bar automatically as `[回答N]`, and page error candidates are captured automatically** (red chip + errHint)
- **Placeholder scheme**: DSH's `llm/stream` messages are deep-frozen and cannot be rewritten; the proper insertion point is `agent/pre-step` (agent-loop waterfall, same as plan-mode) — the replaced message enters both the model input and the session history, consistent with the pi-web original; the consumption signal goes through the bridge's `pushAiEvent('aiti_consumed')` to directly push the AI window to clear candidates (three placeholder kinds: `[元素N]`/`[回答N]`/`[错误N]`)
- **End-to-end verified** (real Chrome DevTools clicks + 2026-11-07 full-chain recheck on 0.8.2/core 0.3.10): Inspector → click element → HUD → candidate bar → details → send → message contains the full description + `[发自: pageId]` → candidate bar auto-cleared

Reuses `aiti-devtools-agent` (AgentBridgeClient + AgentHost + mapBridgeTools), `aiti-devtools-core` (createBridge in-process bridge + assets artifacts), `aiti-devtools-inject` — an experience on par with the pi-web integration.
