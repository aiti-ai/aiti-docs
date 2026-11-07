---
title: session-manager
icon: 📋
description: Cross-project session panel — tag tree + colors / favorites / search / archive / kanban / new-session branch·Worktree picker / history parsing for 23 agent families / DockStack orchestration
---

# session-manager

> ❝ **Sessions are not disposable transient flows — they are assets that accumulate every day.** ❞

The cross-project session management extension for aiti-agent (pi-web): tag tree + colors, favorites, FTS5 full-text search, [`.pwarc` archive](/en/extensions/session-manager-archive.html), kanban view. The host extension of the All Sessions sidebar dock.

## Recent Capabilities (mid-2026-09 to November)

- **New-session "Branch / Worktree" picker (2026-09-17)**: between Workspace×Backend on the welcome page (host `newSessionSelectors`/`newSessionPreparers` dual slots) — the selection phase is side-effect-free, only stashing intent + showing an intent bar; when the first message is sent, the preparer executes the write operations uniformly: create/reuse a worktree and rewrite the target cwd, or checkout — on a 409 uncommitted-file conflict, a three-choice card pops up (convert to worktree / stash then switch / cancel), **files are never lost**; remote branches first create a same-named local branch. The picker does not render at all in non-git directories; when aiti-git-ops is absent (refs 404) → the branch section is hidden and worktree mode is forced on.
- **Branch chip + BranchPanel (shared git-ops client)**: the collapsed-header `⎇` branch chip and the picker reuse the `_shared/git-ops-client` BranchPanel (branch/worktree management, stash interactions, conflict cards); module-level refs cache — switching back to an already-probed directory makes zero requests; zero polling of data — refresh driven by `aiti-git-ops:changed:*` topic subscriptions.
- **Multi-agent parsers (lib/agents)**: **23 built-in AgentAdapters** (claude-like family / codex / opencode family / zcode / codebuddy / cursor family / trae / kimi / gemini / openclaw / iflow / goose / amp…), `services.sessions.parseSession` is the single authoritative implementation; the true-archive candidate list is auto-filtered per driver by the snapshot+removeSession+putBack three primitives, feeding the 📦 menu.
- **Session row data framing (2026-09-14/15)**: on message_end being written to disk, row data frames are broadcast via aiti-event-bus as `sm:session-activity`; list rows' message counts/times are patched in real time — zero polling, zero refetch.
- **Left sidebar DockStack orchestration**: the block-stack container is provided by the `aiti-float.dockstack` capability (`dependsOn` hard dependency — extman blocks disabling aiti-float alone); the fully-collapsed blank filler = quick-start guide card (aiti-quickstart) + App Center (aiti-app-center); each falls back independently via optionalDependsOn when absent.
- **External agent rows (ext rows) view-layer management**: the dock/panel 📦 menu offers "remove from list" for external source rows such as zcode/cursor — a purely view-layer move into the **archived group**; source data untouched, archived rows can be reopened anytime (restore + ⚡ take over), data is never lost; permanent deletion is not offered.
- **Tag data real-time sync**: tag changes drive refresh via aiti-event-bus frames — effective immediately across tabs/instances, no polling.
- **Advanced search** (sider dock): an "Advanced" toggle next to the search box — filter by agent/tag across the full All Sessions set; result rows carry agent badges.
- **Archive integrity guarding**: archiving/moving automatically releases idle handles; `.pwarc` extraction integrity verification.
- **Multi-agent watermarks**: for background agents like trae that refresh on a timer, "has updates" is judged by content-level timestamps — no longer falsely triggered by db mtime.
- **Self-healing**: zcode double rows / missing titles — list-request-driven self-healing + placeholder-row registry fallback + sync GC to prevent false deletions.

## Service Exports (ctx.services)

This extension is the provider of three cross-extension services (spec: [ext-services](/en/guide/ext-services.html)):

| key | Method semantics | Consumers |
|---|---|---|
| `session-manager.sessions` | `parseSession(compositeId)` history parsing for each agent (read-only; `messages[].tool` carries structured tool rows — produced by the opencode family / claude-like family / codex adapters, for backends to replay into pi-native tool cards) + `archivedIds()` archive list | aiti-zcode/opencode/qoder/codebuddy/codex-agent (cold-restore `seedHistory`), aiti-doc-center |
| `session-manager.tags` | `snapshot()` full TagData (optimistic-lock version) | aiti-doc-center |
| `session-manager.hotwords` | ASR hotword extraction `get(params)` | aiti-ai-input |

### AI Help Points (ai.helpers)

| Help point | Purpose | Implementation |
|---|---|---|
| `session-archive` AI archives old sessions for me | Describe the conditions → AI reads archive candidates → picks old sessions | `POST archive/run` (mapping ids array) |
| `session-find` AI finds a session for me | Describe session traits → AI queries the session list to find it | suggestion only (natural language) |

Declared in `index.ts`'s `ai.helpers`, aggregated proactively by ai-helper (no registration needed).

## Further Reading

- [`.pwarc` Archive Format Specification](/en/extensions/session-manager-archive.html) — binary layout / manifest / integrity checks / design decision record

- For the extension framework, see [aiti-agent Extension Points](/en/devtools/extension-points.md)
