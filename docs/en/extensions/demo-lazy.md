---
title: demo-lazy
icon: 🐌
description: Input character counter (lazy-loading demo) — not loaded at startup, fetched only on first use
---

# demo-lazy

An input character counter extension — and at the same time a demo of the extension framework's **lazy loading** semantics:

- **A useful little feature**: when the input is non-empty, a compact line `N 字 · ≈M tokens` (CJK ≈1 token/char, others ≈4 chars/token) is shown above the input box; an empty input renders nothing
- **Lazy loading v2 two-stage boilerplate** (2026-09-08): `clientImmediately: false` — zero requests during startup; the static "Lazy" button in the top bar (declared in manifest `ui.toolbar[]`, rendered by the host, icon same-origin) fetches the bundle only when clicked and opens the panel via `meta.onClick`. The chatInputTop character-count line works as usual after materialization (kept as a teaching counter-example of "a always-mounted slot makes lazy-loading moot", see the source comments)
- **Dependency edge**: `clientDependsOn: ["demo"]` demonstrates an inject edge in the startup graph (informational, only affects prefetch scheduling)
