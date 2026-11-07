---
title: Installation
icon: download
description: Install aiti Web (@aiti-ai/pi-web) — npm, one-line script (macOS/Linux), or PowerShell (Windows)
tags: [guide, install]
---

# Installation

aiti Web (npm package **`@aiti-ai/pi-web`**) is a self-hosted AI development workbench: one command to start, ready in your browser, with 60+ bundled extensions out of the box.

## Install (pick one)

:::: tabs#install

@tab npm

Requires Node.js ≥ 22.19 (check with `node --version`):

```bash
npm install -g @aiti-ai/pi-web@latest
```

Then start:

```bash
pi-web          # serves http://127.0.0.1:30141 and opens your browser
```

Prefer a throwaway run? `npx @aiti-ai/pi-web@latest` — no global install.

@tab macOS / Linux

```bash
curl -fsSL https://aiti.pw/install.sh | sh
```

The script does three things only: **checks the Node.js version → runs `npm install -g @aiti-ai/pi-web@latest` → detects the pi engine and prints a hint**. No sudo, no system file changes. [Review the script](https://aiti.pw/install.sh) first if you like.

Custom npm registry (intranet / mirror):

```bash
curl -fsSL https://aiti.pw/install.sh | AITI_NPM_REGISTRY=https://npm.example.com sh
```

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

Requires PowerShell 5.1+ (built into Windows 10/11). Equivalent: `iwr -useb https://aiti.pw/install.ps1 | iex`. [Review the script](https://aiti.pw/install.ps1).

Custom npm registry:

```powershell
$env:AITI_NPM_REGISTRY = "https://npm.example.com"; irm https://aiti.pw/install.ps1 | iex
```

::::

## Requirements

| Item | Requirement |
|---|---|
| OS | macOS / Linux / Windows |
| Node.js | ≥ 22.19.0 |
| Session engine | [pi coding agent](https://github.com/earendil-works/pi) CLI (auto-detected by the installer; hint: `npm install -g @earendil-works/pi-coding-agent`) |
| Models | sign in or add an API key in the **Models** panel on first run |

## Start

```bash
pi-web
```

The CLI opens your browser once the server is ready; if it does not, open [http://127.0.0.1:30141](http://127.0.0.1:30141). The server listens on `127.0.0.1` only by default — use `pi-web start -H <host>` to listen elsewhere and secure the transport yourself.

## Commands

| Command | Purpose |
|---|---|
| `pi-web` | start the server (`--help` for all options) |
| `pi-web status` | list running servers |
| `pi-web stop [--port N]` | stop a running server |
| `pi-web open [--port N]` | open a running server in the browser |
| `pi-web update [--check]` | update a global install |

Update: `pi-web stop`, then `pi-web update`. Uninstall: `npm uninstall -g @aiti-ai/pi-web`.

## Script transparency

Both scripts total ~150 lines and the core is a single `npm install -g`:

| Script | Direct link |
|---|---|
| install.sh | https://aiti.pw/install.sh |
| install.ps1 | https://aiti.pw/install.ps1 |

Set `AITI_NPM_REGISTRY` to point the installer at any npm registry; unset, it uses your machine's npm default.
