---
title: devtools Quick Start
icon: 🚀
description: The fastest way to get started
tags: [devtools, quick-start]
---

# aiti-devtools Quick Start

## Option 1: Vite project (recommended)

```bash
pnpm add -D @aiti-ai/aiti-devtools-vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';

export default defineConfig({
  plugins: [
    aitiDevtools({
      // Optional: MCP bridge
      bridge: { base: 'http://localhost:8777', token: 'dev' },
      // Optional: AI session page
      aiUrl: 'http://localhost:30141/ai/chat',
    }),
  ],
});
```

After `pnpm dev`, the 💬 (AI) / 🎯 (Inspector) buttons appear at the bottom-right corner of the page.

## Option 2: Plain HTML / any project

```html
<script src="aiti-devtools/inject.js"></script>
<script>
  createAitiLauncher('http://localhost:3000/todo', {
    aiUrl: 'http://localhost:30141/ai/chat?session=abc', // Optional
    bridgeBase: 'http://localhost:8777',                  // Optional
    bridgeToken: 'dev',
  });
</script>
```

## Option 3: IDE plugin (zero code changes)

Install `aiti-devtools-vscode` / `aiti-devtools-idea` (planned): one-click injection + automatic bridge configuration.

## Verification

1. Open the page and confirm the 💬 / 🎯 buttons appear
2. Click 🎯 to enter the Inspector; pick any element in three clicks and the HUD shows its information
3. (With a bridge running) `curl http://localhost:8777/bridge/sessions` shows this page's `pageId`

## Next Steps

- How injection works: [inject](/en/devtools/inject.md)
- Connecting AI: [MCP bridge · AI agents](/en/guide/mcp/ai-agents.md)
- Command reference: [CDP Command Set](/en/devtools/cdp-commands.md)
