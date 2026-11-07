---
title: webpack / Rspack Plugin
icon: 📦
ext:
  id: aiti-devtools-webpack
  name: aiti-devtools-webpack
  description: webpack-dev-server plugin — one plugin = built-in MCP in the dev server + automatic injection (reused directly by Rspack)
  soul: Every extra step of integration cost creates one more person who never integrates.
  type: webpack-plugin
  version: 0.1.0
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-webpack"
  install: |
    pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
    # webpack.config.js: plugins: [new AitiDevtoolsWebpackPlugin()]
  license: MIT
  tags: [webpack, rspack, inject]
---

# aiti-devtools-webpack

> ❝ **Every extra step of integration cost creates one more person who never integrates.** ❞

A webpack-dev-server plugin: a thin carrier layer with the same capabilities as the [Vite plugin](vite.md) — built-in bridge/MCP in the dev server (same-origin `/aiti/`) + launcher injection + console + automatic agent-tool registration at startup. Reuses all public capabilities of `aiti-devtools-core`.

**Rspack reuses it directly**: `@rspack/dev-server`'s `setupMiddlewares` has the same format as webpack's, and html-webpack-plugin has a compatibility layer — no package swap needed.

## Installation

::: code-tabs

@tab npm

```bash
npm install -D aiti-devtools-webpack html-webpack-plugin
```

@tab yarn

```bash
yarn add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab pnpm

```bash
pnpm add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

@tab bun

```bash
bun add -D @aiti-ai/aiti-devtools-webpack html-webpack-plugin
```

:::

## Configuration

```js
// webpack.config.js
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  mode: 'development',
  entry: './src/index.js',
  devServer: { port: 5299, hot: true },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new AitiDevtoolsWebpackPlugin({
      // name: 'aiti-devtools-demo',  // multi-project coexistence identifier
      // bridgeUrl: '',               // external bridge address; empty = same-origin
      mcp: { register: true, targets: 'auto' },
    }),
  ],
};
```

### Rspack

```js
// rspack.config.mjs — same package, zero changes
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { AitiDevtoolsWebpackPlugin } from '@aiti-ai/aiti-devtools-webpack';

export default {
  mode: 'development',
  entry: './src/index.js',
  devServer: { port: 5399 },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new AitiDevtoolsWebpackPlugin({ mcp: { register: false } }),
  ],
};
```

Verification points: ① `@rspack/dev-server`'s `setupMiddlewares` ② the html-webpack-plugin compatibility layer — both have been verified in practice.

## Behavior

- Mounts bridge/MCP/assets via `devServer.setupMiddlewares` (same-origin `/aiti/`); html-webpack-plugin injects the launcher script
- dev-only, zero residue in production builds
- Pure API projects with no HTML pages: the launcher is not injected, but the bridge/MCP remain available as usual (via a manual script tag or by connecting through the console)

## Verification

```bash
pnpm dev
curl -s http://localhost:5299/ | grep -o aiti-launcher   # the launcher script should appear in the HTML
```

Runnable examples: [examples/aiti-webpack-demo](../examples.md) (5299) · [aiti-rspack-demo](../examples.md) (5399)
