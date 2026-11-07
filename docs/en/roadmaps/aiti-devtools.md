---
title: aiti-devtools Roadmap
icon: 🛠️
description: Local injection ecosystem plan — core package + framework plugins
tags: [roadmap, aiti-devtools]
---

# aiti-devtools Roadmap (Local Injection Ecosystem)

> Core goal: **embed into every mainstream development tool, inject locally**, and bring AI to the live scene of page development.

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **R0 · Protocol** | Injection/bridge/session protocol end-to-end | Plans B/C/D/E ✅; aiti-devtools 0.2.x (self-check 21/21); full bridge endpoints | ✅ |
| **R1 · Core usable** | Developers work out of the box | `@aiti-ai/aiti-devtools` official release; `AITI_*` env vars unified; self-check expanded to 30+ | 🚧 |
| **R2 · Plugin matrix** | Embed into mainstream dev tools | devtools-**vite** first, vue/next/react/svelte to follow; Chrome extension (form ②) | 📋 |
| **R3 · IDE plugins** | Complete injection + straight into AI windows | devtools-vscode / devtools-idea (see [aiti-bridge roadmap](/en/roadmaps/aiti-bridge.md)) | 📋 |
| **R4 · Platform** | Open ecosystem | public injection protocol/script spec, extension marketplace, contribution guide | 📋 |

## Plugin Matrix (R2)

| Plugin | Package | Injection Point | Priority |
|---|---|---|---|
| Vite | `@aiti-ai/aiti-devtools-vite` | transformIndexHtml / middleware prepend | P0 |
| Vue | `@aiti-ai/aiti-devtools-vue` | app.use + component locating | P0 |
| Next.js | `@aiti-ai/aiti-devtools-next` | dev server response injection + `_debugSource` | P1 |
| React | `@aiti-ai/aiti-devtools-react` | Babel plugin / entry | P1 |
| Svelte | `@aiti-ai/aiti-devtools-svelte` | `__svelte_meta` source locating | P1 |
| Webpack | `@aiti-ai/aiti-devtools-webpack` | html-webpack-plugin hooks | P2 (optional) |

## Tech Debt and Todos

- [ ] `DBG_*` → `AITI_*` env var unification (`DBG_OPEN_CMD` → `AITI_OPEN_CMD`)
- [x] Sync pipeline unified: the old `packages/` publish copies + `dbg-launcher.js` monolith have been deleted — the sole development source is `dev-repo/inject/src/` + `dev-repo/`, build and deploy go through `dev-repo/inject/tools/build.mjs` → `dev-repo/aiti-devtools/tools/deploy.mjs`
- [ ] Self-check expansion: cross-origin iframe enumeration, SSE reconnection, TTL reuse regression
- [ ] npm package split: client/launcher (`aiti-launcher.js`) and mcp-server/client under independent versioning
- [ ] Standardized dual-injection mutual-exclusion detection (`window.__aiti` probing + debounce)

## Milestone Acceptance Criteria

- **R1**: `npx aiti-bridge` + `<script src>` working within 5 minutes; all 30+ self-checks pass; no `DBG_*` remnants
- **R2**: Vite/Vue plugins verified on three real projects; Chrome extension can inject into any site
- **R3**: vscode plugin completes an end-to-end bug-fix demo inside Copilot Chat
