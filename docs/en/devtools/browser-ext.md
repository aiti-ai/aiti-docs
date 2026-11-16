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
    # Chrome (recommended): install from Chrome Web Store https://chromewebstore.google.com/detail/ngefccgkjelhnbjopaimncfbdeoclnpo
    # Edge (recommended): install from Edge Add-ons https://microsoftedge.microsoft.com/addons/detail/aiti-devtools/hmlahjeickndfhaabglgiejhhmcfijil
    # Firefox (recommended): install from AMO https://addons.mozilla.org/firefox/addon/aiti-devtools/ (release / Android, signature-free)
    # Self-built: load dist/chrome / dist/edge via chrome://extensions or edge://extensions developer mode; temporary-load Firefox via about:debugging, or npm run package → .xpi (ESR/DevEdition/Nightly signature-free)
  license: MIT
  tags: [chrome, edge, firefox, mv3, content-script, injection, any-page]
---

# Browser extension (Chrome / Edge / Firefox)

> ❝ Someone else's webpage is still my debugging scene. ❞

The aiti-devtools browser extension (MV3): **inject the in-page AI debugging assistant into any webpage — with zero changes to the target app** (FAB 💬 AI + <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg> Inspector, element picking, AI window); together with the aiti-devtools bridge (local standalone bridge or pi-web), pi / claude / opencode agents can operate any page.

## Capabilities

- **Three browsers**: Chrome / Edge (111+) / Firefox (128+, incl. full **Firefox for Android ≥128** support)
- **Injection mechanism**: a `world:"MAIN"` content script — the launcher source is inlined into content/main.js at build time and executed at file top level, **unconstrained by page CSP**; configuration lives in the isolated world (storage.sync → localStorage shared across worlds → read synchronously in the MAIN world at document_idle)
- **Double-injection guard**: the `__dbgLauncherInstalled` sentinel — pages that already run a launcher (like pi-web) are not injected twice
- **Options page**: **AI target** with three kinds (pi-web workbench / compatible agent host / cockpit fallback) + target address + **one-click local pi-web probe** (HEAD of the launcher asset on ports 30141/30142, auto-prefill; selecting pi-web also prefills the same-origin bridge address); **site rules** (default off + allowlist/deny regexes, deny wins); **advanced** (bridge address / `AITI_BRIDGE_URL` one-click copy); refresh the page after saving to take effect

## Install

### From the stores (recommended)

- **Chrome**: one-click install from [Chrome Web Store · aiti-devtools](https://chromewebstore.google.com/detail/ngefccgkjelhnbjopaimncfbdeoclnpo)
- **Edge**: one-click install from [Edge Add-ons · aiti devtools](https://microsoftedge.microsoft.com/addons/detail/aiti-devtools/hmlahjeickndfhaabglgiejhhmcfijil)
- **Firefox**: one-click install from [AMO · aiti-devtools](https://addons.mozilla.org/firefox/addon/aiti-devtools/) — release Firefox / Firefox for Android (≥128) install signature-free

### Self-built

```bash
cd browser-ext
npm run build      # → dist/{chrome,edge,firefox}
npm run package    # → dist/*.zip + dist/aiti-devtools-firefox.xpi
```

- **Chrome**: `chrome://extensions` → developer mode → load unpacked → `dist/chrome`
- **Edge**: `edge://extensions` → developer mode → load unpacked → `dist/edge`
- **Firefox (temporary load)**: `about:debugging#/runtime/this-firefox` → load temporary add-on → `dist/firefox/manifest.json` (gone on restart)
- **Firefox (permanent xpi)**: on ESR / DevEdition / Nightly set `xpinstall.signatures.required=false` and install from file for a permanent install of `dist/aiti-devtools-firefox.xpi` (stable gecko id `aiti-devtools@aiti.ai` is pinned; world:MAIN injection needs ≥128)

## Usage

1. After installing, the FAB (💬 AI + <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg> Inspector) appears on any webpage
2. Click 💬 to open the AI window (default = the bridge's same-origin cockpit console)
3. Connect the agent side (pick one):
   - **pi**: install aiti-devtools-pi, same bridge
   - **stdio shim**: env `AITI_BRIDGE_URL` (one-click copy on the options page)
   - **MCP**: `{ type:"http", url:"<bridgeUrl>/mcp/mcp" }`

> Prerequisite: the bridge is running (`systemctl start aiti-bridge` or `node >dev-repo/bridge/bin/aiti-bridge.mjs`).

## Default-off and site rules

- **Default off**: popup "⚡ Enable on this page (once)" (runtime-only message, gone on navigation, wins over deny rules) + "★ Always enable this site" allowlist / deny regexes (deny wins)
- **AI window defaults to pi-web**: options-page one-click probe of local 30141/30142 with auto-prefill; "compatible agent host / cockpit fallback" as the other two kinds

## Positioning

Fills the "any webpage, no carrier" gap: project plugins only cover apps that adopt them, the pi-web extension only covers pi-web, port injection only covers proxied ports — the browser extension pushes coverage to **all web pages**.
