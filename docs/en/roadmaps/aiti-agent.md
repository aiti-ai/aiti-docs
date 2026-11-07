---
title: aiti-agent Roadmap
icon: 🤖
description: Web workbench (based on pi-web) phased plan M0-M4
tags: [roadmap, aiti-agent]
---

# aiti-agent Roadmap (the Main Web Battleground)

> Built on top of the open-source project **pi-web**, with an independent product identity (brand aiti, domain aiti.pw, scope @aiti-ai). See [Project Origin](/en/guide/origin.md) for the backstory.

## Phased Plan

| Phase | Goal | Deliverables | Status |
|---|---|---|---|
| **M0 · Foundation** | Stable core + independent identity | ① naming/branding ✅ (aiti) ② rebase v0.8.7 (incl. pi 0.84) ③ verification chain ④ service-tunnels public release | 📋 |
| **M1 · Workbench v1** | Real work done remotely | Docker (lite) + `just get` v1 + ttyd terminal + **WS link field-tested** | 📋 |
| **M2 · Browser debugging** | Debug Chrome remotely | CDP 9222 exposure + DevTools + cdp tool port + sessiond evaluation | 📋 |
| **M2.5 · CLI bridging** (side line) | Any AI CLI session into the Web | lib/cli/ adapter layer + Claude Code adapter (live) + Codex/OpenCode (turn-based) | 📋 |
| **M3 · Desktop visualization** | View/operate GUI remotely | noVNC desktop (full image) + any GUI + TOTP orchestration | 📋 |
| **M4 · Productization** | People actually want it | editor, PWA/mobile, multi-host SSH, launch promotion | 📋 |

## Five Capability Layers (Target State)

```
UI layer: unified interface for sessions/services/terminal/desktop/debugging
Debug visualization layer: CDP(Chrome) · VNC(desktop) · ttyd(terminal)   ← M1-M3
Exposure layer: service-tunnels (HTTP vhost + TCP tunnel + TOTP)      ← existing
Execution layer: pi agent (in-process SDK) + real workspace/Docker    ← existing + planned
Data layer: shared pi JSONL + queue persistence + worktree            ← existing
```

## Synergy with devtools/bridge

- aiti-agent sessions ship a built-in **aiti-bridge** client: operate any injected page directly inside the Web workbench
- service-tunnels `transformResponse` shares the same semantics as devtools injection — pages exposed via tunnels can reuse the same injection script
- The M2 CDP link and devtools' `page_exec` (Browser domain) capabilities are complementary: full remote DevTools vs a lightweight in-page command set

## Key Items to Verify

- [ ] WS link (Next middleware does not proxy WS) — field-test Next 16 proxy rewrite / or route through a TCP tunnel
- [ ] service-tunnels public-release plan (repo location / publish name)
- [ ] @oh-my-pi SDK compatibility (AgentSession/RPC signatures, prerequisite for dual engine)
- [ ] CLI bridging P0 pre-verification (CC control_request, Codex exec resume, OpenCode run --session, Gemini -p --resume-id)

## Promotion Cadence (after M1)

- Channels: GitHub topic (the pi-coding-agent 705 project) → pi.dev package directory/Discord → Reddit/dev.to/Juejin (掘金) → Docker Hub
- Material: 60-second demo of "docker run → just get chrome → remote debugging"
- Governance selling points: we merge PRs; shared-JSONL migration at zero cost
