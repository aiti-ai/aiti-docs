---
title: aiti-backup
icon: 🗄️
description: "pi-web data backup extension (state-tier snapshots: hardlink incremental + retention rotation + strictly read-only sources; complements aiti-configs)"
---

# aiti-backup

> ❝ **config has its safety net; state deserves one too.** ❞

Snapshot backup for big state-tier data (session archives `.pwarc`, git-trace ops, `~/.pi/agent/sessions`) —
complementary to aiti-configs: configs handles "small-config git versioning"; this extension handles "big-data snapshots".

## Mechanism

- **Snapshot semantics**: each backup = `<dest>/<sourceId>/snapshots/<UTC timestamp>/` full point-in-time copy + `manifest.json` (completion marker);
- **Hardlink incremental**: same path as the previous snapshot with matching size+mtime → `fs.link` zero-copy; when the target disk doesn't support it (exFAT etc.) the whole round degrades to copying automatically;
- **Source strictly read-only**: backup never writes/deletes the source; symlinks are not followed; runtime noise names excluded by default;
- **Execution isolation**: scan/copy runs in a standalone child process; progress flows via stdout JSONL → event-bus topic family `aiti-backup:progress|done|error` (same family as `aiti-omp-agent:rebind`; no polling);
- **Interrupt safety**: a kill at any moment can only leave `.tmp-*` half-finished artifacts (auto-cleaned on the next run); a per-source run lock prevents concurrency;
- **Retention rotation**: `keepCount` (default 7) deletes the oldest, only among timestamp-named dirs inside snapshots/.

## Quick start (API form; UI panel = M5)

```bash
base=/dev/api/extensions/aiti-backup            # drop /dev for the prod instance
curl -s localhost:30142$base/status                                   # source list (state auto-discovery + pi-sessions)
curl -s -X POST localhost:30142$base/config -H content-type:application/json \
  -d '{"dest":"/mnt/your-backup-disk"}'                               # set destination (mutual-exclusion check against sources)
curl -s -X POST localhost:30142$base/backup -H content-type:application/json -d '{"all":true}'
curl -s localhost:30142$base/runs                                     # run history
```

- Source toggles: `POST config {"sourceOverrides":{"pi-sessions":{"enabled":false}}}`; custom sources: `custom:[{id,path}]`.
- The destination is the user's choice (external drive/NAS); **backup contents are not encrypted** — session content contains privacy, keep it on a disk you control.
