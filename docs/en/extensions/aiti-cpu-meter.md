---
title: aiti-cpu-meter
icon: 📊
description: Main-thread smoothness detection — second counter + 0-100 score + color tiers + minimize + AI jank debugging (aiti-helper help point); injectable into any site (internal/external dual artifacts)
---

# aiti-cpu-meter

Main-thread smoothness detector: real-time second counter + 0-100 smoothness score + color-tiered display; the FAB can be minimized.

- **Dual artifacts + three injection channels**: internal version (pi-web pages) + external version (standalone single-file aiti-cpu-meter.js, publicApi + meter-version content-hash forced re-fetch) — when investigating jank on launcher-injected pages, bring the same ruler along. The external version has three injection channels: (1) service-tunnels checkbox injection on exposed pages (main path); (2) bookmarklet on any site; (3) cross-instance injection (feature `inject.enabled` + `service.url`, modeled on aiti-debug-inject)
- **Event-driven**: rAF sampling, no timed polling.
- **Ask AI (v0.3)**: the panel's ✨ button → an on-the-spot report (`report()`: score / long tasks / **LoAF script attribution** / jank snapshot / page source paths and main regions) handed to aiti-helper to create a "debug page jank" session (help point `jank-debug`: metric interpretation + this repo's historical jank case library of 12 categories + a fix toolbox). The internal version goes through aiti-helper (this extension's group + preselection); the external version uses a prompt dialog → top-level navigation through gate.html to pass login → same-origin `POST ask-ai` (login required) creates the session in two steps → jumps to pi-web.

## Use cases

The aiti-float 0.4.4 freeze incident (a microtask storm burning the main thread) was pinpointed empirically by this tool — a sudden detector score drop + page CDP timeouts = suspected main-thread starvation. For the related lessons see the mechanism section of `dev-repo/docs/aiti-web-ext-float-dialogs.md`.
