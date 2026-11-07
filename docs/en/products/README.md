---
title: Product Matrix
icon: 🗂️
description: The complete aiti product matrix — covering the entry layer / injection layer / bridge layer / Agent layer
keywords: aiti-agent, aiti-devtools, aiti-bridge, self-hosted AI workbench, page injection SDK, docker AI development
---

# Product Matrix

aiti is not a single product but an **AI development tool ecosystem**. All products share one brand, one protocol, and one npm scope (`@aiti-ai`).

## 1. Matrix Overview

| # | Product | npm Package | Form | One-Line Positioning | Status |
|---|---|---|---|---|---|
| 1 | **aiti-agent** | `@aiti-ai/aiti-agent` | Web app + Docker image | Self-hosted personal AI development workbench (**built on pi-web**), browser as the primary operating surface, compatible with and same-source as pi CLI / pi IDE extensions | 🚧 M0-M4 |
| 2 | **aiti-core** | `@aiti-ai/aiti` | SDK (protocol/types/shared library) | Shared by all products: bridge protocol, `pageId` session model, injection script, MCP tool definitions | 📋 |
| 3 | **aiti-devtools** | `@aiti-ai/aiti-devtools` | Injection SDK (`inject.js`) | In-page AI debugging assistant: `aiti-devtools` + Inspector + MCP bridge (form ① active adaptation) | ✅ 0.2.x |
| 4 | **aiti-devtools-vite** | `@aiti-ai/aiti-devtools-vite` | Vite plugin | dev server auto injection, **local inject** | 📋 |
| 5 | **aiti-devtools-vue** | `@aiti-ai/aiti-devtools-vue` | Vue plugin | Injection inside Vue apps (one-line `app.use`) | 📋 |
| 6 | **aiti-devtools-next** | `@aiti-ai/aiti-devtools-next` | Next.js plugin | Framework-level injection (dev build + `_debugSource` source locating) | 📋 |
| 7 | **aiti-devtools-react** | `@aiti-ai/aiti-devtools-react` | React plugin | Injection into React projects | 📋 |
| 8 | **aiti-devtools-svelte** | `@aiti-ai/aiti-devtools-svelte` | Svelte plugin | Injection into Svelte projects | 📋 |
| 9 | **aiti-bridge** | `@aiti-ai/aiti-bridge` | Local bridge service (CLI) | **Configures aiti-devtools usage**, enables any AI agent, delivers messages straight into IDE AI windows | 🚧 bridge working |
| 10 | **aiti-devtools-vscode** | `@aiti-ai/aiti-devtools-vscode` | VS Code extension | Completes injection + connects straight to the IDE's built-in AI agent window | 🚧 MVP |
| 11 | **aiti-devtools-idea** | `@aiti-ai/aiti-devtools-idea` | JetBrains plugin | Same as above (IntelliJ / PyCharm / WebStorm / GoLand) | 📋 |
| 12 | **aiti-devtools-chrome** | `@aiti-ai/aiti-devtools-chrome` | Chrome extension | Code-free injection (form ②), any site debuggable | 📋 |
| 13 | **aiti-docs** | `@aiti-ai/aiti-docs` | Documentation site (this website) | VuePress docs + product matrix + roadmaps | ✅ this page |

> Brand and identity: GitHub org `aiti-ai` · website `https://aiti.pw` · npm scope `@aiti-ai` · MIT license.

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ L4 Entry      aiti-agent (Web workbench) · IDE plugins ·     │
│               Chrome ext                                     │
│               Unified surface: sessions / services /         │
│               terminal / desktop / debugging                 │
├─────────────────────────────────────────────────────────────┤
│ L3 Agent      Enable any AI agent (MCP client)               │
│               Claude Code · Cursor · IDE built-in AI · aiti-agent │
├─────────────────────────────────────────────────────────────┤
│ L2 Bridge     aiti-bridge              │
│               Configures aiti-devtools · pageId sessions ·   │
│               SSE page bridge                                │
├─────────────────────────────────────────────────────────────┤
│ L1 Injection  aiti-devtools + vite/vue/next/react/svelte     │
│               aiti-devtools client · Inspector · CDP-like    │
│               command set · local injection                  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Products | Responsibility |
|---|---|---|
| **L1 Injection layer** | aiti-devtools series | Inject the debugging client into the **page being developed**: the `aiti-devtools` mini client, Inspector floating UI, an 8-domain 42-command CDP-like command set, framework source locating (React/Next/Vue/Svelte) |
| **L2 Bridge layer** | aiti-bridge / server | Let AI converse with the page: MCP tools (`page_exec` / `page_snapshot` / `bridge_status` / `user_*`), the `pageId = instanceId/frameId` session system, SSE long connection, event broadcasting (open_file etc.) |
| **L3 Agent layer** | Any MCP client | Wire bridge results into your AI: Claude Code, Cursor, IDE built-in AI, aiti-agent can all serve as the host agent |
| **L4 Entry layer** | aiti-agent / IDE plugins | The end user's operating surface: browser workbench; IDE plugins handle one-click injection completion + delivering messages into the IDE's AI agent window |

