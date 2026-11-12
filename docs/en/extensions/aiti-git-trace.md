---
title: aiti-git-trace
icon: 📜
description: Out-of-band AI change tracking — repo-root .aiti-trace standalone trace repo (autoInit even without git) + op-numbered before/after dual commits + full file⇄message⇄op lineage + rollback + shadow repo slimming compact
---

# aiti-git-trace

Out-of-band AI change tracking: a standalone trace repo at the repo root `.aiti-trace` (git init inside a git repo + the hermetic trio, hidden from the user's git via an info/exclude managed block; **without git, when `trace.autoInit` is on (default on) and the path is not denylisted and within the file budget, a simple trace repo is auto-created**; can be turned off), op-numbered before/after dual commits, full file⇄message⇄op lineage traceable.

- **Watched-path model**: outside cwd = watched path (workspace-level config + session detection, autoDiscover can be turned off); non-git dirs autoInit a simple repo (system dirs / over-budget skipped).
- **Both ends**: pi extension (tool_call interception producing ops) + pi-web extension (UI/API, metadata in dataDir).
- **Timeline multi-view**: by message / by file (file touch history + file-level range review, trusting only before→after deltas) / change overview (turn filtering + open the full diff in review) / lineage; `trace open` supports files filtering; line-level "@ this line into a new session (with version)" version-mention (the @ token carries base/target short hashes).
- **Rollback**: forkGate three options; one-click partial rollback inside git-review (file/line level, write paths converge into this extension).
- **Shadow repo slimming (compact)**: schedule daily + startup self-check rate-limited to once per 24h (`AITI_TRACE_COMPACT_OFF` one-click stop), spawns a standalone child process running `tools/trace-compact.mjs --all` (delete session branches/tags/index older than N days + gc reclaim + clean orphaned ledger entries, dry-run report-driven); compact.lock exclusivity and writer-side mutual waiting keep concurrency safe; `compact.{enabled,days=30,maxObjectsMB=300}` config.
- **Service outlet** `aiti-git-trace.trace`: readOps/sessionStores/watchPaths/listMd/sessions pull surface + onOp event surface / SSE `/events` — consumers aiti-plan-first (plan-doc binding reminders), aiti-msg-smart, aiti-doc-center (cold-start backfill consumes sessions()). Contract §16.3/§16.5 in the plan document.
- **Message-level changed-files row (2026-09-17; 09-18 dedup deep review)**: registers the host's `assistantMessageFooter` slot (rendered after "changed files"), aggregates the ledger per turn's assistantEntryIds, diffs against the host's writtenFiles, and only supplements changes outside the write/edit scope (bash etc.); suppresses in-turn process messages within grouped turn groups (anti-duplication) plus message-level fallback for interrupted turns; clicking a chip opens the timeline overview filtered to that single file. Data surface = module-level short-TTL cache sharing one `/ops` (same recipe as MessageBadge) + fetch on mount (not polling); try/catch silent degrade on older hosts without this slot.
- **known issue**: multi-session shared-worktree parallel pollution (per-session index only isolates staged).

