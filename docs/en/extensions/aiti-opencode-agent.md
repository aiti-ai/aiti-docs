---
title: OpenCode Session Backend (aiti-opencode-agent)
icon: 🟠
description: OpenCode CLI-exclusive driver — open historical sessions in pi-web and continue chatting (oneshot run -s --format json)
---

# aiti-opencode-agent

> The OpenCode (sst/opencode) CLI session backend extension: see and open opencode historical sessions in All Sessions, and continue chatting in pi-web. The authoritative implementation of session **reading** still lives in session-manager (`lib/agents/opencode.ts` — since opencode 1.19.5, new sessions are written only to the single SQLite db `~/.local/share/opencode/opencode.db`, the message+part two tables; modern main path + legacy session_message always-empty fallback), while this extension only does the driving.

## Mechanism

- **Process model**: one one-shot process per turn, `opencode run -s <sid> --format json <prompt>` (the same as aiti-zcode-agent's oneshot); `-s` continues an existing session
- **Streaming**: stdout NDJSON part events (`step_start`/`text`/`tool`/`step_finish`); text is a **snapshot taken after the part completes** (not token by token), with deltas diffed per-part by prefix
- **Cold restore**: cwd follows the session's real directory (session-manager `services.sessions.parseSession` → `meta.cwd`), and history is backfilled as seed via parseSession (IndexedMessage → pi-shaped toolCall/toolResult) — born with correct semantics (the claude extension once replayed blank history because cwd fell back to process.cwd(); fixed 2026-09-16)
- **New sessions**: `opencode:new-*` placeholder; the first turn captures `sessionID` from the event stream → `session_backend_ready` rebinds the composite id
- **recycle**: `/session/recycle` (shared layer session-recycle.ts); existing handles are upgraded to the current extension code

## Capability surface (deliberately narrowed in v1)

The four-piece set prompt / abort / contextUsage / getMessages (followUp deliberately false); models follow opencode's configured default (no setModel/listModels, selector hidden); steer/image attachments are follow-up items.

## Authentication

Self-managed by the CLI: `~/.local/share/opencode/auth.json` (`opencode auth login`). When the CLI isn't installed, the provider doesn't register (`PATH` → `~/.opencode/bin/opencode`, overridable with `OPENCODE_CLI_PATH`).

## Relations

- Coexists with `aiti-acp-agent`'s `ACP: opencode` under the same agentKey (`opencode`): this extension resolves first at priority 10, and ACP automatically drops to fallback (fail-over)
