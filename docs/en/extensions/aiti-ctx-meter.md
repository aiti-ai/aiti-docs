---
title: aiti-ctx-meter
icon: 🔋
description: Input-area context ratio-bar indicator — desktop compactLead vertical bar + small-screen modelInfoLead leading slot, four-tier urgency color scale + critical breathing, click opens the host session stats panel
---

# aiti-ctx-meter

> ❝ **How much context is left — one glance at the battery tells you.** ❞

Input-area context ratio-bar indicator: on desktop the `compactLead` vertical bar (immediately left of the compact button) shows context %, and the host's new small-screen slot `modelInfoLead` (the leading position of the ModelSelector in both the expanded input row and the InfoSheet model row) has it too. A pure client extension (vite-free, pure mjs + host render primitives); it works as soon as it is installed.

## Capabilities

- **Four-tier urgency color scale**: the scale is driven by the host `contextUrgency()`'s `CtxUrgency` object (the extension holds zero display logic and only consumes it) — calm (<70 gray) / warn (70–90 yellow) / urgent (90–97 red) / critical (>97 deep red + breathing animation, disabled under `prefers-reduced-motion`)
- **Compact three states**: `compact.isCompacting / compactQueued` (the compact subset seam of streamingActions proposals) adds a tooltip note "compacting… / compact queued"
- **Click**: `openSessionInfo()` opens the host session stats panel (token detail + compact button) — slot extra callback first → `pi-web.composer` client service as fallback → when both are absent it degrades to not clickable
- **Small screens (v0.1.4)**: shows only the bar itself without the number (the number stays in title/aria-label, so accessibility loses no information) — making room for the right-side buttons on the bottom row
- Pure-function kernel (`barFillHeight`/`barPercentLabel`/`formatWindow`/`shouldShowPercentLabel`/`barTitleText`) pinned by 5 groups of tests; no polling — percent arrives straight through the slot extra, driven by host state events

## Contract and degradation

- Host slots: `compactLead` (hard) + `modelInfoLead` (soft) — when the host is too old and lacks the new slot, `safeRegister` console.warns and nothing is rendered; no throw, no blank screen
- Since v0.1.3 the `sessionStats` balance section is retired: balance/quota is unified under the host provider-usage panel (dedup), and this extension no longer takes over that slot

## Origin

Launched 2026-09-13; plan `docs/aiti-ctx-meter-plan.md` (implemented; host passes through `contextUsage`/`onSessionStatsPanelOpen` + the `lib/ext/types.ts` contract).
