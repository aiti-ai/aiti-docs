---
title: Vite Plugin
icon: ⚡
ext:
  id: aiti-devtools-vite
  name: aiti-devtools-vite
  description: Vite plugin — automatic local injection in dev; one plugin line = the full same-origin /aiti/ suite
  soul: Every extra step of integration cost creates one more person who never integrates.
  type: vite-plugin
  version: 0.2.1
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vite"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-vite
    # vite.config.ts: plugins: [aitiDevtools()]
  license: MIT
  tags: [vite, inject]
---

# aiti-devtools-vite

> ❝ **Every extra step of integration cost creates one more person who never integrates.** ❞

The zero-config injection plugin for Vite projects: the dev server gets a built-in bridge/MCP (same-origin `/aiti/`) + automatic launcher injection + console + automatic agent-tool registration at startup. **dev-only, zero residue in production, no business code changes.** SvelteKit and other Vite-based frameworks work the same way.

## Installation

::: code-tabs

@tab npm

```bash
npm install -D @aiti-ai/aiti-devtools-vite
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-vite
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-vite
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-vite
```

:::

## Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // name: 'aiti-devtools-demo',   // multi-project coexistence: after renaming, the MCP entry/logs/source labels/console copy all follow
      // bridgeUrl: '',                // external bridge address (may carry extra path segments, auto-negotiated); empty = same-origin with the app
      // aiUrl: '',                    // aiti-agent address (AI window); empty = same-origin cockpit.html
      mcp: {
        register: true,   // auto-register MCP into agent tools at startup
        targets: 'auto',  // only writes to config files that already exist
        // dryRun: true,  // preview without writing to disk
      },
    }),
  ],
});
```

## Options (AitiDevtoolsOptions)

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | string | `'aiti-devtools'` | Identifier name: the MCP config entry/logs/source labels/console copy all follow it; change this for multi-project coexistence |
| `bridgeUrl` | string | same-origin | External bridge address (may carry extra path segments like `/aiti`, `/bridge`; auto-negotiated) |
| `aiUrl` | string | same-origin `cockpit.html` | AI window address |
| `mcp` | object | — | MCP registration options `{ register, targets, dryRun }` |
| `prefix` | string | `/aiti` | Mount prefix for bridge/MCP/assets |
| `inject` | boolean \| object | `true` | Inject the launcher script; `{ include, exclude }` control the scope |
| `assetsDir` | string | `assets/` inside the package | Assets directory (debugging hatch: point it at the repo's inject/dist to see launcher changes instantly) |
| `dataDir` | string | `~/.pi/aiti-bridge` | Bridge data directory (message sessions, etc.) |
| `log` | function | `console.log` | Log callback |

## Behavior

- dev-only: `astro build` / `vite build` production output gets zero injection
- launcher injection = script prepended to the response HTML; bridge/MCP/console mounted same-origin under `/aiti/`
- double-injection guard: the launcher dedupes via the `#__dbg_launcher` element marker (`__dbgLauncher` property) and skips if already injected
- framework detection: under Vite dev builds, React/Vue/Svelte automatically carry source-location info (`_debugSource`/`__file`/`__svelte_meta`)

## Verification

```bash
pnpm dev
curl -s http://localhost:5173/ | grep -o aiti-launcher   # the launcher script should appear in the HTML
# Open the page → the toolbar appears; /aiti/cockpit.html can open the console
```

Runnable examples: [examples/aiti-vite-demo](https://github.com/aiti-ai) (port 5199) · [SvelteKit example](../examples.md)

> For Astro projects use the wrapped [aitiAstro()](astro.md) — internally it is this plugin + head-inline injection.
