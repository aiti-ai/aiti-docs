---
title: Product Matrix
icon: 🗂️
description: The complete aiti product matrix — covering the entry layer / injection layer / bridge layer / Agent layer
keywords: aiti-agent, aiti-devtools, aiti-bridge, self-hosted AI workbench, page injection SDK, docker AI development
---

# Product Matrix

aiti is not a single product but an **AI development tool ecosystem**. All products share one brand, one protocol, and one npm scope (`@aiti-ai`).

## 1. Matrix Overview

> Status legend: ✅ published & usable · 🚧 source ready / in progress · 📋 planned

| # | Product | npm Package / Release Form | Form | One-Line Positioning | Status |
|---|---|---|---|---|---|
| 1 | **aiti-agent** | [`@aiti-ai/pi-web`](https://www.npmjs.com/package/@aiti-ai/pi-web) · Docker [`aitiai/pi-web`](https://hub.docker.com/r/aitiai/pi-web) (core/full) | Web app + Docker image | Self-hosted personal AI development workbench (**built on pi-web**, ships 63+ bundled extensions); the browser is the primary operating surface, same-source compatible with pi CLI / pi IDE extensions | ✅ 0.15.x |
| 2 | **aiti-devtools** | shipped as a bundled pi-web extension + carrier plugins (no standalone npm package) | Injection SDK (`aiti-launcher.js`) | In-page AI debugging assistant: client + Inspector + MCP bridge (form ① active adaptation) | ✅ 0.2.x |
| 3 | **aiti-devtools-vite** | [`@aiti-ai/aiti-devtools-vite`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-vite) | Vite plugin | dev-server auto injection (includes the Astro integration; SvelteKit reuses it directly), **local injection** | ✅ 0.1.x |
| 4 | **aiti-devtools-webpack** | [`@aiti-ai/aiti-devtools-webpack`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-webpack) | Webpack/Rspack plugin | dev-server injection (setupMiddlewares + html-webpack-plugin); Rspack reuses it directly | ✅ 0.1.x |
| 5 | **aiti-devtools-nuxt** | [`@aiti-ai/aiti-devtools-nuxt`](https://www.npmjs.com/package/@aiti-ai/aiti-devtools-nuxt) | Nuxt module | one-line `modules` integration: mounts the bridge + auto head injection | ✅ 0.1.x |
| 6 | **aiti-bridge** | [`@aiti-ai/aiti-bridge`](https://www.npmjs.com/package/@aiti-ai/aiti-bridge) | Local bridge service (CLI) | Turns page debugging into MCP tools for any AI agent (`page_*` / `user_*`); delivers messages straight into IDE AI windows | ✅ 0.2.x |
| 7 | **aiti-devtools-vscode** | source ready (VS Code / Cursor / Windsurf; marketplace release pending) | VS Code extension | Completes injection + connects straight to the IDE's built-in AI agent window | 🚧 MVP |
| 8 | **aiti-devtools-idea** | 📋 planned | JetBrains plugin | Same as above (IntelliJ / PyCharm / WebStorm / GoLand) | 📋 |
| 9 | **aiti-devtools-chrome** | 📋 planned | Chrome extension | Code-free injection (form ②), any site debuggable | 📋 |
| 10 | **aiti-devtools-vue / -react / -svelte** | 📋 planned (Vue / SvelteKit reuse the Vite plugin for now) | Framework-specific plugins | Deep framework integration such as component hierarchy info | 📋 |
| 11 | **aiti-core** | 📋 planned (`@aiti-ai/aiti`) | SDK (protocol/types/shared library) | Shared by all products: bridge protocol, `pageId` session model, injection script, MCP tool definitions | 📋 |
| 12 | **Extension ecosystem** | published npm `@aiti-ai/*` extension packages + 63+ bundled in pi-web | pi-web extensions | session-manager / git toolchain / multi-agent backends (Claude Code, Codex, Cursor…) / model wizard / service-tunnels / document viewers… | ✅ [browse all](/en/extensions/) |
| 13 | **Standalone pieces** | [GitHub `aiti-ai` org](https://github.com/orgs/aiti-ai/repositories) | services / CLIs / libraries | service-tunnels (port tunnels), pi-subagents (pi subagent orchestration), grdpwasm (Web RDP), pi-models-respect, ddns | ✅ |
| 14 | **aiti-docs** | [github.com/aiti-ai/aiti-docs](https://github.com/aiti-ai/aiti-docs) (source of this site) | Documentation site (this website) | VuePress docs + product matrix + roadmaps | ✅ this page |

> Brand and identity: GitHub org `aiti-ai` · website `https://aiti.pw` · npm scope `@aiti-ai` · MIT license.

**Usable right now**:

```bash
# Self-hosted workbench (pick one)
npx @aiti-ai/pi-web@latest                       # run straight from npm, no install
curl -fsSL https://aiti.pw/install.sh | sh       # macOS / Linux (no npm needed)
docker run -d -p 30142:30142 aitiai/pi-web:core  # Docker (:full adds GUI / voice / tunnels)

# Local MCP bridge (connect any AI agent to in-page debugging)
npx @aiti-ai/aiti-bridge --port 8777
```

## 2. Layered Architecture

```
┌ L4 Entry layer ─────────────────────────────────────
│ aiti-agent (web workbench) · IDE plugins · Chrome extension
│ Unified surface: sessions / services / terminal / desktop / debugging
├ L3 Agent layer ─────────────────────────────────────
│ Upgrade any AI agent (MCP client)
│ Claude Code · Cursor · IDE built-in AI · aiti-agent
├ L2 Bridge layer ────────────────────────────────────
│ aiti-bridge (MCP endpoint built in)
│ Bridges aiti-devtools · pageId sessions · SSE page bridge
├ L1 Injection layer ─────────────────────────────────
│ aiti-devtools + vite / webpack / nuxt plugins
│ client · Inspector · CDP-like command set · local injection
└─────────────────────────────────────────────────────
```

### Layer Responsibilities

| Layer | Products | Responsibility |
|---|---|---|
| **L1 Injection layer** | aiti-devtools series | Inject the debugging client into the **page being developed**: the `aiti-devtools` mini client, Inspector floating UI, an 8-domain 42-command CDP-like command set, framework source locating (React/Next/Vue/Svelte) |
| **L2 Bridge layer** | aiti-bridge / server | Let AI converse with the page: MCP tools (`page_exec` / `page_snapshot` / `bridge_status` / `user_*`), the `pageId = instanceId/frameId` session system, SSE long connection, event broadcasting (open_file etc.) |
| **L3 Agent layer** | Any MCP client | Wire bridge results into your AI: Claude Code, Cursor, IDE built-in AI, aiti-agent can all serve as the host agent |
| **L4 Entry layer** | aiti-agent / IDE plugins | The end user's operating surface: browser workbench; IDE plugins handle one-click injection completion + delivering messages into the IDE's AI agent window |

## 3. Three Main Lines

### Main Line A: aiti-agent — the Main Web Workbench

A self-hosted personal AI development workbench powered by **pi** (npm package **`@aiti-ai/pi-web`**). Built on the open-source project **agegr/pi-web** (including the ecosystem's only service-tunnels / queue recovery), with an independent product identity. See [Project Origin](/en/guide/origin.md) for the backstory.

- Form: npm global install / one-line script / single Docker container (core/full) → browser + mobile
- Status: ✅ published (0.15.x) — three install entries in [aiti-agent](/en/products/aiti-agent.md) and the [Install Guide](/en/guide/install.md)
- Five capability layers: UI layer → debug visualization layer (CDP/VNC/ttyd) → exposure layer (service-tunnels) → execution layer (pi agent SDK) → data layer (shared JSONL + queue persistence)

### Main Line B: aiti-devtools — the Local Injection Ecosystem

Bringing AI to the live scene of page development. **Embedded into every mainstream development tool** (Vite / Webpack / Nuxt / Astro; Next / Express / SvelteKit via core), **local injection**, no business code changes needed.

- Form ①: active adaptation by developers (`<script src="…/aiti-launcher.js" defer></script>`)
- Form ②: Chrome extension / platform built-in (no code changes, planned)
- Form ③: IDE plugins (vscode source ready / idea planned) auto injection
- Details: [aiti-devtools](/en/products/aiti-devtools.md) and the [devtools plugin matrix](/en/products/aiti-devtools-plugins.md)

### Main Line C: aiti-bridge — Upgrade Any AI Agent

The bridge-layer product. **Turns page debugging into MCP tools for any AI agent** (`page_*` / `user_*`), provides the bridge plumbing for aiti-devtools and plugins such as aiti-devtools-vscode/idea, and **delivers messages directly to the AI agent window inside the IDE**.

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
docker run -d -p 30142:30142 aitiai/pi-web:core → open the workbench in the browser
  → the page's dev environment gets aiti-devtools injected → the workbench AI session is exposed via service-tunnels
  → CDP 9222 / noVNC 6080 visual remote debugging
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
