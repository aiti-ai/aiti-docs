---
title: Manual Wiring (Express / Next, etc.)
icon: 🔌
ext:
  id: aiti-devtools-manual
  name: manual wiring
  description: Carriers without a dedicated plugin — wire up manually with aiti-devtools-core middleware (Express / Next / any Node HTTP service)
  soul: The bridge protocol is a public capability; it shouldn't be hijacked by any single framework.
  type: integration-guide
  status: active
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [express, next, manual, core]
---

# Manual Wiring: Express / Next / Any Node Service

Carriers without a dedicated plugin wire up directly with the public capability package `aiti-devtools-core`. core provides four **carrier-independent** things:

| Capability | API | Description |
|---|---|---|
| Bridge | `createBridge(dataDir)` | Bridge core instance |
| HTTP mounting | `connectBridge(bridge, opts)` | Standard connect middleware (express/koa/connect go straight into `app.use`) |
| Assets | `loadAssets()` | launcher/cockpit/bridge-client static assets |
| MCP registration | `registerMcp(opts)` | Writes the MCP endpoint into agent config at startup |

## Express

```js
// server.js — full runnable example: examples/aiti-express-demo
import express from 'express';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createBridge, connectBridge, loadAssets, registerMcp } from '@aiti-ai/aiti-devtools-core';

const app = express();
const bridge = createBridge(join(homedir(), '.pi', 'aiti-bridge'));

// No path prefix mounted — the middleware matches /aiti/* itself; everything else next()s through to the app routes
app.use(connectBridge(bridge, { prefix: '/aiti', staticFiles: loadAssets() }));

// Add the launcher script manually in the page
// <script src="/aiti/aiti-launcher.js" data-ai-url="/aiti/cockpit.html" data-bridge-url="/aiti"></script>

app.listen(5699, () => {
  // Aligned with the other carriers' capability: auto-register MCP at startup (whoever holds the port assembles the address — core never touches ports)
  registerMcp({ url: 'http://localhost:5699/aiti/mcp', serverName: 'aiti-devtools', targets: 'auto' });
});
```

## Next.js (single-port instrumentation)

Next has no official middleware hook for emitting HTML responses; use `instrumentation.ts` to patch Node HTTP when the server starts — one line of wiring, with bridge/assets/HTML injection/MCP registration all in core:

```ts
// instrumentation.ts — full runnable example: examples/aiti-next-demo
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'development') return;
  const { createRequire } = await import('node:module');
  const core = createRequire(process.cwd() + '/')('@aiti-ai/aiti-devtools-core');
  core.patchProcessHttp();   // bridge routes + HTML injection + MCP auto registration (address assembled from the PORT env)
}
```

```js
// next.config.mjs — keep core external (node resolves it at runtime + import.meta.url asset paths stay valid)
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ '@aiti-ai/aiti-devtools-core': 'commonjs aiti-devtools-core' });
      config.externals.push(/^node:/);
    }
    return config;
  },
};
```

## Other Node HTTP Services

The general recipe (same for Koa / Fastify / Hapi / bare http):

1. `createBridge(dataDir)` creates the bridge;
2. adapt `connectBridge(bridge, { prefix: '/aiti', staticFiles: loadAssets() })` into the framework's middleware format and mount it (Fastify via the `middleware` compatibility layer, bare http by matching the URL prefix manually);
3. prepend the launcher script tag to HTML responses;
4. (optional) `registerMcp({ url, ... })` auto-registers MCP.

> Frameworks with a mature wiring pattern are worth promoting to first-class plugins (like vite/webpack/nuxt); issue discussions are welcome.
