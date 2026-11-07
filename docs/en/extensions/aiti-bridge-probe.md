---
title: aiti-bridge-probe
icon: 🩺
description: Mobile bridge/SSE connection probe (temporary diagnostics) — collects lifecycle/EventSource/fetch/heartbeat-gap evidence on the page side and persists it to disk for AI analysis; should be uninstalled once the issue is localized
---

# aiti-bridge-probe · Bridge Connection Probe

> ❝ **Wherever SSE breaks, let the evidence speak.** ❞

A diagnostic tool for the mobile (Huawei browser/Android) AI main window's SSE disconnect-on-background issue: the root cause has been fixed in aiti-devtools-inject's "unfreeze reconnect anchor"; this extension is kept as a general diagnostic surface for future bridge connection issues (control probe / forced reconnect are universal techniques).

## Collection Surface

- Page lifecycle events: visibilitychange / pagehide / pageshow / freeze / resume / online / offline
- EventSource constructor hook: create/open/error for all SSE connections (network blips vs HTTP CLOSED distinguished by readyState) + message counting
- fetch hook: status codes/latency/failures of `/bridge/` and aiti-devtools-related requests
- **15s heartbeat sampling**: gap>25s = the page was frozen / network disconnected during that period
- BridgeClient connect/disconnect wrapper + isConnected mirror

## Usage

The top-bar 🩺 button opens a floating layer: real-time status (visibility/online/connection/ES count/heartbeat gap) + event stream + three buttons — 📤 full report (`POST /report` lands in `cacheDir/probe.jsonl`) / ▶ control probe (bare HTTP + bare SSE without token, separating transport-layer from protocol-layer failures) / 🔁 forced reconnect (reproduces the recovery path). The AI reads/clears via `GET /report[?tail=N][?clear=1]`.

The feature `probe.enabled` (on by default) controls the button's visibility.
