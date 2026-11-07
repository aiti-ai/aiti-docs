---
title: aiti-devtools-vscode
icon: 🟦
description: VS Code extension — injection + bridge + Copilot Chat integration
tags: [ide, vscode]
---

# aiti-devtools-vscode

> Status: 🚧 **MVP implemented** (2026-11-07, repo dir `vscode-ext/`, tests 7/7 green). Delivered: four commands + dev-server reverse-proxy injection + bridge lifecycle + automatic `.vscode/mcp.json` config + bridge panel (manual refresh, zero polling).
> Remaining R3 items (planned): inline answer cards in Copilot Chat, `open_file` source jump, AI-window aiti panel Webview.

## Features

| Feature | Description | Status |
|---|---|---|
| One-click injection | Proxies the dev server (Vite/Webpack/Next), injecting aiti-devtools by prepending to responses | ✅ MVP |
| Auto-starts the bridge | Starts/stops `aiti-bridge` (default 8777; reuses an already-running external bridge, never kills it) | ✅ MVP |
| Auto-configures MCP | Writes `.vscode/mcp.json` (stdio shim + env `AITI_BRIDGE_URL`, no URL in config), giving Copilot Chat the `page_*` / `user_*` tools | ✅ MVP |
| Bridge panel | Bridge/proxy status, sessions list, log tail, cockpit shortcut (webview, manual refresh) | ✅ MVP |
| AI window aiti panel | pageId, target URL, framework, connection status, dangerous-command confirmation queue | 📋 |
| Answer cards inline | `user_confirm` / `user_choose` / `user_input` answered directly in Copilot Chat | 📋 |
| Source code jump | The `open_file` event opens the file and jumps to the line via VS Code API | 📋 |

## Command palette

```
aiti: Enable Page Debugging   # inject + start bridge + configure MCP
aiti: Stop Debugging
aiti: Open Bridge Panel       # pageId / sessions / event log
aiti: Re-inject               # fixes double injection when detected
```

## User journey

```
1. Open the project → "aiti: Enable Page Debugging"
2. Start the dev server (the plugin proxies and injects automatically)
3. Ask Copilot Chat: "The login page returns 500, help me investigate"
4. AI: page_exec to submit the form → collect the errors → pins down LoginForm.vue:23
5. AI: user_confirm "Add the Content-Type header?" → a confirmation card pops up in Chat → approved
6. AI changes the code → the page refreshes to verify → the error is gone
```

## Implementation notes

| Aspect | Approach |
|---|---|
| Injection detection | Proxy side: skip if the first chunk already contains `aiti-launcher.js` (no double injection when the app ships its own vite plugin); only `text/html` + navigate (`Sec-Fetch-Mode`) — same semantics as core `htmlInjectMiddleware` |
| Proxy | Local reverse proxy (default 8788), prepends the launcher tag (absolute bridge-origin URL) on the first chunk, drops content-length for chunked, tunnels WebSocket upgrades (HMR) |
| Bridge lifecycle | Child process `node aiti-bridge.mjs --port <n>` (ELECTRON_RUN_AS_NODE); reuses external bridges, only stops its own; Windows taskkill tree-kill |
| MCP config | stdio shim entry (`node aiti-mcp-shim.cjs` + env `AITI_BRIDGE_URL`); never clobbers an existing mcp.json with comments/invalid JSON |
| AI window injection | MVP falls back to "open cockpit" (one click in the bridge panel); Webview embedding planned |
| Multi-window | One instanceId per project; multiple windows of the same project share it |

> Source: `vscode-ext/` (esbuild → `dist/extension.js`; `node --test test/smoke.test.mjs`, 7 tests incl. a real bridge spawn/stop loop).

> Related: [IDE plugins product page](/en/products/aiti-ide-plugins.md) · [Integrating AI agents](/en/guide/mcp/ai-agents.md)
