---
title: Vue Project Plugin
icon: 🍃
ext:
  id: aiti-devtools-vue
  name: aiti-devtools-vue
  description: Vue project plugin — automatic local injection in dev (planned)
  soul: Every extra step of integration cost creates one more person who never integrates.
  type: vue-plugin
  version: 0.1.0
  status: planned
  publisher: aiti-ai
  website: https://aiti.pw
  npm: "@aiti-ai/aiti-devtools-vue"
  license: MIT
  tags: [vue, inject]
---

# aiti-devtools-vue

> 📋 **Planned (not published)**: this package is not implemented yet; Vue projects can currently integrate by reusing the [Vite plugin](vite.md).

The local injection plugin for Vue projects: automatic injection in dev mode, with a bridge protocol isomorphic to the Vite plugin's.

## How to Integrate Today (no need to wait for the package)

The vast majority of Vue projects are Vite projects — just install [aiti-devtools-vite](vite.md):

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [vue(), aitiDevtools({ mcp: { register: true } })],
});
```

Vue dev builds carry `__file` component source info built in, so when AI clicks an element it can locate the SFC file.

## The Planned Standalone Package

- One-line integration via `app.use()` (covers Vue projects on non-Vite build chains)
- **Component-level location**: selection → `{ framework:'vue', file, line, component }` (based on SFC compile info, more precise than `__file`)
- Automatically skipped when stacked with the Vite plugin (avoids double injection)

> See the roadmap on the [aiti-devtools product page](/en/products/aiti-devtools-plugins.md).
