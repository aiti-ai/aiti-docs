---
title: aiti-devtools-openclaw (OpenClaw host adapter)
icon: 🦞
description: OpenClaw plugin direct connection skipping MCP — 16 tools registered into agent sessions + sessions auto-online + chat.send message injection + answers relayed back + placeholder mapping table, cockpit companion AI window
---

# aiti-devtools-openclaw (OpenClaw host adapter)

> ❝ **A good debugging assistant should not be blocked by protocol gates — if it can registerTool, it can open the door.** ❞

Fully wires `aiti-devtools` into [OpenClaw](https://openclaw.ai) — **plugin direct connection, skipping MCP**: `api.registerTool` × 16 registers the `aiti_*` tools into OpenClaw agent sessions, with execute calling the bridge REST `POST /bridge/agent/tools/call` directly (the same stateless direct connection as the pi-web extension).

- **Sessions auto-online**: `session_start` + `before_message_write` as the backstop → register with the bridge + open SSE — new sessions appear in the cockpit agents list in real time without waiting for a tool call
- **Dual-path message injection**: `enqueueNextTurnInjection` (visible next turn) + `chat.send` gateway dispatch (triggers a turn immediately) — primary/backup mutually exclusive dedup (v0.6.7, `before_prompt_build` writes pickedCache for same-turn expansion); messages sent proactively from the cockpit enter the loop right away
- **Answer relay-back**: `before_message_write` (before the assistant final draft is persisted) → `POST /bridge/agent/answer`; the AI window/page displays it in real time
- **Placeholder rewriting** (v0.6, the DSH pre-step equivalent): `before_prompt_build` injects the "expansion mapping table" into the system section + `before_message_write` expands synchronously with pickedCache before persisting; only tags matching this text are expanded (the bridge's picked is a single global key, preventing concurrent hosts from stepping on each other); when the bridge receives `aiti_consumed` it clears picked authoritatively
- **Client surface**: nginx mounts the bridge same-origin under `/aiti/` (launcher / cockpit.html / bridge / mcp) + the `/aiti-demo/` demo page; browser E2E verified — the `user_confirm` confirmation card renders in the cockpit and clicking ✅ returns `answered` from the tool

The tool definition source is the bridge `tools/list` (pulled and embedded at build time; the version number is written into package.json as generated; after the bridge adds tools just rerun the build). 0.6.8 already folded in four groups of descriptions along with the bridge: pageId default = the latest AI main window (self:true) / page_exec screenshot preparation card + preview confirmation chain (args.reason / timeout default 280s +30s headroom) / bridge_status carrying device/deviceLabel device info (distinguishes multiple machines and tabs) / user_* without timeout = wait forever (no countdown). 2026-11-07 recheck (openclaw 2026.10.10): after doctor --fix + --accept-capabilities the real-turn full chain (auto-online → before_prompt_build → aiti_bridge_status → answer relayed back to the bridge) ✅.
