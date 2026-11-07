---
title: Subagents (aiti-subagents)
icon: 👥
description: Subagent fleet — Fleet observation / run control / agent management / concurrency config — fork engine, tools belong to upstream pi-subagents
---

# aiti-subagents

> ❝ **The main agent does the thinking; the dirty work goes to the specialist.** ❞

Subagent fleet extension: the **Fleet observation / run control / agent management console for the fork engine**. Subagents are fork-spawned by the upstream `@aiti-ai/pi-subagents` package (the subagent tool itself is provided upstream); this extension keeps zero in-process state and injects no agent tools (`agent: {}`).

- **Fleet monitoring panel**: watch all fork subagent run states in real time from the Web UI (scans upstream artifacts + registry); an inspector shows run details / logs / tool calls / output, with live messages when the bridge is online; the left sidebar "Subagent tasks" area jumps straight to the matching session
- **Run control**: abort / steer / prompt instant bridge control (falls back to control-inbox file delivery when the bridge is offline, protocol mirrored from upstream control-channel); stop a single run
- **Agent management**: create/edit/delete built-in and custom agents (scout/worker/reviewer/oracle/researcher/delegate and more; definitions belong upstream) via line-level frontmatter merge of `<agentDir>/agents/*.md` (user scope takes priority over builtin); one-click "take over" of external CLI agents to run on pi-web backends (claude / codex / cursor family adapters → same-named pi-web backends)
- **Concurrency config**: whitelist-key form for the upstream `<agentDir>/extensions/subagent/config.json` (single-run concurrency 20, spawn budget 64, parallel batch 8 × concurrency 4, etc.), saved instantly via GET/PUT `/config` — only whitelist keys are merged; unknown keys on disk are preserved verbatim and non-whitelist keys are rejected on write
- **doctor self-check**: fork package installed / registry readable / artifact directory
- **The in-process session engine is retired**: subagents are fork-spawned upstream with zero in-process state; it conflicts with a manually installed vanilla pi-subagents (duplicate registration of the same tool name), so the platform auto-disables the vanilla package per the `conflicts` declaration
