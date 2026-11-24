---
title: What is aiti
icon: ✨
description: aiti's positioning, brand, and three product lines
tags: [guide, concept]
---

# What is aiti

**aiti** (pronounced `/aiti/`, a homophone of "achoo" — "AI development as simple and natural as a sneeze") is an **AI development tool ecosystem** powered by **pi** as its engine, composed of three product lines:

## Brand and Identity

| Item | Value |
|---|---|
| Brand | aiti (finalized 2026-08-08; pronounced `/aiti/`, a homophone of "achoo") |
| Domain | `https://aiti.pw` |
| GitHub org | `aiti-ai` |
| npm scope | `@aiti-ai` (bare 3-4 letter names are rejected by npm's anti-squatting risk control) |
| One-liner | AI development as simple and natural as a sneeze |

## Three Lines

### Line A: aiti-agent — The Main Web Battleground

A self-hosted personal AI development workbench powered by **pi**. The open-source project **pi-web** is its upstream baseline, with an independent product identity; everything beyond that baseline is added by this project on top (for its backstory see [Project Origins](/en/guide/origin.md)).

- The browser is the primary operating surface; one-click start with `docker run` (same-origin compatible with pi: pi CLI / pi IDE extensions operate the same set of sessions)
- Self-built additions on top of that baseline: service-tunnels (HTTP vhost + TCP tunneling + TOTP) and queue crash recovery
- **AI secret masking out of the box**: the first-party pi plugin pi-secret-mask ships pre-provisioned — keys pasted into prompts become placeholders before the model sees them and are restored for tool execution (**Paste-safe by default.**)
- Roadmap: built-in terminal → Chrome CDP remote debugging → CLI bridging → noVNC desktop → tool marketplace

### Line B: aiti-devtools — The Local Injection Ecosystem

Bringing AI to the page-development front line. **Embeds into each mainstream dev tool** (Vite / Vue / Next / React / Svelte), **local injection**:

- Injects the `aiti-devtools` mini client + a floating Inspector UI + a CDP-like command set of 47 commands across 8 domains
- Framework source locating: React/Next/Vue/Svelte dev builds → `{framework, file, line}`
- Three forms: proactive adaptation (script include) / Chrome extension / IDE plugin

### Line C: aiti-bridge — AI Agent Retrofit

A bridging-layer product with three core jobs:

1. **Configuring aiti-devtools usage**: bridge address/token/pageId, minimal configuration
2. **Retrofitting AI agents**: giving Claude Code / Cursor / built-in IDE AI the ability to operate the page and ask the user questions
3. **Reaching the IDE AI window directly**: supports plugins like aiti-devtools, aiti-devtools-vscode/idea (idea planned) to complete the injection, **delivering messages straight to the AI agent window inside the IDE via aiti-bridge**

## Relationship with pi / pi-web

| Relationship | Description |
|---|---|
| pi = engine | earendil-works/pi is the execution kernel (daily releases, managed by mise); aiti accepts this dependency |
| pi-web = upstream baseline | agegr/pi-web is the open-source web shell that serves as the upstream baseline; service-tunnels, queue crash recovery and the rest of the feature set are built by this project on top of it; independent product identity — for the full story see [Project Origins](/en/guide/origin.md) |
| Competitor forks | jmfederico (different stack, not mergeable), PiClaw (competes on positioning, not features), omp (long-term dual-engine option) |

## Ecosystem Panorama

```
         aiti.pw (website / docs / endpoints)
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
aiti-agent   aiti-devtools  aiti-bridge
(Web workbench)  (local injection ecosystem)  (AI agent retrofit)
   │            │            │
   └───── pi engine (earendil-works/pi) ─────┘
```

> Next step: [Architecture](/en/guide/architecture.md) or jump straight to the [Product Matrix](/en/products/README.md).
