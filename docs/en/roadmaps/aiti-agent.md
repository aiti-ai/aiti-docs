---
title: aiti-agent Roadmap
icon: 🤖
description: Web workbench (based on pi-web) phased plan M0-M4
tags: [roadmap, aiti-agent]
---

# aiti-agent Roadmap (the Main Web Battleground)

> Built on top of the open-source project **pi-web** (agegr/pi-web), with an independent product identity (brand aiti, domain aiti.pw, scope @aiti-ai). See [Project Origin](/en/guide/origin.md) for the backstory.
> **Current-state baseline**: the product is released — npm [`@aiti-ai/pi-web`](https://www.npmjs.com/package/@aiti-ai/pi-web) 0.15.x · Docker `aitiai/pi-web` (core/full) · `aiti.pw/install.sh`; per-item status lives in the [Product Matrix](/en/products/README.md).

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **M0 · Foundation** | Stable core + independent identity | ① naming/branding ✅ ② upstream tracking (originally rebase v0.8.7; evolved into continuous upstream sync, now 0.15.x) ③ CI verification chain ✅ ④ service-tunnels public release ✅ (standalone GitHub repo) | ✅ |
| **M1 · Workbench v1** | Real work done remotely | Docker core/full dual images ✅ (beyond the lite plan; 4-language README + compose + systemd); terminal delivered as the aiti-cmd PTY panel ✅ (form replaces the original ttyd plan); WS link resolved in production ✅; `just get` tool marketplace 📋 | 🚧 |
| **M2 · Browser debugging** | Debug Chrome remotely | CDP channels wired in: chrome-devtools / msedge-cdp / remote-cdp MCP servers; complementary to devtools `page_exec` (full remote DevTools vs lightweight in-page commands); sessiond evaluation 📋 | ✅ core |
| **M2.5 · CLI bridging** (side line) | Any AI CLI session into the Web | 12 CLI adapter extensions live: Claude Code / Codex / OpenCode / Cursor / ZCode / Qoder / CodeBuddy / OMP / ACP (generic) / custom-agent registry, etc.; docs in [AI agent onboarding](/en/guide/mcp/ai-agents.md) | ✅ delivered beyond plan |
| **M3 · Desktop visualization** | View/operate GUI remotely | computer-use MCP + VNC password contract in place; noVNC desktop (full image) orchestration / TOTP orchestration 📋 | 🚧 |
| **M4 · Productization** | People actually want it | editor suite (aiti-editor / onlyoffice / sheet-univer / word preview) ✅; PWA/mobile 📋; multi-host SSH 📋; launch promotion 📋 | 🚧 |
| **Ecosystem phase** | A real community | external PRs, addons, engine abstraction (pi/omp dual-engine evaluation) | 📋 |

## Five Capability Layers (Current State)

```
UI layer: unified interface for sessions/services/terminal/desktop/debugging   ← ✅ (60+ extension ecosystem)
Debug visualization layer: CDP(Chrome) · VNC(desktop) · PTY(terminal)          ← ✅ core (MCP channels + aiti-cmd)
Exposure layer: service-tunnels (HTTP vhost + TCP tunnel + TOTP)               ← ✅ (standalone open-source repo)
Execution layer: multi-agent backends (pi + 12 CLIs + ACP) + real workspace/Docker ← ✅
Data layer: shared pi JSONL + queue persistence + worktree                     ← ✅
```

## Synergy with devtools/bridge

- aiti-agent sessions ship a built-in **aiti-bridge** client: operate any injected page directly inside the Web workbench
- service-tunnels `transformResponse`, the vscode extension's local reverse proxy, and devtools injection share the same semantics — pages exposed/proxied this way reuse the same injection script
- The M2 CDP link and devtools' `page_exec` (Browser domain) capabilities are complementary: full remote DevTools vs a lightweight in-page command set

## Key Items to Verify (updated 2026-11)

- [x] WS link (Next middleware does not proxy WS) — resolved in production: stable nginx + SSE; HMR websocket via nginx map
- [x] service-tunnels public release — [github.com/aiti-ai/service-tunnels](https://github.com/aiti-ai/service-tunnels)
- [x] CLI bridging P0 pre-verification — done and exceeded (12 adapter extensions live)
- [ ] @oh-my-pi deep dual-engine evaluation (session-level adaptation exists: aiti-omp-agent; AgentSession/RPC signature compatibility deferred to M4)
- [ ] Mobile / PWA / multi-host SSH
- [ ] First promotion launch

## Promotion Cadence (prerequisites met; launch not started)

- Prerequisite check (D7 "product first, promotion later"): Docker ✅ terminal ✅ CDP ✅ — the M1 bar is passed
- Channels: GitHub topic (1895 projects under pi-coding-agent) → pi.dev package directory/Discord → Reddit/dev.to/Juejin (掘金) → Docker Hub (`aitiai/pi-web` ready)
- Material: 60-second demo of "docker run → remote debugging bug fix"
- Governance selling points: we merge PRs; shared-JSONL migration at zero cost
