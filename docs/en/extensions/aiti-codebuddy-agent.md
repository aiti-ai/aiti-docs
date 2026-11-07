---
title: CodeBuddy Code Session Backend (aiti-codebuddy-agent)
icon: 🔵
description: Tencent CodeBuddy Code CLI (cbc) driver — stream long connection (default) + exec fallback dual mode + --resume into All Sessions, control_request three channels, API-key env login
---

# aiti-codebuddy-agent

> ❝ **Tencent CodeBuddy sessions, ready to chat anywhere.** ❞

Tencent CodeBuddy Code (the official CLI carved out of the WorkBuddy desktop app; npm package `@tencent-ai/codebuddy-code`, command `cbc`) session backend: plugs into the All Sessions multi-agent frontend — a cbc history row in the panel (`codebuddy:<sid>`) revives into a live session with one click.

Plan draft: `docs/aiti-codebuddy-agent-plan.md` (verified on 2.148.0, 2026-09-10; **stream long connection from 2.150.0**, §10 implementation record).

## Mechanism (two process tiers, feature `codebuddy.connectionMode`)

- **stream (default, verified on 2.150.0)**: single process, long connection, multi-turn — stdin continuation + `control_request` three channels (interrupt / set_model / set_permission_mode **effective immediately while running**) + `can_use_tool` forwarded to the frontend authorization card (respondPermission ✅)
- **exec (compat tier)**: `cbc -p <prompt> --output-format stream-json [--model M] [--permission-mode X] [--resume sid]`, one shot per turn; model/permission switches take effect next turn, respondPermission:false (print mode has no approval surface; `--permission-mode` pre-allows)
- **stream-json output is isomorphic to Claude Code**: system/init (`session_id`/`model`/`tools`/`slash_commands`) + stream_event (text_delta increments) + assistant + result (`is_error`/`usage`/`modelUsage.contextWindow`)
- ⚠ error turns also exit with code 0 — success/failure is judged only by the result frame
- Lazy persistence: the first turn's init frame captures the real sid → `session_backend_ready` rebinds to `codebuddy:<uuid>`
- History replay: the revival path goes through the All Sessions service outlet (session-manager `services.sessions`; the only reader of cbc storage is its `lib/agents/codebuddy.ts` — **the stored jsonl is not isomorphic to claude's**: top-level role/content + numeric millisecond timestamps + `function_call`/`function_call_result`/`reasoning` as separate row types, tool calls folded into structured tool rows → viewer's native tool cards (input/output sections); reasoning stays off the timeline but provides the real model)
- CLI resolution: feature `codebuddy.cliPath` → `cbc`/`codebuddy` on PATH → npx fallback (`process.execPath` + npm npx-cli.js, immune to systemd PATH pitfalls; first use pays a package-download delay)

## Login and credentials (both tiers complete)

**API-key tier (P0)**
- iam.md official env read directly: `CODEBUDDY_API_KEY` / `CODEBUDDY_AUTH_TOKEN` (higher priority) / `CODEBUDDY_BASE_URL` (third-party OpenAI-compatible gateway, bypassing Tencent credits)
- Credential storage: extension configDir `codebuddy-credentials.json` (0600); the three credential features managed by extman (apiKey/authToken/baseUrl) take priority over the credentials file
- API: `GET /api/extensions/aiti-codebuddy-agent/login/status` (badge data source) · `POST /login/key` `{apiKey?,authToken?,baseUrl?}` (empty string = clear that field) · `POST /login/clear`

**Browser OAuth tier (server-side PTY driven)**
- `POST /login/tui` `{site?}`: via aiti-cmd `services.runner`, starts a cbc interactive TUI session in the background (**process ownership on the server side**; the sid is shared with aiti-cmd's frontend xterm rendering), feeds `/login` programmatically (optional `site` index auto-selects the site)
- `GET /login/tui/status`: `waiting|success|failed|timeout|idle` + authorization URL (OSC8 restoration + SSO prompt filtering, sticky); completion is judged by fingerprint changes in `~/.codebuddy` (settings.json + local_storage/ mtime); 330s fallback timeout
- `POST /login/tui/input` `{text}`: forwards manual keystrokes such as site selection (the process stays in the backend); `POST /login/tui/cancel` terminates
- Implements no OAuth protocol, touches no credential content (controlled-login standard philosophy; `docs/aiti-codebuddy-agent-plan.md` §9.3)

## Capability surface (fail-loud, routed per channel)

followUp / queueManage / setModel / setPermissionMode / listModels / getUsage / contextUsage (result.modelUsage) / getMessages / listTools / getCommands ✅; stream mode setModel/setPermissionMode effective immediately while running + **respondPermission ✅** (can_use_tool → frontend approve/deny); exec compat tier switches take effect next turn, respondPermission ❌; steer / file attachments ❌

## Session recycle

`GET/POST /api/extensions/aiti-codebuddy-agent/session/recycle` — upgrades existing handles to the current extension code (after hot reload, old-code sessions rebuild), same as aiti-zcode-agent.

## Bridge tool injection (Adapter C)

- `MCP_TARGETS` already includes codebuddy (`~/.codebuddy/.mcp.json`): `node dev-repo/bridge/bin/aiti-mcp-register.mjs --targets codebuddy` registers the `aiti` shim entry
- Spawn env: the governance whitelist passes the service process's `AITI_BRIDGE_URL` through; the feature `codebuddy.bridgeUrl` provides an explicit override (takes priority). With neither, cbc sessions simply lack aiti_* tools and normal chat is unaffected

## Model catalog (dynamic, D13)

The real list from `cbc --help` is probed by the shared resolver `probeCbcCatalog` + a cache layer (`<cacheDir>/cbc-model-catalog.json`, regenerable) — **the dynamic probe wins**; the documented list degrades to a fallback seed (default/fast/balanced/primary/deep tiers + glm-5.3 / glm-5.2 / kimi-k3 / kimi-k2.6 / minimax-m3 / gemini-3.5-flash / gpt-5.6-{sol,terra,luna} / gpt-5.5 / gpt-5.4 / gpt-5.3-codex… newer cbc adds hy4-preview / glm-5.3-flash / kimi-k3-1 / kimi-k2.8-preview etc., 16 tiers), merged with the pi catalog for display.
