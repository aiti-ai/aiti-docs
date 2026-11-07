---
title: Quick Start
icon: 🚀
description: "Get aiti running in 5 minutes: install the plugin → start the bridge → connect AI"
tags: [guide, quick-start]
---

# Quick Start

Get "AI operating your page" running in 5 minutes.

## Prerequisites

- Node.js ≥ 20
- A runnable web project (Vite / Vue / Next / plain HTML all work)

## Step 1: Injection (pick one)

### Option A: Build plugin (recommended, Vite example)

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

### Option B: Direct include (plain HTML / any project)

```html
<script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>
```

The launcher reads the `data-ai-url` / `data-bridge-url` attributes and starts automatically — no manual invocation needed.

Start the dev server; two buttons 💬 / 🎯 should appear at the bottom-right of the page.

## Step 2: Start the MCP Bridge

```bash
npx @aiti-ai/aiti-bridge --port 8777   # MCP endpoint is built into the bridge
```

The page should connect to the bridge automatically (refresh the page to confirm if needed).

## Step 3: Connect an AI agent

### Claude Code

```bash
npx @aiti-ai/aiti-bridge --register-shim   # one-shot registration of the `aiti` entry (idempotent; agents connect via the AITI_BRIDGE_URL env var)
```

### Cursor / VS Code Copilot Chat

Add a stdio server in MCP settings:

```json
{ "command": "node", "args": ["<bridge-install-dir>/bin/aiti-mcp-shim.cjs"], "env": { "AITI_BRIDGE_URL": "http://127.0.0.1:8777" } }
```

### aiti-agent (Web workbench)

Configure the same bridge address in an aiti-agent session (or expose it via service-tunnels).

## Step 4: Start the Conversation

```
Me: Use bridge_status to see which pageIds exist, then run page_snapshot on the default pageId
AI: Current page: http://localhost:5173 (Vue app, frameId=host), ready.
Me: Click the "Submit" button, then show me the console errors
AI: Clicked. Console error: TypeError: Cannot read properties of undefined (reading 'name') at src/components/Form.vue:42
Me: (user_confirm pops up a confirmation card automatically) Approve the fix
AI: Fixed Form.vue:42 — added a null-value fallback.
```

## Next steps

- [Developer Tools · Injection Principles](/en/devtools/inject.md)
- [MCP Bridge · Session System](/en/guide/mcp/session.md)
- [MCP Bridge · Adapting AI agents](/en/guide/mcp/ai-agents.md)
- [Master Plan](/en/roadmaps/master-plan.md)

## Another Path: Writing Extensions for aiti-agent

If your goal is to write extensions for aiti-agent (the pi-web workbench) rather than wiring up page debugging:

1. Copy the shared template `dev-repo/templates/ext-jsx-client/` (JSX + vite build, ready to use on copy), or read [Extension client JSX template](/en/extensions/ext-jsx-client.md);
2. Declare the entry (id / UI slots / server hooks) — the full contract is in `dev-repo/docs/dev-repo-authoring-reference.md` (the authoring reference);
3. **Pick the data tier before persisting**: config → `ctx.configDir`; non-regenerable persistent data (archives/history/statistics) → `ctx.stateDir`; regenerable data (indexes/venvs/logs) → `ctx.cacheDir` — the decision tree and iron rules are in [Extension Data and Storage Specification](/en/guide/ext-data.md);
4. Follow [Extension Services Specification](/en/guide/ext-services.md) for cross-extension calls and service exports; mark dialogs with `data-ext-float="1"` to get floating-window capability automatically; heavy bundles go through the [Lazy-Loading Contract](/en/guide/ext-lazy-loading.md);
5. Deploy: `node tools/deploy.mjs` → `~/.pi/web/extensions/` → `POST /api/extensions/reload`.
