---
title: Session System
icon: 🪪
description: pageId = instanceId/frameId, discovery, reuse, refresh-proof
tags: [guide, aiti-bridge, session, pageId]
---

# Session System (pageId)

The bridge's session model: **the AI uses a single word, `pageId`; everything else is automatic**.

## 1. ID ownership

| Concept | Semantics | Example |
|---|---|---|
| `instanceId` | Connection identity (assigned by the bridge) | Pages with a port in the URL use the port number `6513`; otherwise a random `qx482` |
| `frameId` | Target frame (CDP terminology) | `host` / `f0` / `f1` |
| `pageId` | Final configuration ID = instanceId/frameId | `01234/f0` |

- Page connects to the bridge: requests an `instanceId` → registers each `frameId` → assembles the `pageId`; **the page side is in control** and reports it to the bridge
- The bridge only registers and routes (pageId → instanceId to find the connection + frameId to find the target frame)
- The AI merely carries it: the pageId (default target frame) received at boot is passed back verbatim; multiple frames → one pageId per frame

## 2. Lifecycle (no disconnect on refresh)

```
Page opens → claim(instanceId + secret + pageKey)
  → localStorage persists {instanceId, secret} (keyed by pageKey)
  → reload / SSE disconnect (Page.reload etc.) → reuse the old instanceId within the TTL (default 10 minutes)
  → Only if: the old id is occupied by another active connection (conflict) or the TTL expired → generate a new id + update localStorage + notify the AI
```

- **The secret prevents cross-talk**: claiming with a reused old id must carry the secret; the bridge reuses only when `idRegistry[instanceId].secret` matches; on mismatch → reuse refused and a new id generated
- Effect: **only the original page can reuse its own pageId**, the old pageId held by the AI stays valid, and a reload executed over MCP does not disconnect

## 3. Discovery (AI side)

```bash
curl http://localhost:8777/bridge/sessions
```

```json
[
  {
    "instanceId": "01234",
    "frameId": "host",
    "pageId": "01234/host",
    "url": "http://localhost:5173",
    "frameworks": ["vue"],
    "active": true,
    "lastSeen": 1780000000000
  },
  {
    "instanceId": "01234",
    "frameId": "f0",
    "pageId": "01234/f0",
    "url": "http://localhost:5173/iframe-page",
    "frameworks": ["react"],
    "active": true,
    "lastSeen": 1780000000000
  }
]
```

Recommended bootstrapping for the AI: start with `bridge_status` (or `GET /bridge/sessions`) → pick the default pageId → carry the pageId in all subsequent operations.

## 4. Agent sessions (MCP side)

- After an agent connects to the bridge over MCP, the bridge registers it in the **agents registry** by `clientInfo.name` (or the agentId from `aiti_hello`)
- streamable HTTP session: `Mcp-Session-Id` associates the agent with a persistent stream (push-capable); stateless: no session, agents are told apart by the agentId parameter
- Agent disconnects: stream breaks → marked offline, registration info + outbox kept for a TTL (same TTL scheme as instanceId)
- Multiple agents online at once: each agent has an independent registry entry; `user_*` interactions carry the agentId (the window shows "who is asking"), with no cross-talk between them

## 5. Minimal configuration

- inspect only needs the AI address (`aiUrl`) passed in — the host assembles the environment (pageId); the AI window is usable as soon as it opens
- IDE plugins configure automatically: bridge address + token + the current project's pageId written into the MCP config, zero manual work for the user
- Without an aiUrl, the AI window opens cockpit (the onboarding page) by default, showing the bridge address and integration methods

> Related: [MCP Server](/en/guide/mcp/server.md) · [Integrating AI agents](/en/guide/mcp/ai-agents.md) · [cockpit](/en/guide/mcp/cockpit.md)
