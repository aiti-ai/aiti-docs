---
title: pi-git-trace (out-of-band AI change tracking)
icon: 🧬
description: Out-of-band AI change tracking for the pi coding agent — a standalone .aiti-trace trace repo at the repo root (autoInit even without git) + op-numbered before/after dual commits + full file⇄message⇄op lineage + rollback + shadow-repo slimming compact
---

# pi-git-trace (out-of-band AI change tracking)

> ❝ **What the AI changed, why, and how to change it back — the trace repo remembers all of it.** ❞

Out-of-band **AI change tracking** for the pi coding agent: every AI file write is recorded into a
trace repo **independent of the business git**, so afterwards you can answer, per operation, who
changed it, from which message, what exactly changed, and how to restore it.

## Core mechanics

- **Standalone trace repo**: `.aiti-trace/` at the business repo root — a separate git shadow
  repo; business branches and history stay untouched, and directories without git autoInit anyway
- **Op-numbered before/after dual commits**: every AI file operation records the before and after
  states as two commits; operations are referencable, sortable and replayable by op number
- **Full lineage**: file ⇄ message ⇄ operation — which message, which operation touched a file,
  traceable end to end
- **Rollback**: restore at operation granularity (exact pre-state of a single op)
- **Shadow-repo slimming**: `compact` squeezes trace history so the shadow repo never bloats

## Positioning

- **System tools** category, complementary to business git auditing: git owns the formal history,
  trace owns "what happened inside AI sessions"
- The aiti source repo's `.aiti-trace/` directory is this plugin's product (visible when collaborating
  across machines)

## Install

```sh
pi install npm:@aiti-ai/pi-git-trace
# or source-path direct (edits take effect immediately):
pi -e /path/to/pi-git-trace/src/index.ts
```
