---
title: aiti-omp-agent
icon: 🦉
description: "Oh My Pi (omp.sh) — RPC spawn backend for pi's largest fork (split from aiti-pi-agent to specialize in omp): `omp --mode rpc` child process + ready handshake / get_state capability surface / host tools / login / branch"
---

# aiti-omp-agent · Oh My Pi Backend

> ❝ **omp's independent world: ready handshake / get_state capability surface / host tools / login / branch.** ❞

The RPC spawn backend for Oh My Pi (omp.sh, a Bun-only superset fork of pi: subagents / plan mode / LSP-DAP / hindsight memory, etc.) — one independent `omp --mode rpc` child process per session (run by bun, stdio newline-delimited JSON protocol). Split from aiti-pi-agent to specialize in omp; the engine layer `fork-rpc/` shares the same origin as pi-agent (a `_shared/pi-fork-rpc` deploy copy; all differences are declared via spec.commands boolean flags).

## Mechanism

- **CLI resolution**: `OMP_CLI` explicit → PATH `omp` → fallback `~/.bun/bin/omp` (systemd PATH doesn't include the bun bin); if omp isn't installed, registration proceeds as usual and createSession reports clear installation guidance
- **Wire protocol**: `ready` handshake (15s timeout fallback; dying before ready fails loud with the reason) → `agent_start/turn_start/agent_end/agent_settled` / `model_select` / `queue_update` (remote queue mirror) / `extension_ui_request` (pendingUI capped at 32; over the limit the oldest is auto-cancelled)
- **Session id rebind (B4)**: omp has no `--session-id` — after ready, poll and read back the real `rpcSessionId` → `ctx.core.rebindSessionBackend` rebinds (old host degrades to skip) → bus broadcast `aiti-omp-agent:rebind {from,to}`; session-manager consumes it to converge placeholder rows
- **Spawn env governance**: `governanceEnv("omp")` whitelist passthrough + `AITI_BRIDGE_URL` always injected + extman `spawn.env` user list (`-NAME` removes an auto-injected item)

## Capability Surface

steer / followUp / queueManage (list/clear/move/convert/remove/recall/requeue) / getMessages / **contextUsage** / setModel / setThinkingLevel / **fork (branch command; `omp-m<N>` resolves the real entry id via sessionFile JSONL)** / renameSession / compact / getCommands / **listTools (get_state.dumpTools)** / respondInteraction / **subagents** (getSubagents / subscription levels off|progress|events / getSubagentMessages). login goes through `/login` interception → `get_login_providers` → synthesized candidate select UI / direct launch → `open_url` frames drive the front-end login card.

## P2 host tools bridge

After ready, pull the aiti-devtools bridge MCP (`AITI_BRIDGE_URL`) `tools/list` → filter by the **G1 whitelist** (default read-only subset of 14: aiti_inbox / page_snapshot / self_ui / user_* etc.; write-type page_exec/form_fill excluded by default) → inject into omp via `set_host_tools`; agent calls pass through back to the bridge via HTTP `tools/call`; silent degradation when the bridge is unreachable. Whitelist feature `hostToolsAllow` (empty = read-only subset, `*` = full set, comma-separated exact list).

## Feature switches

`spawn.env` / `spawn.command` (docker-ized wrapper) / `spawn.argsPrefix` / `hostToolsAllow` (effective for the next session).

## Relationships

aiti-pi-agent (split source, pi-only); session-manager (consumes rebind frames); aiti-devtools (host tools bridge source); aiti-custom-agent (provides the standard `.launch` delegation service shape; no omp-driver consumer yet). Plans: `docs/omp-backend-migration-research.md` / `docs/aiti-omp-agent-id-rebind-design.md`.
