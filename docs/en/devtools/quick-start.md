---
title: devtools Quick Start
icon: 🚀
description: 5 minutes to "AI operates your page" — inject → bridge → connect AI
tags: [devtools, quick-start]
---

# aiti-devtools Quick Start

Get "AI operating your page" running in 5 minutes. Looking to install the **aiti-agent web workbench** itself? See the [workbench quick start](/en/guide/quick-start.md) and [Installation](/en/guide/install.md).

## Prerequisites

- Node.js ≥ 20
- A runnable web project (Vite / Vue / Next / plain HTML all work)

## Step 1: Injection (pick one)

### Option A: project plugin (recommended, Vite example)

```bash
pnpm add -D @aiti-ai/aiti-devtools-vite
```

```ts
// vite.config.ts
import { aitiDevtools } from '@aiti-ai/aiti-devtools-vite';
export default defineConfig({
  plugins: [aitiDevtools({ bridgeUrl: 'http://localhost:8777' })],
});
```

### Option B: direct script (plain HTML / any project)

```html
<script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>
```

The launcher reads the `data-ai-url` / `data-bridge-url` attributes and starts automatically — no manual call needed (the internal global is `createDbgLauncher`; the standard path never calls it).

### Option C: IDE plugin (zero code changes)

Install `aiti-devtools-vscode` ([shipped MVP](/en/ide/vscode.md), proxies the dev server and injects in one click); idea is planned.

Start the dev server — 💬 / 🎯 buttons should appear bottom-right on the page.

## Step 2: Start the MCP bridge

```bash
npx @aiti-ai/aiti-bridge --port 8777   # MCP endpoint built into the bridge
```

The page should connect to the bridge automatically (refresh to confirm).

## Step 3: Connect an AI agent

### Claude Code

```bash
npx @aiti-ai/aiti-bridge --register-shim   # one-line aiti entry registration (idempotent; agent picks it up via env AITI_BRIDGE_URL)
```

### Cursor / VS Code Copilot Chat

Add a stdio server in the MCP settings:

```json
{ "command": "node", "args": ["<bridge-install-dir>/bin/aiti-mcp-shim.cjs"], "env": { "AITI_BRIDGE_URL": "http://127.0.0.1:8777" } }
```

### aiti-agent (web workbench)

Configure the same bridge address in an aiti-agent session (or expose it via service-tunnels).

## Step 4: Start the conversation

```
Me: use bridge_status to list the pageIds, then run page_snapshot on the default one
AI: current page: http://localhost:5173 (Vue app, frameId=host), ready.
Me: click the "Submit" button, then show me the console errors
AI: clicked. Console error: TypeError: Cannot read properties of undefined (reading 'name') at src/components/Form.vue:42
Me: (user_confirm card pops up) approve the fix
AI: fixed Form.vue:42 — added a null-value fallback.
```

## Next steps

- [Developer tools · injection internals](/en/devtools/inject.md)
- [MCP bridge · session system](/en/guide/mcp/session.md)
- [MCP bridge · retrofit AI agents](/en/guide/mcp/ai-agents.md)
- [Master plan](/en/roadmaps/master-plan.md)
