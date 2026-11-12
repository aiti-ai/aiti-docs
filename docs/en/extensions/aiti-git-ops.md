---
title: Git Ops Shared Engine (aiti-git-ops)
icon: 🔀
description: Whitelisted git write engine — checkout precheck / stash / plan breakpoints / audit / changed topic, consumed by folder and session-manager
---

# aiti-git-ops · Git Operations Shared Engine

Zero-UI pure server-side extension: the shared git write layer for aiti-folder (commit panel/SyncBar) and session-manager (sidebar branch chip panel).

- **REST**: `POST /api/extensions/aiti-git-ops/git/*` (refs / log / checkout / branch-create / branch-delete / tags / tag-create / commit-show / commit-diff / cherry-pick / stage / unstage / discard / commit / plan/execute / plan/rollback / stash/{list,files,push,apply,drop,branch} / push / pull / fetch); cwd goes in the JSON body.
- **services**: `ctx.services.get("aiti-git-ops.api")` mirrors the REST surface (in-process direct calls).
- **Events**: `aiti-git-ops:changed:<hash(repoRoot)>` (via aiti-event-bus publish-local; subscribers keep alive with `POST /alive {types}`, pushing stops after 45s).
- **Safety**: subcommand whitelist + hand-written parameter assembly per entry + ref charset whitelist/check-ref-format; checkout never `-f`, reset only `--mixed` (unstage/discard go through `reset -q`), discarded untracked files go into the `cache/` quarantine; the checkout family runs a dirty∩affected precheck with a 409 three-way choice (worktree / stash / cancel); same-repo writes are serialized via queueRepo; audit at `state/aiti-git-ops/git-ops.jsonl` (5MB rotation).
- **Graph commit detail card (2026-09-19)**: clicking a graph row opens a card — metadata + file list (name-status×numstat merged) + per-file inline diff (400KB truncation); create branch / tag / checkout / cherry-pick (conflict 409 can abort and restore the original state), open Git Review directly, `@` to a new session.

Connected consumers: session-manager (collapsed-header `⎇` branch chip panel, with worktree mode/partial stash/block-level -p; the new-session "branch/worktree" picker reuses the same component) and aiti-folder (directory GitBar: branch panel/SyncBar/manual commit/✨ grouped commit plan — heuristic grouping + preference learning + per-group commit breakpoints + `reset --mixed` rollback). Each consumer soft-degrades when the engine is absent.

Field-tested on three platforms (Linux/Apple Git 2.24/Windows Git 2.55); data: audit at `state/aiti-git-ops/`, quarantine at `cache/aiti-git-ops/discarded/`.

Implemented: includes the git-review aiReview service AI-refinement closed loop + the commit detail card.
