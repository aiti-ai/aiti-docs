---
title: Browser extension (Chrome / Edge / Firefox)
icon: 🌐
ext:
  id: aiti-devtools-browser-ext
  name: Browser extension
  description: "Inject aiti-devtools into any webpage with zero target-app changes — Chrome / Edge / Firefox (incl. Android) MV3 extension: FAB + Inspector + AI window; with the bridge, pi / claude / opencode can operate any page"
  soul: Someone else's webpage is still my debugging scene.
  type: browser-ext
  category: Page debug injection
  version: "0.1.0"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  installable: false
  install: |
    cd browser-ext && npm run build   # → dist/chrome dist/edge dist/firefox
    # Chrome/Edge: chrome://extensions developer mode → load unpacked → dist/chrome (Edge: dist/edge)
    # Firefox: about:debugging → load temporary add-on → dist/firefox/manifest.json (Android needs ≥120)
  license: MIT
  tags: [chrome, edge, firefox, mv3, content-script, injection, any-page]
---

# Browser extension (Chrome / Edge / Firefox)

> ❝ Someone else's webpage is still my debugging scene. ❞

The aiti-devtools browser extension (MV3): **inject the in-page AI debugging assistant into any webpage — with zero changes to the target app** (FAB 💬+🎯, Inspector picking, AI window); together with the aiti-devtools bridge (local standalone bridge or pi-web), pi / claude / opencode agents can operate any page.

## Capabilities

- **Three browsers**: Chrome / Edge (111+) / Firefox (128+, incl. full **Firefox for Android ≥120** support); `npm run build` produces dist/{chrome,edge,firefox}, `npm run package` produces zips
- **Injection mechanism**: a `world:"MAIN"` content script — the launcher source is inlined into content/main.js at build time and executed at file top level, **unconstrained by page CSP**; configuration lives in the isolated world (storage.sync → localStorage shared across worlds → read synchronously in the MAIN world at document_idle)
- **Double-injection guard**: the `__dbgLauncherInstalled` sentinel — pages that already run a launcher (like pi-web) are not injected twice
- **options page**: bridge address (default `http://127.0.0.1:8777/aiti`, can point at a remote pi-web) / AI window address (default cockpit) / global switch / excluded sites (one regex per line) / one-click copy of AITI_BRIDGE_URL; refresh the page after saving to take effect

## Install

```bash
cd browser-ext && npm run build      # → dist/chrome dist/edge dist/firefox
```

- **Chrome / Edge**: `chrome://extensions` (or `edge://extensions`) → developer mode → load unpacked → `dist/chrome` (Edge: `dist/edge`)
- **Firefox**: `about:debugging#/runtime/this-firefox` → load temporary add-on → `dist/firefox/manifest.json`
- **Firefox for Android**: needs ≥120; permanent installs require the signed stable gecko id `aiti-devtools@aiti.ai`

## Usage

1. After installing, the FAB (💬 AI + 🎯 Inspector) appears on any webpage
2. Click 💬 to open the AI window (default = the bridge's cockpit console)
3. Connect the agent side (pick one): **pi** (install aiti-devtools-pi, same bridge) / **stdio shim** (env `AITI_BRIDGE_URL`, one-click copy on the options page) / **MCP** (`{ type:"http", url:"<bridgeUrl>/mcp/mcp" }`)

> Prerequisite: the bridge is running (`systemctl start aiti-bridge` or `node dev-repo/bridge/bin/aiti-bridge.mjs`).

## Plan

`docs/aiti-devtools-browser-ext-plan.md` (plan/implemented 2026-09-16: three-browser builds + end-to-end injection verified). Positioning: fills the "any webpage, no carrier" gap — project plugins only cover apps that adopt them, the pi-web extension only covers pi-web, port injection only covers proxied ports; the browser extension pushes coverage to **all web pages**.
