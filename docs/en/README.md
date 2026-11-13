---
home: true
title: Self-Hosted AI Dev Workbench · Enhanced pi-web
description: A self-hosted AI development workbench built on the open-source pi-web — pi / Claude Code / Codex / Qoder agents managed in one panel, 60+ built-in extensions out of the box, multi-key model rotation & aggregation, terminal/VNC/RDP, remote-control AI from IM. One command to install, browser-first.
heroImage: /logo.svg
heroText: Self-hosted AI dev workbench
tagline: "aiti (pronounced /aiti/) — enhanced pi-web: all your agents in one panel, 60+ built-in extensions, one command to install"
keywords: self-hosted, AI workbench, aiti-agent, pi-web, pi web ui, multi-agent, model aggregation, multi-key rotation, IM remote control, terminal, VNC, RDP, AI debugging, page injection, MCP bridge, Claude Code, AI agent
actions:
  - text: Quick install
    link: /en/guide/install.md
    type: primary
  - text: Product matrix
    link: /en/products/
    type: secondary

features:
  - title: aiti-agent · Web workbench
    details: Self-hosted (built on pi-web), one command to install, browser-first; 60+ built-in extensions out of the box, pi CLI / IDE extensions operate the same sessions
    link: /en/products/aiti-agent.md
  - title: Multi-agent, one panel
    icon: 🤖🤖
    details: pi / Claude Code / Codex / Qoder / any ACP agent managed in one panel — history sessions are not fossils, click and they come alive
    link: /en/extensions/session-manager.md
  - title: Model management, end to end
    icon: 🧙
    details: Add wizard (catalog search / paste-URL reverse match) + multi-key sticky rotation + model aggregation + availability probing — say goodbye to model-management anxiety
    link: /en/extensions/aiti-model-wizard.md
  - title: Extension registry
    icon: 🧩
    details: 76 extensions browsable by category, auto-discovered by aiti-agent; every feature grows an "AI help point" — one sentence to draft config, AI fills the form, you review and commit
    link: /en/extensions/
  - title: Terminal · VNC · RDP
    icon: 🖥️
    details: Real PTY command terminal; headless virtual display + browser VNC; RDP remote desktop right in the browser — no monitor, still a stage
    link: /en/extensions/aiti-cmd.md
  - title: Remote-control AI from IM
    icon: 💬
    details: DingTalk / Feishu / WeCom plugged into the workbench — away from your desk, one group message and the AI still delivers
    link: /en/extensions/aiti-channels.md
  - title: Page debugging · aiti-devtools
    icon: 🛠️
    details: Bring the AI to the page development front line (Vite / webpack / Nuxt / Astro plugins + MCP bridge + cross-host adapters DSH / OpenClaw / OpenCode)
    link: /en/devtools/
  - title: Open ecosystem
    icon: 🌍
    details: npm scope @aiti-ai · GitHub org aiti-ai · website aiti.pw

copyright: false
footer: MIT Licensed | Copyright © 2026 aiti-ai
---

<p align="center">
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img alt="npm version" src="https://img.shields.io/npm/v/@aiti-ai/pi-web?label=%40aiti-ai%2Fpi-web"></a>
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@aiti-ai/pi-web"></a>
  <a href="https://github.com/aiti-ai/aiti-ai"><img alt="GitHub stars" src="https://img.shields.io/github/stars/aiti-ai/aiti-ai?style=flat&logo=github"></a>
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img alt="license" src="https://img.shields.io/npm/l/@aiti-ai/pi-web"></a>
</p>


