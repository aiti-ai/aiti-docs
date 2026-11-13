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

**No npm required**: the script downloads the prebuilt archive from [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) (all dependencies bundled, ~180MB) → installs to `~/.aiti/aiti-web-<version>` → creates a `pi-web` launcher in `~/.local/bin`. Downloads are sha256-verified; installs to your home directory, no sudo. [Review the script](https://aiti.pw/install.sh) first if you like.

Pin a version:

```bash
curl -fsSL https://aiti.pw/install.sh | sh -s -- --ref v0.15.7
```

Env overrides: `AITI_RELEASE_REPO` (mirror repo), `AITI_INSTALL_DIR`, `AITI_BIN_DIR`:

```bash
curl -fsSL https://aiti.pw/install.sh | AITI_INSTALL_DIR=~/apps/aiti sh
```

@tab Docker

Images are published to Docker Hub (built automatically on `v*` tags alongside GitHub Releases):

```bash
docker run -d -p 30142:30142 \
  -v aiti-data:/opt/aiti -v ~/workspace:/workspace \
  aitiai/pi-web:core
# open http://localhost:30142 (workdir /workspace, data isolated from ~/.pi)
```

- `core` (~3 GB): fork of pi-web + all extensions + node/git + the justget tool market;
- `full` (~8.6 GB): adds GUI / voice (funasr) / Chrome / tunnels — the all-in-one image;
- version tags: `aitiai/pi-web:v<version>-{core,full}`, rolling `core`/`full`/`latest`;
- one-command docker compose and the manual live in the repo [`docker/`](https://github.com/aiti-ai/aiti-ai/tree/main/docker) directory (compose.yaml / MANUAL.md).

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

Requires PowerShell 5.1+ (built into Windows 10/11). Equivalent: `iwr -useb https://aiti.pw/install.ps1 | iex`. **No npm required**: the script downloads the prebuilt zip from [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) → installs to `%LOCALAPPDATA%\aiti\aiti-web-<version>` → writes a `pi-web.cmd` launcher; downloads are sha256-verified. [Review the script](https://aiti.pw/install.ps1).

Pin a version:

```powershell
$env:AITI_RELEASE_TAG = "v0.15.7"; irm https://aiti.pw/install.ps1 | iex
```

`AITI_RELEASE_REPO` and `AITI_INSTALL_DIR` work the same way.

CN network acceleration: installers try GitHub Releases first and fall back to the Gitee mirror ([aiti-ai/aiti-ai](https://gitee.com/aiti-ai/aiti-ai/releases), identical assets and checksums; archives above Gitee's 100 MB per-file cap are published as `.part-N` pieces + a `.split` manifest and reassembled automatically). Force a source with `AITI_MIRROR=gitee` (or `github`); override the mirror repo with `AITI_GITEE_REPO`.

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

Update: see [Update](update.md). Uninstall: `npm uninstall -g @aiti-ai/pi-web`.

## Script transparency

Both scripts do one thing: query the GitHub API → download the release asset → verify sha256 → extract + create a launcher:

| Script | Direct link |
|---|---|
| install.sh | https://aiti.pw/install.sh |
| install.ps1 | https://aiti.pw/install.ps1 |

Assets are built automatically by the [release workflow](https://github.com/aiti-ai/aiti-ai/blob/main/.github/workflows/release.yml) whenever a `v*` tag is pushed: 4 platforms (linux-x64 / darwin-x64 / darwin-arm64 / win-x64), each bundling the npm package contents plus its production dependency closure, each with a sha256 that the installer verifies.

Upgrade: see [Update](update.md) (installer-channel users can re-run the installer; run `pi-web stop` first).

## Next steps

- [Update](/en/guide/update.md) — the version scheme and update steps for every install shape
- [Quick Start (aiti-agent workbench)](/en/guide/quick-start.md) — the first steps after installing
- [devtools quick start](/en/devtools/quick-start.md) — if what you want is the "AI operates your page" debugging toolchain
- [aiti-agent · product overview](/en/products/aiti-agent.md) — capabilities and positioning
- [Project origin](/en/guide/origin.md) — how pi-web became aiti
