---
title: Installation
icon: download
description: Install aiti Web (@aiti-ai/pi-web) — npm, one-line script (macOS/Linux), PowerShell (Windows), Docker, or run from source (developers)
tags: [guide, install]
---

# Installation

aiti Web (npm package **`@aiti-ai/pi-web`**) is a self-hosted AI development workbench: one command to start, ready in your browser, with 63+ bundled extensions out of the box.

## Install (pick one)

:::: tabs#install

@tab npm

Requires Node.js ≥ 22.19 (check with `node --version`):

```bash
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web
```

> npm ≥11.16 requires an explicit install-script allowlist: use `--allow-scripts=<names>` AFTER the package spec. A bare `--allow-scripts` makes npm 12 block every install script and leaves the install incomplete, while older npm ignores the flag.

By default the install uses whatever registry your npm is configured with (`npm config get registry`). To switch it for this command only, append `--registry <url>`:

```bash
# npmjs — explicit, handy when a mirror is stale or misconfigured
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://registry.npmjs.org

# mirror example (China); any full npm mirror works the same way
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://registry.npmmirror.com
```

`--registry` applies to this command only and leaves your global `.npmrc` untouched; use `npm config set registry <url>` to make it permanent. Mirrors sync official releases with a delay (minutes to tens of minutes), so a brand-new version may only be available from npmjs at first.

Then start:

```bash
pi-web          # serves http://127.0.0.1:30141 and opens your browser
```

Prefer a throwaway run? `npx --allow-scripts=@aiti-ai/pi-web @aiti-ai/pi-web@latest` — no global install (the same allow-scripts flag applies, and `--registry` works the same way).

@tab macOS / Linux

```bash
curl -fsSL https://aiti.pw/install.sh | sh
```

**No npm required**: the script downloads the prebuilt archive from [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) (all dependencies bundled, ~180MB) → installs to `~/.aiti/aiti-web-<version>` → creates a `pi-web` launcher in `~/.local/bin`. Downloads are sha256-verified; installs to your home directory, no sudo. [Review the script](https://aiti.pw/install.sh) first if you like.

Pin a version:

```bash
curl -fsSL https://aiti.pw/install.sh | sh -s -- --ref v0.18.0-aiti.1
```

Env overrides: `AITI_RELEASE_REPO` (mirror repo), `AITI_INSTALL_DIR`, `AITI_BIN_DIR`:

```bash
curl -fsSL https://aiti.pw/install.sh | AITI_INSTALL_DIR=~/apps/aiti sh
```

@tab Docker

Images are published to Docker Hub (built per release tag alongside GitHub Releases) and mirrored tag-for-tag to the public Aliyun ACR for faster pulls in China; there is also a GHCR source [`ghcr.io/aiti-ai/aiti-ai`](https://github.com/aiti-ai/aiti-ai/pkgs/container/aiti-ai) (same versions and content as Docker Hub — core/full variants, identical tags):

```bash
docker run -d --name aiti --init -p 30142:30142 \
  -v aiti_data:/opt/aiti/data -v aiti_agent:/opt/aiti/agent \
  -v ~/workspace:/workspace \
  aitiai/pi-web:core
# open http://localhost:30142 (workdir /workspace, data isolated from ~/.pi)
```

- `core` (~2.1 GB): fork of pi-web + all extensions + node/git + the justget tool market;
- `full` (~7.8 GB): adds GUI / voice (funasr) / Chrome / tunnels — needs ≥8 GB RAM;
- version tags: `aitiai/pi-web:v<version>-{core,full}`, rolling `core`/`full`/`latest`;
- GHCR source: `ghcr.io/aiti-ai/aiti-ai` — same versions and content as Docker Hub (core/full variants), identical tags (e.g. `v0.18.0-aiti.1-core` / `core` / `latest`);
- ⚠ mount only sub-paths of `/opt/aiti`, never the root itself (a root mount shadows the new image on upgrade — extensions would never refresh);
- all three image channels (Docker Hub / ACR / GHCR) currently ship linux/amd64 only; on ARM hosts add `--platform linux/amd64` to run under emulation (with a performance cost);
- slow pulls in China? swap the image for `registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web:core` (Aliyun ACR, same tags as Docker Hub);
- full ports/env vars/reverse-proxy/upgrade guide: the manual in the repo [`docker/`](https://github.com/aiti-ai/aiti-ai/tree/main/docker) directory (compose.yaml / README.md).

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

Requires PowerShell 5.1+ (built into Windows 10/11). Equivalent: `iwr -useb https://aiti.pw/install.ps1 | iex`. **No npm required**: the script downloads the prebuilt zip from [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) → installs to `%LOCALAPPDATA%\aiti\aiti-web-<version>` → writes a `pi-web.cmd` launcher; downloads are sha256-verified. [Review the script](https://aiti.pw/install.ps1).

Pin a version:

```powershell
$env:AITI_RELEASE_TAG = "v0.18.0-aiti.1"; irm https://aiti.pw/install.ps1 | iex
```

`AITI_RELEASE_REPO` and `AITI_INSTALL_DIR` work the same way.

CN network acceleration: installers try GitHub Releases first and fall back to the Gitee mirror ([aiti-ai/aiti-ai](https://gitee.com/aiti-ai/aiti-ai/releases), identical assets and checksums; archives above Gitee's 100 MB per-file cap are published as `.part-N` pieces + a `.split` manifest and reassembled automatically). Force a source with `AITI_MIRROR=gitee` (or `github`); override the mirror repo with `AITI_GITEE_REPO`.

@tab Source

For development: clone the repository and run it with one command — extensions load in place and edits take effect without a deploy.

```bash
git clone https://github.com/aiti-ai/aiti-ai.git
cd aiti-ai
npm run local            # dev mode (http://127.0.0.1:30141)
npm run local -- --prod  # compiled mode (next build + next start)
```

See [Local development and one-command start](/en/guide/local-dev.md).

::::

## Requirements

| Item | Requirement |
|---|---|
| OS | macOS / Linux / Windows |
| Node.js | ≥ 22.19.0 |
| Session engine | Bundled out of the box — the default local engine runs in-process via the SDK, no separate install needed. Optional: the global [pi coding agent](https://github.com/earendil-works/pi) CLI, only for the TUI, attach/spawn backends, or sharing config with terminal use (`npm install -g @earendil-works/pi-coding-agent`) |
| Models | sign in or add an API key in the **Models** panel on first run |

## Start

```bash
pi-web
```

The CLI opens your browser once the server is ready; if it does not, open [http://127.0.0.1:30141](http://127.0.0.1:30141). The server listens on `127.0.0.1` only by default — use `pi-web start -H <host>` to listen elsewhere and secure the transport yourself.

## Bundled pi plugins (auto-provisioned)

On startup aiti Web auto-provisions **first-party pi plugins** into your pi settings (installed via the official package manager; shared by TUI / Web / CLI sessions):

| Plugin | What it does |
|---|---|
| `@aiti-ai/pi-models-combo` | model list governance + multi-key rotation against 429s + combo models |
| `@aiti-ai/pi-secret-mask` | **AI secret masking** — keys/tokens pasted into prompts become placeholders before the model sees them and are restored for tool execution (**Paste-safe by default.**) |
| `@aiti-ai/pi-git-trace` | out-of-band AI change tracking and rollback |
| `@aiti-ai/pi-web-bridge` | pi-web bridge |

Details: declarations persist before install (a failed install self-heals on the next pi startup via pi's own reconcile); maintainer machines manage local copies manually and skip this path; set `AITI_SKIP_PI_PLUGINS=1` to opt out entirely.

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
