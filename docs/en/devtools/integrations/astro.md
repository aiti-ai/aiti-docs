---
title: Astro Integration
icon: 🚀
ext:
  id: aiti-devtools-astro
  name: aiti-devtools-astro
  description: Astro integration — one line in integrations = bridge/MCP + automatic injection across all pages (SSR pages included)
  soul: If the official mechanism can do it, you shouldn't invent a private workaround.
  type: astro-integration
  version: 0.2.1
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vite"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-vite
    # astro.config.mjs: integrations: [aitiAstro()]
  license: MIT
  tags: [astro, inject]
---

# aitiAstro() — Astro Integration

Integration via Astro's **official Integration mechanism** (bundled with `@aiti-ai/aiti-devtools-vite`, no separate package): internally mounts the Vite plugin (bridge/MCP/assets under `/aiti/`) + `injectScript('head-inline')` auto-injects the launcher — SSR-rendered HTML is injected too, with no page files to change.

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

```js
// astro.config.mjs — just one line on the user side
import { defineConfig } from 'astro/config';
import { aitiAstro } from '@aiti-ai/aiti-devtools-vite/astro';

export default defineConfig({
  integrations: [aitiAstro({ mcp: { register: false } })],
});
```

## Behavior

- Inside the `astro:config:setup` hook:
  - `updateConfig` mounts the [aitiDevtools()](vite.md) Vite plugin → bridge/MCP/console same-origin under `/aiti/`
  - `injectScript('head-inline')` dynamically creates the launcher script tag (Astro 5 has no head-prepend stage; inline code is the fallback)
- dev-only: returns immediately when `command !== 'dev'`; `astro build` production output gets zero injection
- Options are identical to the Vite plugin's (prefix/bridgeUrl/aiUrl/name…)

## Why Not Attach Astro with the Bare Vite Plugin?

It's possible (SvelteKit integrates exactly that way), but Astro's SSR pages don't go through the Vite transform pipeline, so the bare plugin can't inject into them; the Integration's `injectScript` is the official mechanism — full-page coverage and upgrade-safe.

## Verification

```bash
pnpm dev --port 5499
curl -s http://localhost:5499/ | grep -o aiti-launcher   # the launcher script should appear in the HTML
```

Runnable example: [examples/aiti-astro-demo](../examples.md) (port 5499)
