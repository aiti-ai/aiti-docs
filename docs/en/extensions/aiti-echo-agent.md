---
title: Echo Session Backend (aiti-echo-agent)
icon: 🔁
description: Echo agent — session-provider slot demo (minimal example for the multi-agent frontend)
---

# aiti-echo-agent

> ❝ **Get one echo online first, then let the armies plug in.** ❞

Echo agent: the minimal demo backend of the session-provider slot, a runnable example of the multi-agent frontend contract. To write your own session backend, read it first.

## Mechanism

- Registers a SessionProvider named `<id>/echo` — a fake agent that depends on no LLM
- On prompt, echoes the text back streaming at typewriter pace, fully demonstrating the SessionHandle minimal event protocol: `message_start → message_update* → message_end → agent_settled`
- The capability surface is deliberately narrowed (a fail-loud contract demo): capabilities has only `getMessages` true and everything else false — the UI hides model selection/fork etc. accordingly; single-turn by design, prompting again while running raises an error
- Debug APIs: `GET /status`, `POST /selftest`

## Uses

1. Verify that lib/session's provider slot works end to end (register/resolve/unregister)
2. Serve as the **minimal reference implementation** for custom session backends
