---
title: aiti-devtools
icon: 🛠️
description: In-page AI debugging assistant — aiti-devtools injection + Inspector + MCP bridge
tags: [product, aiti-devtools, inject]
---

# aiti-devtools — In-Page AI Debugging Assistant (the Injection Core Package)

> **In one sentence**: bring AI to the live scene of page development — inject `aiti-devtools` + Inspector floating UI + the MCP bridge, so AI and humans collaborate organically on the **same page**.
> **Forms**: ① active adaptation by developers (this package) → ② Chrome extension / platform built-in → ③ IDE plugins (vscode/idea).
> Current version **0.2.x**: all 21/21 self-checks pass (verified on both native HTML and React), including a Huawei HarmonyOS real-device scaling fix.

## 1. Quick Start (Form ①)

For in-project integration, **prefer a carrier plugin** (one line for Vite / Webpack / Nuxt — see the [plugin matrix](/en/products/aiti-devtools-plugins.md)). Manual integration is a single `<script>` (start the local bridge first: `npx @aiti-ai/aiti-bridge --port 8777`):

```html
<script
  src="http://127.0.0.1:8777/aiti/aiti-launcher.js"
  data-bridge-url="http://127.0.0.1:8777"
  data-ai-url="http://127.0.0.1:8777/aiti/cockpit.html"
  defer
></script>
```

- `data-bridge-url`: bridge address (defaults to the script's own origin); `data-ai-url`: AI window address (defaults to `cockpit.html` next to the bridge); globals `window.__AITI_BRIDGE_URL` / `window.__AITI_AI_URL` also work.
- Two buttons — 💬 AI messages / 🎯 (crosshair Inspector) — appear at the bottom-right corner; capabilities are plug-and-play. The script auto-boots `createDbgLauncher`; no JS required.

## 2. Capability List

### Inspector Picking and Navigation
- Three-step picking + selection fine-tuning (↑↓◀▶/#/✓) + touch mode + keyboard navigation (DFS)
- Host page / nested same-origin iframe, three zones selectable (`host` / `f0` / `f1`…)
- HUD bubble + toolbar fully avoid the selection, 8-way navigation, compact magnification on small screens
- Physical screen anchoring: getPhysViewport normalization + counter-zoom; UI stays pinned under browser zoom/scroll

### Event Freezing → Allowlist Matrix
- 7 event categories frozen selectively, real click pass-through, polymorphic allow plans (default / all-allowed / all-frozen / custom)
- ⏱ Speed panel: animation slowdown, scroll/wheel interception, timer slow-motion, network simulation, forced errors, scenario presets, on-site snapshots, viewport simulation 375-1440, touch simulation

### CDP-like Command Set (8 Domains, 42 Commands)
| Domain | Capabilities |
|---|---|
| DOM | query/traverse/edit elements, attribute operations |
| CSS | style reading/overrides, computed style |
| Input | click/type/keyboard/wheel (incl. gesture bridge) |
| Page | navigate/reload/screenshot/performance |
| Runtime | eval (allowed by default within a session + audit) |
| Storage | localStorage/sessionStorage/cookie |
| Performance | metrics collection |
| Browser | clipboard/download/dialog/fullscreen/playback (executed by the host, transient-activation safe) |

### Framework Detection and fileLocation
React / Next / Vue / Svelte (dev-build `_debugSource` / `__file` / `__svelte_meta`) → unified output `{framework, file, line, component}` — **AI errors locate straight to the source file**, paired with the bridge's `open_file` event to open it in the editor.

### MCP Bridge
- `npx @aiti-ai/aiti-bridge --port 8777` (built-in MCP endpoint: stdio + HTTP + Streamable HTTP, plus the SSE page bridge)
- MCP tools: `page_exec` / `page_snapshot` / `bridge_status` / `user_*` (user interaction tool family)

### Refresh Recovery
AI window open/closed state + position/size, allow plan, viewport, and target URL are all persisted (localStorage) and automatically restored on refresh.

## 3. Security Boundaries

- eval is allowed by default within a session (visible in the panel audit)
- Dangerous commands (removeNode/reload/navigate/localStorage persistence) pop a confirmation card + confirmation queue
- Browser-restricted operations go through the gesture bridge (a real user click, required every time)
- The bridge authenticates with a token; right-click/middle-click allowed; cross-origin iframes skip injection

## 4. File Structure

The development source lives in `dev-repo/inject/` (esbuild builds the injection artifacts); the release form is an **aiti-agent extension** (`dev-repo/aiti-devtools/`, deployed to `~/.pi/web/extensions/aiti-devtools/`).

| File | Responsibility |
|---|---|
| `dev-repo/inject/src/client/index.js` | the injected mini `aiti-devtools` client (element profile: size/styles/component source and location/call sites/pageId/url) |
| `dev-repo/inject/src/launcher/` | host launcher (widget UI / inspector / MCP bridge / interaction panel, modular) |
| `dev-repo/inject/src/mcp/bridge-client.js` | generic bridge client (pages/AI windows connecting to the bridge) |
| `dev-repo/inject/tools/build.mjs` | builds the single-file `dist/aiti-launcher.js` (client + launcher bundled) |
| `dev-repo/bridge/bin/aiti-bridge.mjs` | MCP bridge (stdio + HTTP + page SSE) standalone edition |
| `dev-repo/aiti-devtools/` | aiti-agent extension: `bridge.ts` (MCP bridge) / `inject.ts` (service-tunnels injection) / `client/aiti-client.mjs` (AI window) |
| `dev-repo/aiti-devtools/tools/deploy.mjs` | builds the launcher + deploys the extension to `~/.pi/web/extensions/aiti-devtools/` |

## 5. Development / Running

```bash
node dev-repo/inject/tools/build.mjs          # → inject/dist/aiti-launcher.js (injection single file) + bridge-client.js + cdp-core.js
node dev-repo/core/tools/build-assets.mjs     # rebuild core/assets (central build artifact dir; read by bridge/carrier plugins)
node dev-repo/aiti-devtools/tools/deploy.mjs              # → ~/.pi/web/extensions/aiti-devtools/ (aiti-agent hot reload)
node dev-repo/bridge/bin/aiti-bridge.mjs --port 8777   # standalone MCP bridge
node dev-repo/pi-ext/tools/build.mjs              # → dev-repo/pi-ext/dist/aiti-devtools-pi.js (pi extension)
```

> Plugin matrix: [aiti-devtools plugins](/en/products/aiti-devtools-plugins.md); usage docs: [aiti-devtools](/en/devtools/).
