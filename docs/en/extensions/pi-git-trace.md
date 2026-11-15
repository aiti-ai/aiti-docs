---
title: pi-git-trace (out-of-band AI change tracking)
icon: 🧬
description: Out-of-band AI change tracking for the pi coding agent — a standalone .aiti-trace trace repo at the repo root (autoInit even without git) + op-numbered before/after dual commits + full file⇄message⇄op lineage + rollback + shadow-repo slimming compact
---

# pi-git-trace (out-of-band AI change tracking)

> ❝ **What the AI changed, why, and how to change it back — the trace repo remembers all of it.** ❞

Out-of-band **AI change tracking** for the pi coding agent:

- **Standalone trace repo**: `.aiti-trace/` at the repo root (never pollutes the business git;
  autoInit works even in directories without git)
- **Op-numbered dual commits**: every AI file operation records before/after commits, referencable
  by op number
- **Full lineage**: file ⇄ message ⇄ operation — which message, which operation touched a file,
  traceable end to end
- **Rollback**: per-operation rollback
- **Shadow-repo slimming**: `compact` squeezes trace history so the tracking repo never bloats
