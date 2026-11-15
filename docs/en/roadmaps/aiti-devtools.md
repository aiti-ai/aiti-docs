---
title: aiti-devtools Roadmap
icon: 🛠️
description: Local injection ecosystem plan — core packages + carrier plugin matrix
tags: [roadmap, aiti-devtools]
---

# aiti-devtools Roadmap (Local Injection Ecosystem)

> Core goal: **embed into every mainstream development tool, inject locally**, and bring AI to the live scene of page development.
> **Current-state baseline**: aiti-devtools has no standalone npm package; it ships bundled with pi-web + carrier plugins. Per-item status lives in the [Product Matrix](/en/products/README.md).

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **R0 · Protocol** | Injection/bridge/session protocol end-to-end | Injection script + MCP bridge + pageId session system + user_* interaction tool family end-to-end; full bridge endpoints | ✅ |
| **R1 · Core usable** | Developers work out of the box | npm package matrix published: core / inject / vite / webpack / nuxt / bridge (independent versioning); remaining: `DBG_*` → `AITI_*` unification, self-check inventory to 30+, README/demo polish | 🚧 |
| **R2 · Plugin matrix** | Embed into mainstream dev tools | vite/webpack/nuxt ✅ published; browser-ext (form ②) 🚧 source-ready pending store listings; vue/react/svelte reuse the Vite plugin for now (deep integration 📋); aiti-bridge config minimization wrap-up | 🚧 |
| **R3 · IDE plugins** | Complete injection + straight into AI windows | vscode 0.3.x source-ready (see the [aiti-bridge roadmap](/en/roadmaps/aiti-bridge.md)); idea 📋 | 🚧 |
| **R4 · Platform** | Open ecosystem | public injection protocol/script spec, extension marketplace, contribution guide | 📋 |

## Plugin Matrix (R2)

| Plugin | Package | Injection Point | Status |
|---|---|---|---|
| Vite | `@aiti-ai/aiti-devtools-vite` | transformIndexHtml / middleware prepend | ✅ 0.1.x on npm (incl. Astro Integration; Vue/SvelteKit reuse it directly) |
| Webpack / Rspack | `@aiti-ai/aiti-devtools-webpack` | setupMiddlewares + html-webpack-plugin hooks | ✅ 0.1.x on npm (Rspack reuses it directly) |
| Nuxt | `@aiti-ai/aiti-devtools-nuxt` | one-line `modules` hookup: bridge mount + head auto-injection | ✅ 0.1.x on npm |
| Chrome extension (form ②) | browser-ext (`@aiti-ai/aiti-devtools-browser-ext`, npm release pending) | zero-code injection into any site | 🚧 v0.1.x source-ready; store assets & publishing guide done, submissions to the three stores pending |
| Next.js | — | dev server response injection + `_debugSource` | 📋 not started |
| Vue / React / Svelte deep integration | — | component tree / framework metadata | 📋 P2 evaluation (Vite plugin reuse for now) |
| JetBrains (idea) | — | see the [aiti-bridge roadmap](/en/roadmaps/aiti-bridge.md) | 📋 |

## Tech Debt and Todos

- [ ] `DBG_*` → `AITI_*` env var unification (in progress: 22 remnants in product sources, e.g. `DBG_OPEN_CMD` → `AITI_OPEN_CMD`)
- [ ] Materialize the self-check inventory: currently comment-level references only; turn it into a runnable suite and expand to 30+ (cross-origin iframe enumeration, SSE reconnection, TTL reuse regression)
- [ ] Standardized dual-injection mutual-exclusion detection (`window.__aiti` probing + debounce)

> ✅ Done: npm package split (client/launcher and core/mcp under independent versioning, all published).

## Milestone Acceptance Criteria

- **R1**: package matrix working out of the box (`npx @aiti-ai/aiti-bridge` + a carrier plugin within 5 minutes); all 30+ self-checks pass; no `DBG_*` remnants
- **R2**: browser-ext listed on the three stores; vite/webpack/nuxt continuously regression-tested on real projects
- **R3**: vscode marketplace release + an end-to-end bug-fix demo recorded inside Copilot Chat