### One command, browser-first

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest && pi-web
```

On first launch, sign in or fill an API key in the **Models** panel and start chatting — the 60+ built-in extensions are already in place. Three install methods (npm / curl / PowerShell) in the **[install guide](/en/guide/install.md)**.

## Why aiti?

> [pi-web](https://github.com/agegr/pi-web) is a great web UI for pi. Starting from the **same lineage** (pi CLI / IDE extensions operate the same sessions), aiti grows it into a complete, ready-to-use workbench:

| Capability | vanilla pi-web | aiti |
| --- | :---: | :---: |
| Web UI · sessions / projects / worktrees | ✅ | ✅ same lineage |
| **All agents in one panel** | — | ✅ pi / Claude Code / Codex / Qoder / any ACP agent |
| **60+ built-in extensions** | plugin mechanism | ✅ out of the box: terminal / VNC / RDP / IM / tunnels … |
| **Model management, end to end** | — | ✅ wizard + multi-key sticky rotation + aggregation + probing |
| **Page-debug injection** (AI in the page) | — | ✅ aiti-devtools: Vite / webpack / Nuxt / Astro plugins |
| **Config safety net** | — | ✅ diff view / one-click rollback / crash watchdog |

## ✨ Highlights

> Behind every highlight stands a ready-to-use extension — click through to see the implementation. The page-debugging toolchain (aiti-devtools) highlights live on [/devtools/](/en/devtools/).

| Highlight | In one sentence | Extensions |
| --- | --- | --- |
| 🤖🤖 **Multi-agent, one panel** | pi / Claude Code / Codex / Qoder / any ACP agent managed in one panel — history sessions are not fossils, click and they come alive | [session-manager](/en/extensions/session-manager.md) · [claude-code](/en/extensions/aiti-claude-code-agent.md) · [codex](/en/extensions/aiti-codex-agent.md) · [qoder](/en/extensions/aiti-qoder-agent.md) |
| 🧙 **Model management, end to end** | Model wizard (catalog search / paste-URL reverse match / auto probe) + multi-key sticky rotation + model aggregation (composite models with member **content roles**: vision/text routing) + availability probing (429 rate-limit detection & recovery prediction) — say goodbye to model-management anxiety | [aiti-model-wizard](/en/extensions/aiti-model-wizard.md) · [aiti-model-check](/en/extensions/aiti-model-check.md) |
| 👥 **Sub-agent fleet** | Delegate with one sentence: scout recon / worker execution / reviewer audit / oracle advice — parallel or pipeline, Fleet panel tracks progress | [aiti-subagents](/en/extensions/aiti-subagents.md) |
| 🖥️ **Terminal · VNC · RDP, remote without worry** | Real PTY command terminal; headless virtual display + browser VNC; RDP remote desktop right in the browser — no monitor, still a stage | [aiti-cmd](/en/extensions/aiti-cmd.md) · [aiti-ui-env](/en/extensions/aiti-ui-env.md) |
| 💬 **Remote-control AI from IM** | DingTalk / Feishu / WeCom plugged into the workbench — away from your desk, one group message and the AI still delivers | [aiti-channels](/en/extensions/aiti-channels.md) |
| 🌐 **Port mapping · external access** | Service ports auto-discovered; one click to expose http/https/tcp tunnels (TOTP auth); remote debugger injected in one click | [service-tunnels](/en/extensions/service-tunnels.md) · [aiti-debug-inject](/en/extensions/aiti-debug-inject.md) |
| 📱 **Full small-screen support** | Dialog drag/resize/persistence, auto fullscreen on small screens; chat and panels fully mobile-optimized — development from your phone is no longer a dream; voice input is fast and smooth, just battery-hungry, keep a power bank handy 🔋 | [aiti-float](/en/extensions/aiti-float.md) · [aiti-ai-input](/en/extensions/aiti-ai-input.md) |
| 🤖 **AI Helper everywhere** | Every extension, every feature grows an "AI help point": one sentence to draft config, AI fills the form, you review and commit — any feature can be AI-assisted | [aiti-helper](/en/extensions/aiti-helper.md) |
| 🕹️ **Java backends, directly debugged** | Arthas++ for AI: arbitrary in-JVM changes, Mock/SQL interception, hot controller updates, diagnostic sampling, multi-endpoint bridge management, 57 reversible tools — Spring Boot / Solon debugging without restarts | [aiti-testagent](/en/extensions/aiti-testagent.md) |
| 🧬 **Development lineage** | git records what changed; lineage records why: every line of code traceable to the session, prompt, plan and operation — reviewable, rollbackable, searchable | [📖 Concept](/en/guide/lineage.md) · [Review](/en/extensions/aiti-git-review.md) · [Plan-first](/en/extensions/aiti-plan-first.md) |
| 🛡️ **Config safety net** | AI or human breaks a config: there's a diff to inspect and one-click rollback; if the system crashes, the CLI watchdog recovers without depending on the broken system itself | [aiti-configs](/en/extensions/aiti-configs.md) |
| 🧩 **And more** | Message navigation, token usage dashboard, in-place code editing, draft protection, prompt bookmarks … see all 76 extensions in one place | [Extension registry](/en/extensions/) |
| 🛠️ **Page-debugging toolchain (aiti-devtools)** | The AI moves into the web page, face-to-face debugging — sees it, clicks it, changes it; adapted to DSH / OpenClaw / OpenCode across hosts | [aiti-devtools overview →](/en/devtools/) |

## What is aiti?

**aiti** (pronounced `/aiti/`, echoing a sneeze — "AI development as natural as a sneeze") is an **AI development tool ecosystem** powered by **pi**:

- **Main product · web workbench**: `aiti-agent` is a self-hosted personal AI development workbench (npm package [`@aiti-ai/pi-web`](/en/guide/install.md), built on the open-source pi-web project, see [project origin](/en/guide/origin.md)) —
  browser-first with **60+ built-in extensions** out of the box: multi-agent session management, model management, IM integration, terminal / virtual display / remote desktop, service tunnels, development lineage, config safety net …
  Because it shares pi's lineage, pi CLI and pi IDE extensions operate the same sessions; one command to install, one-command Docker start.
- **Page-debugging toolchain**: `aiti-devtools` injects into Vite / Vue / Next / Svelte and other mainstream dev tools, and `aiti-bridge` retrofits any AI agent as an MCP bridge —
  bringing the AI to the page development front line, where the page itself becomes debuggable, interactive, and answerable. See **[/devtools/](/en/devtools/)**.

### Install methods (npm / scripts / Docker)

> Pick one — details in the **[install guide](/en/guide/install.md)** (system requirements / common commands / script transparency).

:::: tabs#install

@tab npm

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest
pi-web          # starts the service and opens the browser (default http://127.0.0.1:30141)
```

