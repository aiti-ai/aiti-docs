---
title: aiti-devtools
icon: 🛠️
description: In-page AI debugging assistant — the SDK itself, framework integrations, example matrix
keywords: in-page AI debugging, browser debug injection, CDP commands, Vite plugin, webpack plugin, Nuxt Astro integration, Inspector
---

# aiti-devtools

Bring AI to the page development scene: injected debug client + Inspector + MCP bridge, so AI and humans truly collaborate **on the same page**.

> ⚠️ **Same name, different thing**: the `aiti-devtools` in the [extension registry](/en/extensions/) is a **pi-web extension** (the injector/bridge/MCP server side in pi-web scenarios); this section is about the npm-published **SDK and framework plugins** — it is not an extension.

## Documentation Map

| Document | Content |
|---|---|
| [Quick Start](quick-start.md) | The fastest way to get started |
| [The SDK](core.md) | SDK/asset distribution (core+inject, served via framework plugins or the standalone bridge — no standalone npm package): manual script wiring + integration matrix overview |
| [Injection Mechanics](inject.md) | Local inject details, the three forms, host/iframe routing |
| [CDP Command Set](cdp-commands.md) | Reference for commands across 8 domains |
| [aiti-agent Extension Points](extension-points.md) | Extension framework: slots, contracts, lifecycle |

## Framework Integrations (integrations/)

| Carrier | npm package | How to integrate | Docs | Status |
|---|---|---|---|---|
| Vite / SvelteKit / any Vite project | `@aiti-ai/aiti-devtools-vite` | `aitiDevtools()` plugin | [vite](integrations/vite.md) | ✅ |
| webpack-dev-server | `@aiti-ai/aiti-devtools-webpack` | `new AitiDevtoolsWebpackPlugin()` | [webpack-rspack](integrations/webpack-rspack.md) | ✅ |
| Rspack | `@aiti-ai/aiti-devtools-webpack` (same package reused) | zero changes | [webpack-rspack](integrations/webpack-rspack.md) | ✅ Verified |
| Nuxt | `@aiti-ai/aiti-devtools-nuxt` | one-line `modules: ['@aiti-ai/aiti-devtools-nuxt']` | [nuxt](integrations/nuxt.md) | ✅ |
| Astro | `/astro` subpath export of `@aiti-ai/aiti-devtools-vite` | one-line `integrations: [aitiAstro()]` | [astro](integrations/astro.md) | ✅ |
| Vue projects | reuses `@aiti-ai/aiti-devtools-vite` | Vite-plugin fallback | [vue](integrations/vue.md) | 📋 Standalone package planned |
| Express / Next / other Node services | `@aiti-ai/aiti-devtools-core` | manual middleware wiring | [manual](integrations/manual.md) | ✅ Guide |

> Full npm scope: `@aiti-ai/aiti-devtools-{vite,webpack,nuxt,core,inject,agent,pi}` + `@aiti-ai/aiti-bridge` — see the [plugin matrix](/en/products/aiti-devtools-plugins.md) for the package-to-carrier mapping.

## Examples

Every carrier has a minimal runnable example (unified port range 5199-5899); see the [Example Matrix](examples.md).

## See Also

- [Product page](/en/products/aiti-devtools.md) · [devtools plugin matrix](/en/products/aiti-devtools-plugins.md)
- [IDE plugins](/en/ide/) (vscode / idea, planned)
- [MCP bridge](/en/guide/mcp/)
