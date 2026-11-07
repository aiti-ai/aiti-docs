---
title: aiti-devtools SDK
icon: 🛠️
description: "aiti-devtools — the in-page AI debugging assistant SDK (core+inject assets)"
tags: [devtools, inject, inspector, mcp]
---

# aiti-devtools SDK

> ❝ **AI shouldn't blindly guess at a screen; it should truly see the page.** ❞

Bring AI to the page development scene: an injected debug client (launcher UI) + floating Inspector widget + MCP bridge, so AI and humans truly collaborate **on the same page**.

- Forms: ① developer opt-in adaptation → ② platform built-in → ③ [IDE plugins](/en/ide/) (vscode / idea, planned)

## Distribution

The SDK itself is served as core+inject assets by framework plugins (`@aiti-ai/aiti-devtools-vite` etc.) or the standalone bridge — no separate installation needed.

## Manual wiring (script tag)

The simplest way: add one line to any HTML the dev server can serve:

```html
<script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>
```

- `data-bridge-url`: bridge address (same-origin `/aiti/` or the standalone bridge `http://127.0.0.1:8777`)
- `data-ai-url`: AI window (cockpit console) address

But **the vast majority of scenarios don't need manual wiring** — a framework plugin does it in one line; see the integration matrix below.

## Integration Matrix

| Carrier | How to integrate | Docs |
|---|---|---|
| Vite / SvelteKit | `aitiDevtools()` plugin | [vite](integrations/vite.md) |
| webpack / Rspack | `AitiDevtoolsWebpackPlugin` | [webpack-rspack](integrations/webpack-rspack.md) |
| Nuxt | `modules: ['@aiti-ai/aiti-devtools-nuxt']` | [nuxt](integrations/nuxt.md) |
| Astro | `integrations: [aitiAstro()]` | [astro](integrations/astro.md) |
| Vue projects (planned) | Falls back to the Vite plugin | [vue](integrations/vue.md) |
| Express / Next and other carriers | Manual wiring via core middleware | [manual](integrations/manual.md) |

Runnable examples for each carrier: see the [Example Matrix](examples.md).

## Injection Mechanics & Command Set

- [Quick Start](quick-start.md): the fastest way to get started
- [Injection Mechanics](inject.md): local inject details, the three forms, host/iframe routing
- [CDP Command Set](cdp-commands.md): reference for commands across 8 domains
- [Product page](/en/products/aiti-devtools.md): positioning and roadmap

## Relationship to the pi-web Extension

**Same name, different thing**: pi-web also has an [extension](/en/extensions/aiti-devtools.html) called `aiti-devtools` (deployed at `~/.pi/web/extensions/`, responsible for the injector/bridge/MCP server side in pi-web scenarios). This page is about the npm-published injection SDK itself; the two share the same bridge protocol and injection artifacts.