## 3. Three Main Lines

### Main Line A: aiti-agent — the Main Web Battleground

A self-hosted personal AI development workbench powered by **pi**. Built on the open-source project **agegr/pi-web** (including the ecosystem's only service-tunnels / queue recovery), with an independent product identity. See [Project Origin](/en/guide/origin.md) for the backstory.

- Form: single Docker container (lite/full) → browser + mobile
- Five capability layers: UI layer → debug visualization layer (CDP/VNC/ttyd) → exposure layer (service-tunnels) → execution layer (pi agent SDK) → data layer (shared JSONL + queue persistence)
- Details: [aiti-agent](/en/products/aiti-agent.md)

### Main Line B: aiti-devtools — the Local Injection Ecosystem

Bringing AI to the live scene of page development. **Embedded into every mainstream development tool** (Vite / Vue / Next / React / Svelte), **local injection**, no business code changes needed.

- Form ①: active adaptation by developers (`<script src="aiti-devtools/inject.js">`)
- Form ②: Chrome extension / platform built-in (no code changes)
- Form ③: IDE plugins (vscode / idea) auto injection
- Details: [aiti-devtools](/en/products/aiti-devtools.md) and the [devtools plugin matrix](/en/products/aiti-devtools-plugins.md)

### Main Line C: aiti-bridge — AI Agent Enablement

The bridge-layer product. **Configures aiti-devtools usage**, **enables AI agents**, and supports aiti-devtools and plugins such as aiti-devtools-vscode/idea to **complete injection**; through **aiti-bridge, messages are sent directly to the AI agent window inside the IDE**.

- Details: [aiti-bridge](/en/products/aiti-bridge.md) and [IDE plugins](/en/products/aiti-ide-plugins.md)

## 4. End-to-End Scenarios

### Scenario 1: AI fixes a bug inside the IDE (vscode/idea plugins + aiti-bridge)

```
IDE opens the project → aiti-devtools-vscode injects automatically (dev server or prebuilt)
  → user asks the AI: "clicking this button on the home page does nothing, help me investigate"
  → the IDE AI agent calls page_exec via aiti-bridge (click the button → collect console errors)
  → the bridge returns the result to the IDE AI window; the AI locates the source file (open_file opens it automatically)
  → the AI proposes a fix, and may even ask via user_confirm whether to apply it directly
```

### Scenario 2: aiti-agent remote debugging

```
docker run aiti → open the workbench in the browser → the page's dev environment gets aiti-devtools injected
  → the workbench AI session is exposed via service-tunnels → CDP 9222 / noVNC 6080 visual remote debugging
```

## 5. Protocols and Conventions

| Convention | Value |
|---|---|
| Bridge protocol | `aiti-devtools` message envelope + MCP JSON-RPC + SSE page bridge |
| Session ID | `pageId = instanceId/frameId` (e.g. `01234/f0`), TTL retention, secret anti-cross-talk |
| Naming | `token → instanceId` (connection identity), `uid → frameId` (target frame), combined = `pageId` |
| Env vars | unified `AITI_*` (e.g. `AITI_OPEN_CMD`, `AITI_BRIDGE_PORT`) |
| npm scope | `@aiti-ai/*` (bare 3-4 letter names rejected by npm anti-squatting controls) |
| Domain | `aiti.pw` (website / docs / MCP endpoints) |

> Next section: [Guide · What is aiti](/en/guide/what-is-aiti.md)
