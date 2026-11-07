---
title: aiti-debug-inject
icon: 🧥
description: Minimal remote-debug injection — injects another pi-web instance's debugger into this instance's pages; the service URL is a text feature in extman, off by default
---

# aiti-debug-inject

> ❝ **Which outfit the debugger wears is up to you.** ❞

The evolved **proper extension** of **dev-exts/aiti-inject** (dev-only, hardcoded prod address, always injected), in minimal form: no toolbar / no dialogs / no built-in config UI — "just inject JS, simply".

- **No UI**: declares no `ui`, and the client doesn't `registerItems`.
- **Service URL is feature config**: `service.url` is a **string feature** — in the extension manager (aiti-extman) feature management panel, a single text box takes the target pi-web address (saved on Enter/blur). *Depends on core's string-valued feature support (`ExtFeature.type === "string"`).*
- **Off by default**: `inject.enabled` is a boolean feature (default off), toggled via a checkbox in the panel.
- **Cross-instance debugging**: once the switch is on + the address configured, the target pi-web's aiti-devtools launcher (with content hash) is injected into this instance's pages → this instance's pages join the target bridge → the target pi-web's agent debugs this instance's pages ("use one pi-web to debug another").

## Usage

1. Extension manager → aiti-debug-inject → feature management:
   - Fill the "Service URL (target pi-web)" text box with the target site address (e.g. `https://pi-web.example.com` or `http://127.0.0.1:<port>`), save on Enter.
   - Turn on the "Enable injection" switch.
2. This instance's pages inject the target launcher immediately (feature change listener, no refresh needed).

> Difference from `aiti-devtools` self-injection (`inject.ts`, where the service-tunnels server assembles HTML = this instance injecting its own launcher): this extension **injects another pi-web's launcher**, a pure client browser-side injection with no server logic.
