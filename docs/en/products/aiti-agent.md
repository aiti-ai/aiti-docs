---
title: aiti-agent
icon: 🤖
description: Self-hosted personal AI development workbench (built on pi-web), the main Web battleground
tags: [product, aiti-agent, pi-web]
---

# aiti-agent — the Main Web Battleground

> **In one sentence**: a self-hosted personal AI development workbench powered by **pi** — the browser as the primary operating surface (same-source compatible with pi: pi CLI / pi IDE extensions operate the same set of sessions), one-command `docker run` startup, `just get` to install tools.
> **Backstory**: built on top of the open-source project pi-web; the deeper it was used and the more it was modified, the more it grew into its own release line (see [Project Origin](/en/guide/origin.md)).

## 1. Positioning

| Dimension | Conclusion |
|---|---|
| What to build | Our own AI development workbench (not "yet another pi-web", but "use pi to build our own tools") |
| Foundation | Built on the open-source project agegr/pi-web (incl. the ecosystem's only service-tunnels / queue recovery) |
| Engine | pi (earendil-works/pi, daily releases, versions managed by mise) |
| Differentiation | Shared pi JSONL sessions + real workspaces + service tunnels + visualized remote debugging (no one else has all five) |
| Form | Single Docker container (core/full) → browser + mobile |
| North star | Daily usable by ourselves → 10+ active external users → 5+ external contributors |

## 2. Five Capability Layers

```
UI layer: unified interface for sessions/services/terminal/desktop/debugging
Debug visualization layer: CDP(Chrome) · VNC(desktop) · ttyd(terminal)   ← planned
Exposure layer: service-tunnels (HTTP vhost + TCP tunnel + TOTP)        ← existing
Execution layer: pi agent (in-process SDK) + real workspace/Docker      ← existing + planned
Data layer: shared pi JSONL + queue persistence + worktree              ← existing
```

## 3. Core Capability List

| Capability | Status | Notes |
|---|---|---|
| service-tunnels (tunnels + TOTP auth) | ✅ unique in the ecosystem | HTTP vhost + TCP tunnels, exposing 30142/6080/7681/9222/5900 with zero changes |
| queue persistence / crash recovery | ✅ unique in the ecosystem | task queues survive restarts |
| worktree grouping / i18n framework | ✅ ahead | sessions grouped by workspace |
| Built-in terminal (ttyd / node-pty) | 📋 M1 | remote server-side Terminal execution |
| One-command Docker (core/full) | 📋 M1 | `docker run aiti` |
| Chrome CDP remote debugging | 📋 M2 | 9222 exposure + DevTools + cdp tools |
| CLI bridging (Claude Code / Codex / OpenCode) | 📋 M2.5 | bridge any AI CLI session into the Web |
| noVNC desktop visualization | 📋 M3 | view/operate any GUI remotely |
| `just get` tool marketplace | 📋 starts M1 | just + mise + apt layered installs |
| PWA / mobile / multi-host SSH | 📋 M4 | long term |

## 4. Relationship with pi / pi-web

- **pi = the engine**: accept daily-release dependencies, versions managed by mise; abstraction possible long term (revisit at M4, omp dual-engine as fallback).
- **pi-web = the starting point**: built on top of its open-source code, with an independent product identity (independent brand aiti, independent domain, independent npm scope). The full story is in [Project Origin](/en/guide/origin.md).

## 5. Relationship with the Ecosystem

| Project | Stars | Positioning | Us |
|---|---|---|---|
| agegr/pi-web (upstream) | 3.7k | the original | we build on top of it and evolve in our own way |
| jmfederico | 474 | service-oriented rewrite | features may be borrowed, code cannot be merged (fork:false, different stack) |
| PiClaw | 814 | Docker full stack | compete on positioning, not feature count: shared JSONL sessions + real workspace + tunnels |
| omp (Oh My Pi) | 22.5k | Rust core | dual-engine long-term option (evaluate SDK compatibility at M4) |

## 6. Getting Started

```bash
# One-command Docker (after M1; image tags are core / full only, no lite)
docker run -d -p 30142:30142 -v aiti-data:/opt/aiti -v ~/workspace:/workspace aitiai/pi-web:core   # published on Docker Hub (GUI / voice / tunnels → :full)

# Open in the browser (aiti.pw is the website/docs site; the workbench entry is the local port)
open http://localhost:30142
```

> Full plan: [Roadmap · aiti-agent](/en/roadmaps/aiti-agent.md) and the [Master Plan](/en/roadmaps/master-plan.md).
