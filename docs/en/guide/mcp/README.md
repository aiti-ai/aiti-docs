---
title: MCP Bridge
icon: 🔗
description: aiti-bridge documentation — let any AI agent operate pages and collaborate with the user
tags: [guide, aiti-bridge, mcp, ai-agent]
---

# MCP Bridge (aiti-bridge)

Let the AI talk to your pages. Guides for configuring aiti-devtools usage, retrofitting any AI agent, reaching IDE AI windows directly, and onboarding to the universal AI window (cockpit).

| Document | Content |
|---|---|
| [Server](/en/guide/mcp/server.md) | Startup, endpoints, transports (incl. Streamable HTTP), MCP tool reference (incl. aiti_inbox) |
| [Session system](/en/guide/mcp/session.md) | pageId = instanceId/frameId, discovery, reuse, no disconnect on refresh |
| [Integrating AI agents](/en/guide/mcp/ai-agents.md) | Capability matrix, per-agent integration, the aiti_inbox main channel |
| [Agent prompt examples](/en/guide/mcp/prompts.md) | Bootstrapping prompts for each agent when integrating without an AI window (copy and use) |
| [Universal AI window cockpit](/en/guide/mcp/cockpit.md) | Onboarding page + address configuration hub + console, three integration paths |

## In one sentence

**aiti-bridge turns "page debugging capabilities" into standard MCP tools for any AI agent**: any MCP-capable agent (Claude Code / Cursor / IDE AI / aiti-agent / any CLI) can operate pages, pick elements and ask the user once configured; on the human side, the **universal AI window (cockpit)** displays/configures the bridge address, guides agents through onboarding, and serves as the human-AI collaboration console in the MCP fallback mode.

## Quick start

```bash
# 1. Start the bridge (local service, default 8777)
npx @aiti-ai/aiti-bridge --port 8777

# 2. Inject aiti-devtools into the page (Vite example)
pnpm add -D @aiti-ai/aiti-devtools-vite
# enable the plugin in vite.config.ts; the 💬 / crosshair (Inspector) buttons appear at the bottom-right of dev pages

# 3. Point any MCP client at the bridge (one-shot stdio shim registration, idempotent)
npx @aiti-ai/aiti-bridge --register-shim   # agents connect via the AITI_BRIDGE_URL env var
# or point an MCP client straight at the HTTP endpoint: http://127.0.0.1:8777/aiti/mcp/mcp

# 4. Let the AI start debugging
# "Use bridge_status to see which pageIds exist, then run page_snapshot on 01234/f0"
```

## Core concepts at a glance

| Concept | Description |
|---|---|
| `pageId` | `instanceId/frameId`; the AI pins down the target page with a single word (see [Session system](/en/guide/mcp/session.md)) |
| `page_*` tools | Operate/read pages (page_exec / page_snapshot / bridge_status) |
| `user_*` tools | Human collaboration (pick/confirm/choose/input/presence/notify) |
| `aiti_inbox` | **Main message channel**: human messages / async answers / page events enter the queue and the agent polls them via the tool — works 100% with any agent (see [Integrating AI agents](/en/guide/mcp/ai-agents.md)) |
| cockpit | Universal AI window: onboarding + address configuration + human-side console (see [cockpit](/en/guide/mcp/cockpit.md)) |

> Related: [Product page · aiti-bridge](/en/products/aiti-bridge.md) · [Architecture](/en/guide/architecture.md)
