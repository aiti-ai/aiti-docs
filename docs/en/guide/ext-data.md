---
title: Extension Data and Storage Specification
icon: 💾
description: "The three-tier data model for pi-web extensions: config / state / cache — decision tree, behavioral contract, migration iron rules, protection matrix (required reading for extension authors)"
tags: [guide, ext, data, storage, extension, 方案/已实施]
---

# Extension Data and Storage Specification

> ❝ Before writing any data, ask one question: **if it is deleted, what does the user lose?** — the answer decides which tier it lives in. ❞

Every extension has its own data directory `~/.pi/web/data/<extId>/` (override with env `PI_WEB_DATA_DIR`; the dev instance isolates under `~/.pi/web-dev/data`). The host **splits it into three tiers by purpose** (aligned with Linux's XDG / systemd directory conventions; the three directories are symmetric since 2026-09-13):

| Tier | API | Location | One-line definition | Touchstone |
|---|---|---|---|---|
| Config | `ctx.configDir` | `config/` | User/admin settings input | Deleted → must **reconfigure** |
| Persistent data | `ctx.stateDir` | `state/` | Non-regenerable data | Deleted → **lost forever** |
| Cache | `ctx.cacheDir` | `cache/` | Regenerable data | Deleted → **automatically rebuilt** |

> Directory shape: `data/<extId>/{config,state,cache}/` (three symmetric directories).
> `ctx.dataDir` has been removed (throws on access) — migrate legacy code to the three tiers per this page.

## 1. Decision Tree

```
About to persist a piece of data? Ask yourself in order:

1. If deleted, can the next run rebuild it automatically? (indexes/thumbnails/venvs/downloads/logs)
      Yes ──────────────▶ ctx.cacheDir
2. Is it "a small set of key-values explicitly set/entered by the user"? (settings/api-keys/model selection/tags/dictionaries/hot words)
      Yes ──────────────▶ ctx.configDir (the `config/` subdirectory)
3. Everything else (archives/history/statistics records/databases/user creations/exports)
      ──────────────────▶ ctx.stateDir
```

Boundary rules:

- **Databases**: only rebuildable indexes → `cache/`; contains non-regenerable records (history, statistics) → `state/`;
- **Logs**: pure debugging → `cache/`; audit/historical value → `state/`;
- **Rebuildable indexes/statistics**: a store with a complete reload mechanism (rebuildable from raw data/sessions/archives) → `cache/` — **the ability to rebuild is itself the proof of "regenerable"** (example: aiti-ai-usage's `usage.sqlite` can be fully reloaded from pi sessions and `.pwarc` archives; in practice the reloaded result is more complete than the old incrementally-built store). The key question: "does the reload source still exist?" — source present (sessions/archives/config) → cache; unique records with no reload source → state.

## 2. Behavioral Contract

| Dimension | config | state | cache |
|---|---|---|---|
| Effect of `rm -rf` | Reconfiguration required (recoverable) | **Lost forever (unrecoverable)** | No loss (auto-rebuilt) |
| Extension self-healing duty | — (treated as long-lived) | **Must not assume loss** (unreadable = abnormal) | **Must** rebuild itself on next access |
| Backed up by aiti-configs | ✅ included by default | ❌ excluded | ❌ excluded |
| Backed up by aiti-backup | — (configs already covers it) | ✅ included by default (planned) | ❌ not needed |
| Auto-cleanup allowed | ❌ | ❌ (only per the extension's own retention policy) | ✅ anytime |
| Size expectation | KB-scale | MB–GB scale | Any |

**Hard red lines**:

- The `cache/` directory must self-heal after a full `rm -rf` — your extension must be robust to the "cache completely empty" state (db rebuilds indexes, venv rebuilds the environment, logs re-accumulate);
- Before putting data into `state/`, confirm its **non-regenerability** — data here is gone once deleted; the extension must not treat it like a cache (no auto-cleanup, no "rebuild"-style fallback);
- **Writing db / logs / large files at the config root is forbidden** (they enter the config backup pipeline; large files drag the backup down — learned from an actual 18G incident).

## 3. Host Support Status (`ctx.stateDir`)

`ctx.stateDir` is **supported** (host since 2026-09 `7e3e992`); **the three symmetric directories (config/ + state/ + cache/) since 2026-09-13** (`ctx.configDir` = `data/<id>/config`, fully migrated on all three test machines).
All three tiers have fully landed on the three machines (48 / 155 / 23).

Fallback for older hosts (that don't inject `stateDir`) — semantically identical, safe for long-term use:

```ts
import path from "node:path";

const stateDir = ctx.stateDir ?? path.join(ctx.configDir, "state");
```


## 4. Data Protection Matrix (Who Provides Your Fallback)

| Tier | Backup mechanism | Notes |
|---|---|---|
| config | ✅ **aiti-configs** | git-repo versioning: viewable diffs, rollback, crash sentinel |
| state | ✅ **aiti-backup** (design reviewed, pending implementation) | Snapshot backup: hardlink increments + retention rotation + restore; **placing data in the right tier = automatically protected**, zero wiring in the extension |
| cache | — | Not needed — deleted means auto-rebuilt |

The division-of-labor mnemonic when writing extensions: **config goes to configs, data goes to backup, cache goes to no one**.

## 5. Migration Iron Rules (From Real Incidents)

When changing data paths or relocating existing data, check against these one by one:

1. **Write == read from the same source**: extract the data path into a single constant/function; the write side and the read side reference the same source — any one-sided path change causes the silent failure of "data exists but can't be used" (one extension suffered read/write split this way, with its restore feature silently broken for 30+ hours);
2. **Migration goes through a one-off script (extensions carry no baggage)**: existing-data relocation is executed by `scripts/migrate-state-tier.mjs` in the deployment flow (stop service → upgrade → migrate → restart); extension code **contains no** runtime migration logic; the script is per-entry, idempotent, moves without deleting — **never** use "does the target directory exist" to decide whether migration happened (a pre-created empty directory freezes migration permanently);
3. **Merge split-writes; never overwrite**: if upgrade precedes migration (writes during runtime), the new location accumulates rebuilt-from-scratch/new data — deduplicate and merge by key/row (see `scripts/merge-split-ledger.mjs` and the migration script's merge-type entries); never overwrite directly with the newer file;
4. **Tests assert physical locations**: after writing, assert the file's **exact landing spot** (not just logical state) — "where production writes" must have test coverage;
5. **Non-regenerable data must not live in directories with `rm -rf` semantics**: before migrating/refactoring, confirm the data's regenerability; don't casually move state-tier data into the cache area;
6. **Failures of low-frequency operations must be visible**: failures of long-tail operations like restore/export/rollback need user-visible feedback (don't silently roll back the UI), with regression test cases.

## 6. Common Mistakes Checklist

| Mistake | Consequence | Correct approach |
|---|---|---|
| Large files / venv / db at the config root | Config backup bloats/slows, dragging everyone in | Follow the decision tree: state or cache |
| Archives/history in `cache/` | One cleanup = permanent loss | `state/` |
| Assuming `cache/` is always there | Crashes/errors after cleanup | Implement self-healing rebuild |
| Assuming state is rebuildable | User data loss | Never assume; follow the §2 contract |
| Rebuildable indexes in `state/` (e.g. usage statistics) | Semantic error: regenerable data in the undeletable tier; stuck between rebuild and growth | Has a reload source → `cache/` (§1 boundary) |
| Hardcoding `~/.pi/web/data` | dev/prod isolation breaks; migration gets hard | Always use `ctx.configDir` / `stateDir` / `cacheDir` |
| Using `existsSync(to)` to decide "already migrated" | Migration silently frozen | Judge per entry (§5.2) |
| Separate `join(...)` for write and read paths | One-sided change → silent failure | Single path constant (§5.1) |

## 7. References

- **Cross-extension calls**: [Extension Services and Cross-Extension Call Specification](/en/guide/ext-services.md)
- **Lazy loading**: [Lazy-Loading Contract](/en/guide/ext-lazy-loading.md)
- **Plans and background**: config/cache split (implemented); state as the third tier (**implemented**, incl. the three-machine migration record); data backup handled by aiti-backup (design reviewed)
