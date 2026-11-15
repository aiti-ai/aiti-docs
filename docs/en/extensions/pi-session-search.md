---
title: pi-session-search (session search for pi)
icon: 🔎
description: Adds read-only session_search / session_read tools to the pi coding agent — full-text search across past sessions (optionally every agent family via the pi-web session-manager index) and reading original messages; recover context lost to compaction and find how something was done before
---

# pi-session-search (session search for pi)

> ❝ **The context compaction ate away? One query brings it all back.** ❞

Two read-only tools for the **pi coding agent**, built for the moment context gets compacted away
(or the user says "as we discussed last time…").

## Tools

### `session_search(q, scope?, agent?, cwd?, role?, limit?)`

Full-text keyword search across past conversations:

| Parameter | Meaning |
|---|---|
| `scope: "current"` | this conversation only (live — includes everything compacted away) |
| `scope: "pi"` | pi's own sessions only |
| `scope: "all"` (default) | every agent family the index knows |
| `scope: "<id>"` / `["<id1>","<id2>"]` | narrow a previous search to specific sessions (uuid / uuid prefix / jsonl path) |

Optional `agent` (pi/claude/codex/opencode/zcode/kimi/gemini/cursor/…), `cwd` prefix, `role` and
`limit` filters.

### `session_read(session, role?="user", limit?, offset?, maxChars?, entry?)`

Read one session's original messages — defaults to the **user's** messages, the fastest way to
recover the user's exact earlier requests after compaction. `entry` anchors a single message from
a search hit; long texts truncate at `maxChars` and page via `offset`.

Typical flow: `session_search("压缩 命令", "all")` → `session_search("resize", ["id1","id2"])` →
`session_read("id1")` → `session_read("id1", entry)`.

## Data sources (per query, read-only everywhere)

| Tier | Source | Coverage |
|---|---|---|
| 1 | **pi-web session-manager index** — SQLite FTS5 trigram index over ~20 agent families (pi/claude/codex/opencode/zcode/kimi/gemini/copilot/cursor/cline/trae/windsurf/zed/antigravity/openclaw…), output labelled with the index snapshot time | widest |
| 2 | **pi session files** — streamed scan of `~/.pi/agent/sessions` (`$PI_SESSION_SEARCH_SESSION_DIR` override), newest first, bounded | always live |
| 3 | `scope:"current"` — read straight from the live session manager; 100% fresh (entries compacted seconds ago included) | this session |

Index candidates: `$PI_SESSION_SEARCH_DB`, `$PI_WEB_DATA_DIR/session-manager/cache/index.sqlite`,
`~/.pi/web/data/…`, `~/.pi/web-dev/data/…`; `PI_SESSION_SEARCH_DB=off` disables the index tier.

## Details

- **CJK queries**: Chinese needs ≥ 3 characters (FTS5 trigram); shorter queries fall back to
  substring matching
- **Human channel**: `/session-search <query> [scope:current|pi|all]`
- **Read-only red line**: never writes to session files or any index; zero native dependencies
  (built-in node:sqlite, Node ≥ 22.5)
- **pi-web counterpart**: the same tool contract is injected into pi-web sessions via
  `server.agent.agentTools`; the authoritative implementation lives in the session-manager
  extension (aiti source repo docs/pi-session-search-tools-plan.md)
