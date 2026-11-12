---
title: "Config Versioning + Crash Self-Check (aiti-configs)"
icon: 🛡
description: A safety net for configuration — when AI/humans or extension changes break the config, there is a commit to revert, a diff to inspect, one-click restore; if the system crashes, a command-line watchdog recovers without relying on the broken system itself
---

# aiti-configs

> ❝ **The AI dares to change recklessly, because an entire git repo stands behind it as the undo button.** ❞
> A safety net that lets the AI experiment with confidence: every change gets a commit, a diff, and is revertible; if things break, the command-line watchdog fishes everything back from outside the system.

A standalone extension for config versioning + crash self-check (the M4 split-out of the former ai-helper). **Does not depend on ai-helper being alive** — the watchdog is pure command line and runs even when pi-web/the bridge is down.

- **Registration-based includes (the ecosystem joins automatically)**: any extension declaring `configs.includes` gets versioned (declarations from all extensions are aggregated at startup + handwritten entries in `ai-configs.json`)
- **Plaintext small configs only**: session JSONL / logs / binaries / >512KB never enter the repo (hard excludes + size double safeguard); sensitive content (token/key/password) is scanned and blocked
- **Safety-shield web page (🛡)**: status (change list + commit) / history (versions + diff preview + one-click restore) / self-check report / config viewing and editing
- **MCP tools** (`aiti_configs_status/commit/restore/selfcheck/log/config`): used directly by the AI — inspect diffs before/after config changes, roll back when things break
- **watchdog CLI**: `ai-configs status/commit/selfcheck/restore/recover/export/import` (pure Node, zero dependencies)
- **Five-step recovery protocol (no data loss)**: freeze the scene → create a pre-recover tag → checkout and write back to source → re-test → write HEAD
- **Freeze the scene before operations (modeled on etckeeper Pre-Invoke)**: `POST /snapshot` (sync+commit+optional tag) — **invoked automatically before ai-helper invoke**, so the AI backs up before changing configs/extensions and can roll back if things break
- **Tags mark "known-good versions"**: safety-shield history tab 🏷 create/list/delete tags + `configs_tag` tool + `GET/POST/DELETE /tag` API; rollback can point directly at a tag (e.g. `good-v1`)
- **Exposed to other extensions**: programmatic `POST /snapshot`, `POST/DELETE /tag`, `POST /commit` APIs + MCP tools (status/commit/snapshot/restore/selfcheck/log/config/tag) — **adapter recipe for other extensions: declare configs.includes to join automatically (see the internal onboarding guide)**

## Config `ai-configs.json` (after the 2026-09 repo relocation it lives in `~/.pi/configs-self/`, editable by AI)

> The extension's own config is separate from its dataDir (so clearing dataDir doesn't lose the config along with it), and is included into the backup scope via configs-self.
> Configs at the old location (aiti-configs dataDir) are migrated automatically in one shot on first load — no manual handling needed.

```jsonc
{
  "repo": "~/.pi/configs",                // Config repo path (default after the repo relocation; old repos archived at ~/.pi/configs-archive-*)
  "includes": [                           // Handwritten entries (extension declarations are aggregated automatically)
    { "path": "~/.pi/agent/settings.json", "dest": "pi/agent/settings.json" },
    { "path": "~/.pi/agent/models.json",   "dest": "pi/agent/models.json" },
    // System skills (~/.pi/agent/skills/) are not included — don't pollute system skills
    { "path": "extensions/aiti-ai-created/**", "dest": "src/ai-created/" },
    { "path": "~/.pi/configs-self/**",     "dest": "self/" }   // The extension's own config, protected from self-loss
  ],
  "hardExcludes": [ "**/auth.json", "**/*.key", "**/*token*", "**/sessions/**", "**/*.jsonl" ],
  "sizeLimitKB": 512
}
```

**Data tiering (2026-09)**: web/data is split into three tiers — `ctx.configDir` (config area, this extension's backup scope) / `ctx.stateDir` (non-regenerable data, excluded from backup) / `ctx.cacheDir` (`<configDir>/cache/`, deletable and rebuildable, excluded);
`ctx.dataDir` has been removed (access throws). Tiering fallback excludes (`**/cache/**`, `**/state/**`, etc.) are built into the default config.
Backup of large state-tier data (archives/history) is handled by the separate **aiti-backup** extension (planned, snapshots + hard links + retention rotation) — this extension only handles config/small-data versioning.
See [Extension Data and Storage](/en/guide/ext-data.md) and authoring-reference §2.1/§2.2.

**Size self-defense**: `selfcheck` includes repo size checks (workspace >100M / .git >300M reported as bad); a `snapshot` sync of >50M in one shot (`snapshotGateMB` adjustable) is rejected with a hint to check excludes; `force:true` waives it once.

## watchdog CLI (command-line fallback when things crash)

```bash
node <extDir>/watchdog.mjs [dataDir] status     # Sync + change summary
node <extDir>/watchdog.mjs [dataDir] commit     # Commit (conventional message)
node <extDir>/watchdog.mjs [dataDir] selfcheck  # Self-check (repo / key JSON files / extension entry)
node <extDir>/watchdog.mjs [dataDir] restore --commit=<hash> --yes  # Five-step restore
node <extDir>/watchdog.mjs [dataDir] recover    # Diagnostic bundle (feed to a standalone AI session for repair)
node <extDir>/watchdog.mjs [dataDir] export/import  # Migration (sessions not included)
```

> Full design: internal plan document (including extension points: registration-based includes, automatic sentinel, AI smart commits, migration bundles).