@tab macOS / Linux

```bash
# no npm needed: prebuilt GitHub Releases artifact + sha256 verification, installs into your home directory
curl -fsSL https://aiti.pw/install.sh | sh
```

@tab Windows

```powershell
# PowerShell 5.1+ (built into Windows 10/11)
irm https://aiti.pw/install.ps1 | iex
```

::::

## Product matrix at a glance

| Layer | Product | Package / form | Role |
|---|---|---|---|
| Entry | aiti-agent | `@aiti-ai/pi-web` · Web + Docker | Self-hosted AI dev workbench (based on pi-web), 60+ built-in extensions |
| Injection | aiti-devtools family | `@aiti-ai/aiti-devtools-*` · plugins/SDK | Embeds into mainstream dev tools, local injection |
| Bridge | aiti-bridge | `@aiti-ai/aiti-bridge` · local service | Configures devtools, retrofits AI agents |
| Agent | Any AI agent | Claude Code / Cursor / IDE AI | Operates pages via MCP, straight into the IDE window |

> Full matrix: [Products](/en/products/); overall plan: [master plan](/en/roadmaps/master-plan.md); the page-debugging toolchain lives on [/devtools/](/en/devtools/).

### Acknowledgements

Built on [pi](https://pi.dev) and [pi-web](https://github.com/agegr/pi-web).
