---
title: aiti-cmd
icon: ⌨️
description: Command manager — real PTY terminal + favorite commands + message-click recognition execution + live agent command observation + a unified cross-extension execution outlet
---

# aiti-cmd

> ❝ **Leave thinking to the brain; hand commands to the favorites.** ❞

Command manager extension: node-pty real TTY terminal, favorite-command CRUD (parameterized placeholders), message-click recognition execution (PopoverAction extension point), append-only audit log, live view of commands running in agent sessions (pi-commands: in-process subscription to `tool_execution_*` events → list/live output/abort, without interrupting agent thinking), **unified cross-extension execution outlet (services runner + /shell)**.

- Three panel tabs (📋 Overview / Commands / History): the overview aggregates agent commands + terminal sessions, click a row for details; the history page carries a **source distribution** filter bar (per-source audit accountability)
- **Terminal dock take-over / tabs**: the terminal can dock, multi-session tabbed (recent batches 1e7cd696/5f694b68/924ea6b9)
- **Terminal live stream**: incremental frames go through the aiti-event-bus topic `cmd-<id>` as the sole downstream (old per-session SSE removed), initial replay/large messages go through the REST snapshot `/sessions/{id}/buffered` (seq dedup splicing); subscription keep-alive `POST /alive` (frontend 15s heartbeat, publisher stops pushing after 45s without refresh); `GET /sessions/{id}/cwd` fetches the shell's live cwd (used by "＋ New" / "New pi-web session"). Audit logs are kept in per-day shards (startup + daily cleanup of expired logs); the suggest static provider registers its in-process handler at startup (saves ai-input an HTTP self-loop), `GET /commands/suggest` serves as same-logic fallback
- **Smart-suggest exemption**: entries auto-created by the system (e.g. skill exports) don't participate in aiti-ai-input smart suggestions by default
- Lazy-loaded (two-stage conversion, see [lazy loading contract](/en/guide/ext-lazy-loading.html))
- Design docs: internal plan doc §7 (pi-commands live view), §7.6 (pi-web `AgentSessionInfo` contract patch), §8.1 (overview-first UI), **execution-chain integration plan §7 (implementation record)**
- Extension framework: see [aiti-agent extension points](/en/devtools/extension-points.md)

## Unified Execution Outlet (how other extensions hook in)

> Decision rule (settled): **command created in the backend → don't pass to the frontend** (backend creates the session, frontend only gets the sid to render); **command text in the frontend → frontend /run directly** (reusing the two-stage confirmation).

| Entry | Purpose | Consumers |
|---|---|---|
| `ctx.services.get("aiti-cmd.runner")` | In-process shared runner: `run/input/resize/kill/list/getInfo/diag/buffered/sessions`; run defaults `source="service"`, returns plain data `{ok, sessionId}` | aiti-ai-input ASR self-heal, aiti-codebuddy-agent login PTY (planned) |
| `POST /shell {cwd?, name?, source?, ttlMs?}` | Backend creates an interactive shell session (command text never reaches the frontend), returns `{ok, sessionId}` | core sidebar terminal / workspace tabs / aiti-folder·editor viewer windows / this extension's own panel (all frontend terminal entries) |
| `window.__aitiCmd.openSession(sid, title)` | Frontend renders an existing sid (panel terminal view) | services consumers hand over the sid |
| `window.__aitiCmd.openShell(cwd, name)` / `aiti-cmd:open-shell` event / postMessage `open-shell` | Open a terminal (internally via /shell) | compatibility entries (single listener) |
| agent tool `aiti_cmd_run` | Run commands inside an AI session via the backend runner (`source="ai-helper"` + session attribution); danger-command double-confirm gate | ai-helper invoke sessions / any pi-web agent session (feature `tool.aiti_cmd_run` can turn it off) |

## Audit and Sources

- append-only JSONL (`<cacheDir>/logs/<date>.jsonl`, hash-chain tamper protection `/history/verify`)
- open `source` semantics: `manual | message | shell | favorite | asr-selfheal | schedule | suggest | ai-helper | codebuddy | service | unknown` — unknown values converge to `unknown`, missing defaults to manual and is marked `sourceDefaulted`
- `GET /history?groupBy=source`: aggregated per source (count/latest/failure rate); the panel's history page visualizes "source distribution" chips + click to filter

## AI Self-Management

> What AI can do for you: **write commands from a one-line description, execute them, organize your command library, and promote commands into formal skills.**

```yaml
ai:
  manage: true
  skills:
    - view commands/groups/parameter placeholders (GET /commands; store=commands.json (<configDir> = the aiti-cmd directory), v2 tree)
    - create command (POST /commands: name/cmd/params/groupId)
    - run command (POST /run, real PTY + audit; dangerous commands need a one-time confirmation token; sandbox with three options)
    - run command session (agent tool aiti_cmd_run: start a long-lived PTY via the backend runner inside an AI session, output lands in the panel, dangerous commands double-confirm)
    - export skill: commands with skill=true are synced to ~/.pi/agent/skills/aiti-cmd-<name>/SKILL.md
  storage_dir: <configDir> (= ~/.pi/web/data/aiti-cmd; audit logs/sandbox in <cacheDir> = …/cache)
  source_dir: dev-repo/aiti-cmd
  page: toolbar ⚡ Commands → command panel
```

After hooking into ai-helper: click "AI, write it for me" in command details → describe → preview → fill in and save (see [aiti-helper](/en/extensions/aiti-helper.html)).

### AI Help Points (ai.helpers)

| Help point | Function | Implementation |
|---|---|---|
| `command-create` AI writes a command for me | Describe the need → AI writes the command JSON → stored | `POST /commands` (mapping name/cmd/tags/confirm) |
| `command-fill` AI fills the command form for me | Invoked from the AI button in the command-details dialog → AI toolchain fills the form directly | `fill` (self_ui/form_fill + JSON contract `{filled:{field:value},note}`) |
| `command-fix` AI optimizes/fixes a command | AI reads the command list → finds the target → improves → updates | `PUT /commands/{id}` (path template) |
| `command-run` AI runs a command for me | Inside an AI session, starts a backend PTY session via `aiti_cmd_run` (long-lived/panel-watchable/audit-attributed); dangerous commands require consent first | agent tool (no concrete action) |

Declared in `index.ts` under `ai.helpers`, aggregated proactively by ai-helper (no registration needed).

### suggest ⚡ one-click run (aiti-ai-input integration, off by default)

The ⚡ next to a command-suggestion candidate: clicking it directly issues the frontend `POST /run` (`source="suggest"`, two-stage confirmation) — the command is already in the frontend, no detour through the server. Takes effect when feature `ai-input.suggestRun` is enabled (extman → AI input → suggest group); supported in both the desktop suggestion popup and the small-screen suggestion bar. On success it auto-switches to the ⚡Commands panel terminal view.
