---
title: Quick Start (aiti-agent workbench)
icon: 🚀
description: Install aiti-agent → launch → first-run config → daily entries, up and running in 5 minutes
tags: [guide, quick-start, pi-web, workbench]
---

# Quick Start (aiti-agent workbench)

Get **aiti-agent** (the self-hosted web workbench, npm package `@aiti-ai/pi-web`) installed and chatting in 5 minutes.

> Looking for the **page-debugging toolchain** (aiti-devtools: inject → bridge → connect AI)? That's the other main line: the [devtools quick start](/en/devtools/quick-start.md). Full install details (three methods / system requirements / common commands / script transparency) live on [Installation](/en/guide/install.md).

## 1. Install (pick one)

:::: tabs#install

@tab npm

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest
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

@tab Docker

```bash
docker run -d -p 30142:30142 \
  -v aiti-data:/opt/aiti -v ~/workspace:/workspace \
  aitiai/pi-web:core        # GUI / voice / tunnels all-in-one → :full
```

::::

## 2. Launch

```bash
pi-web
```

The CLI opens the browser automatically once the service is ready (default [http://127.0.0.1:30141](http://127.0.0.1:30141); Docker uses 30142). Open it manually if it doesn't.

## 3. First-run configuration

- **Models**: sign in or fill an API key in the **Models** panel; or use the 🧙 wizard's "import from other agents" (auto-scans existing codex / zcode / opencode configs)
- **Session engine**: the [pi coding agent](https://github.com/earendil-works/pi) CLI is auto-detected by the install scripts (if missing you'll be prompted to `npm install -g @earendil-works/pi-coding-agent`)

## 4. Out of the box (60+ built-in extensions)

No per-extension installs needed — the common entries are one glance away:

| Entry | What it does |
|---|---|
| 🧩 Extensions | Extension manager: enable/disable / online install / feature switches |
| 📋 Sessions | All multi-agent sessions managed in one place (All Sessions) |
| ⚡ Commands | Real PTY terminal + favorite commands |
| 🧙 Models | Model wizard / availability check / balance panel |
| 🔀 Tunnels | Expose ports to the outside world (TOTP) |
| 📡 Model check | Availability probing / rate-limit reminders |

The full list and docs live in the [extension registry](/en/extensions/).

## 5. Connect more agents (optional)

Agents whose CLIs are installed (Claude Code / Codex / Cursor / ZCode / Qoder / any ACP…) **appear automatically** in the new-session backend list; controlled logins start from the [Agent Management](/en/extensions/aiti-agent-manager.md) panel. IM (DingTalk / Feishu / WeCom) connects via [aiti-channels](/en/extensions/aiti-channels.md) so group messages can delegate work too.

## Next steps

- [aiti-agent · product overview](/en/products/aiti-agent.md) — capabilities and positioning
- [Extension registry](/en/extensions/) — all 76 extensions by category
- [Development lineage](/en/guide/lineage.md) — full-chain traceability of AI changes
- [devtools quick start](/en/devtools/quick-start.md) — the "AI operates your page" debugging toolchain (the other main line)
