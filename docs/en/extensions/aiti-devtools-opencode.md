---
title: "aiti-devtools-opencode (OpenCode Host Adapter)"
icon: 🔵
description: OpenCode host plugin (16 tools registered in-process + messages.transform placeholder rewriting) + the official web UI serves as the AI window (nginx reverse proxy strips CSP + sub_filter injection, no fork)
---

# aiti-devtools-opencode (OpenCode Host Adapter)

> ❝ **The official UI is already good enough — we only add a layer, not take over the whole facade.** ❞

Full integration of `aiti-devtools` into [OpenCode](https://opencode.ai) (sst's open-source coding agent) — **host plugin + official web UI as the AI window**:

- **Host plugin** (`@opencode-ai/plugin` `tool()` factory, not via MCP): registers 16 `aiti_*` tools in-process + bridge SSE push injection (cockpit sends a message → plugin injects → the model proactively calls tools to answer) + `session.idle` answers back to the bridge; when the bridge is unreachable, placeholder probe tools are registered as fallback (bridge_status/page_exec give guidance), without dragging opencode down
- **Placeholder rewriting**: `experimental.chat.messages.transform` rewrites in place, touching only the last user message — `[元素N]` → full describe + `[发自: pageId · url]`; history keeps the original placeholders, only the LLM input is expanded; on receiving `aiti_consumed`, the bridge clears picked in sync (preventing zombie candidates on cold start)
- **Web UI AI window (no fork)**: nginx reverse proxy strips CSP + `sub_filter` injects `aiti-client-opencode.js` + the bridge mounted same-origin at `/aiti/` — candidate bar / detail popup / interaction cards / placeholders all grow on the official UI; the bridge serves the adapter script via `--assets-extra`, and the client's bridge address is auto-derived from the script src (zero config)
- **Interaction cards**: the model calls `aiti_user_confirm/choose/input` → bridge pushes to the AI window → web UI renders the card locally (bottom right) → the answer goes back to the bridge → the model receives it
- **Full E2E loop verified** (2026-08-24 opencode 1.1.51; 2026-11-07 recheck 0.3.1 / opencode 1.19.5 — core 0.3.10 rebuild + devDep SDK aligned to 1.19.5, npm-routed docker fresh install with zero friction / real Chrome): tool changes the page title, push injection, candidate bar, placeholder replacement + consumption clearing, interaction card answering
