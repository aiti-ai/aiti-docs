---
title: Third-party Session Source Example (sm-demo-source)
icon: 🧫
description: A session-manager third-party agent source contributor example — the minimal runnable template of the §4.8 slot contract
---

# sm-demo-source

> ❝ **Want to contribute a session source to All Sessions? Just copy this one.** ❞

A session-manager third-party agent source contributor example (the minimal runnable template of the §4.8 slot contract). The contract in three steps:

1. `ui.provides: ["session-agent-source"]` declares the capability → session-manager discovers you
2. `GET agent-source/manifest` → `{ agents: [{ id, label, dependencyHint? }] }`
3. `GET agent-source/list?agent=` / `agent-source/session?agent=&sid=` → normalized JSON (aligned with session-manager's internal SessionFileMeta + IndexedMessage)

The parsing logic runs in your own process (your code, your dependencies); this example demonstrates with built-in fixture data.
