---
title: Nuxt Module
icon: 🟩
ext:
  id: aiti-devtools-nuxt
  name: aiti-devtools-nuxt
  description: Nuxt module — one line in modules = built-in MCP in the dev server + automatic injection
  soul: Every extra step of integration cost creates one more person who never integrates.
  type: nuxt-module
  version: 0.1.0
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-nuxt"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-nuxt
    # nuxt.config.ts: modules: ['@aiti-ai/aiti-devtools-nuxt']
  license: MIT
  tags: [nuxt, inject]
---

# aiti-devtools-nuxt

> ❝ **Every extra step of integration cost creates one more person who never integrates.** ❞

Nuxt module: one line in `modules` = built-in MCP in the dev server (bridge/MCP/launcher same-origin under `/aiti/`) + launcher auto-injected into the head + automatic agent-tool registration at startup. **The user changes no application files.**

## Installation

::: code-tabs

@tab npm

```bash
npm install -D aiti-devtools-nuxt
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-nuxt
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-nuxt
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-nuxt
```

:::

## Configuration

```ts
// nuxt.config.ts — the only place the user touches
export default defineNuxtConfig({
  modules: ['@aiti-ai/aiti-devtools-nuxt'],
  aitiDevtools: { mcp: { register: false } },   // optional, passes through AitiDevtoolsOptions
});
```

## Behavior

- The module internally mounts the [aiti-devtools-vite](vite.md) plugin (Nuxt dev runs on Vite underneath) + a Nitro/head injection fallback
- SSR-rendered HTML is injected too (head script)
- dev-only: `nuxt build` production output gets zero injection
- The `aitiDevtools` key passes the Vite plugin's options straight through (name/bridgeUrl/aiUrl/mcp…)

## Verification

```bash
pnpm dev --port 5599
curl -s http://localhost:5599/ | grep -o aiti-launcher   # the launcher script should appear in the HTML
```

Runnable example: [examples/aiti-nuxt-demo](../examples.md) (port 5599)
