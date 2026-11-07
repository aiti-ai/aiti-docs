---
title: aiti-devtools Plugin Matrix
icon: 🧩
description: Vite / Webpack / Nuxt / Astro / Next / Express / SvelteKit carrier plugins — embedded into mainstream dev tools, dev-server built-in MCP + local injection
tags: [product, aiti-devtools, vite, webpack, nuxt, astro, next, inject]
---

# aiti-devtools Plugin Matrix — Embedded into Mainstream Dev Tools, Local Injection

> **In one sentence**: package aiti-devtools' injection capability as **zero-config plugins** for mainstream development tools — auto-injected in dev mode, **local injection**: no business code changes, no CDN dependency, never ships to production.

## 1. Design Principles

| Principle | Notes |
|---|---|
| Local injection | Plugins bundle the injection script into the artifact at build/dev time; no remote loading |
| dev-only | Injected in dev mode only by default; production builds carry zero residue and zero size |
| Zero config | `pnpm add -D` + one line to enable; the framework is auto-detected |
| Compatible with forms ①②③ | The `aiti-devtools` client injected by plugins is fully isomorphic to a manual `<script>` include, with the same bridge protocol |
| Source locating | Dev builds automatically carry `_debugSource` / `__file` / `__svelte_meta`, so AI errors can locate to source |

## 2. Plugin Matrix

| Carrier | Package / Integration | How to Integrate | Capabilities | Status |
|---|---|---|---|---|
| Vite | `aiti-devtools-vite` | `plugins: [aitiDevtools()]` in `vite.config.ts` | dev-server built-in bridge/MCP (same-origin `/aiti/`) + launcher injection + auto registration | ✅ 0.1.x |
| Webpack / Rspack | `aiti-devtools-webpack` | `plugins: [new AitiDevtoolsWebpackPlugin()]` | same as above (setupMiddlewares + html-webpack-plugin injection; Rspack reuses it directly) | ✅ 0.1.x |
| Nuxt | `aiti-devtools-nuxt` | one line: `modules: ['@aiti-ai/aiti-devtools-nuxt']` | same as above (module mounts the bridge + auto head injection) | ✅ 0.1.x |
| Astro | `aiti-devtools-vite/astro` | one line: `integrations: [aitiAstro()]` | internally mounts the Vite plugin: bridge/MCP + auto injection, no page file changes | ✅ |
| Next.js | via direct `aiti-devtools-core` integration | `instrumentation.ts` starts the bridge + response injection | bridge/MCP + injection (no separate next package) | ✅ example |
| Express | via `aiti-devtools-core` middleware | `app.use()` mounts the bridge + injection | bridge/MCP + injection | ✅ example |
| SvelteKit | reuses the Vite plugin | `aitiDevtools()` in `vite.config.js` | same as the Vite carrier | ✅ example |
| Vue-specific / React / Svelte-specific plugins | — | — | deep framework integration such as component hierarchy info | 📋 planned |

> Full options and verification methods for each plugin are in the usage docs: [Vite](/en/devtools/integrations/vite.md) · [webpack/Rspack](/en/devtools/integrations/webpack-rspack.md) · [Nuxt](/en/devtools/integrations/nuxt.md) · [Astro](/en/devtools/integrations/astro.md) · [Vue (planned)](/en/devtools/integrations/vue.md) · [Manual wiring](/en/devtools/integrations/manual.md) · [Example matrix](/en/devtools/examples.md)

## 3. Integration Examples

### Installation (npm / yarn / pnpm / bun)

Pick the package by carrier; any package manager works:

::: code-tabs

@tab Vite / SvelteKit / Astro

```bash
# npm
npm install -D @aiti-ai/aiti-devtools-vite
# yarn
yarn add -D @aiti-ai/aiti-devtools-vite
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-vite
# bun
bun add -D @aiti-ai/aiti-devtools-vite
```

@tab Webpack / Rspack

```bash
# npm
npm install -D aiti-devtools-webpack html-webpack-plugin
# yarn
yarn add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
# bun
bun add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab Nuxt

```bash
# npm
npm install -D aiti-devtools-nuxt
# yarn
yarn add -D @aiti-ai/aiti-devtools-nuxt
# pnpm
pnpm add -D @aiti-ai/aiti-devtools-nuxt
# bun
bun add -D @aiti-ai/aiti-devtools-nuxt
```

:::

### Vite (most common)

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // name: 'aiti-devtools-demo',   // identifier for coexisting projects
      // bridgeUrl: '',                // external bridge address; empty = same origin as the app
      // aiUrl: '',                    // AI window address; empty = same-origin cockpit.html
      mcp: { register: true, targets: 'auto' },   // auto-register MCP on startup
    }),
  ],
});
```

### Nuxt (one-line modules)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@aiti-ai/aiti-devtools-nuxt'],
});
```

### Astro (one-line integrations)

```mjs
// astro.config.mjs
import { aitiAstro } from '@aiti-ai/aiti-devtools-vite/astro';

export default defineConfig({
  integrations: [aitiAstro()],   // internally mounts the Vite plugin: bridge/MCP + auto injection
});
```

### Webpack / Rspack

```js
// webpack.config.js
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  plugins: [new AitiDevtoolsWebpackPlugin()],
};
```

## 4. Injection Principles (the Local Injection Pipeline)

```
plugin registers → dev server response (HTML or first-screen script)
  → prepend injection (same semantics as transformResponse, executes earliest)
  → createAitiLauncher initializes → window.__aiti exposed
  → Inspector UI mounts → (optional) connects to the MCP bridge over SSE
  → host page/same-origin iframe injection (injectAllIframes / MutationObserver fallback for dynamic iframes)
  → cross-origin iframes skipped (enumerable but not targetable for execution)
```

- The injection callback semantics match `service-tunnels`' `transformResponse` (`scriptFor` returns a prepend); **the same injection script is reusable across all three forms**.
- `pageId = instanceId/frameId`: one `frameId` per addressable document/frame (`host` / `f0` / `f1`…); the AI only needs one `pageId` to target it.

## 5. Relationship with IDE Plugins

IDE plugins (vscode/idea) can **replace or stack with** the in-project plugins described here:

| Scenario | Which to Use |
|---|---|
| Project developed inside an IDE, and dev dependencies are allowed | in-project plugin (vite/vue/…) |
| Do not want to touch the project, want zero-dependency injection | IDE plugin auto injection (proxy dev server / port forwarding) |
| Both present | the IDE plugin detects existing injection and skips, avoiding double injection |

> Product positioning: [aiti-bridge](/en/products/aiti-bridge.md); IDE plugins: [IDE plugins](/en/products/aiti-ide-plugins.md); usage docs: [aiti-devtools · framework integrations](/en/devtools/integrations/vite.md).
