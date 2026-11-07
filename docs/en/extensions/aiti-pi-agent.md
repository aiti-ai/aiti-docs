---
title: pi Session Backend (aiti-pi-agent)
icon: 🥧
description: Spawns a pi --mode rpc child process as a session — the main path of the multi-agent frontend
---

# aiti-pi-agent

> ❝ **The most orthodox path in All Sessions — pi drives itself.** ❞

The pi session backend of the multi-agent frontend: spawns a `pi --mode rpc` child process as a session, implementing the session-provider contract to join the All Sessions panel. It is the multi-agent frontend's main path (the other `aiti-*-agent` backends are isomorphic to it).

- Design + integration points in `docs/all-sessions-multi-agent-plan.md`; the backend abstraction layer in `pi-web/lib/session/`
