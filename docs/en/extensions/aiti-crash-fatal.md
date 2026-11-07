---
title: aiti-crash-fatal
icon: 💥
description: Flag write → startup throw → ⚠ indicator + restore-ext idempotent cleanup — a drill tool for the crash self-healing chain
---

# aiti-crash-fatal

Crash drill extension: verifies the pi-web extension crash self-healing/recovery chain. Three crash entry points (partial-crash philosophy: only one thing breaks at a time, each with backup / recoverable):

- **🧨 Crash extension startup**: `POST /crash-ext` writes the crash flag → after reload the startup throws → a ⚠ "startup failed" indicator appears at the bottom-left of the page (page/API/client all alive) → `POST /restore-ext` idempotently clears and recovers (or recover from the ⚠ popup; auto-recovers after 60s)
- **💥 Crash the page**: `POST /corrupt` backs up `app/page.tsx` and writes in a render-throw version → refresh → 🚑 `global-error` rescue page → `POST /restore` restores (falls back to `git show HEAD:` when the backup is missing)
- **🧱 Crash the build**: `POST /corrupt-build` injects an import of a nonexistent export at the top of `components/AppShell.tsx` → the Turbopack Build Error overlay takes over full-screen (compile errors happen before the React tree is built, so global-error can't catch them) → the rescue-hook 🚑 banner automatically guides to `/rescue.html` (static pages under public/ stay outside the compile graph) → `POST /restore-build` restores
- **Entry**: the red 💥 Fatal button in the dev page's top toolbar (a custom copyable confirm dialog picks the scenario); `GET /status` shows each scenario's broken state
- **dev-isolation only**: requests are 403-rejected outright when `NODE_ENV !== development`; deploys only to `~/.pi/web-dev/`, never to production
