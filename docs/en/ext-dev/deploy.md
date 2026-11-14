---
title: Deployment & Hot Reload
icon: 📦
description: Extension directory layers and priority, dev/prod isolation, reload/status APIs, extman install and versioning
tags: [ext-dev, deploy, reload, extman]
---

# Deployment & Hot Reload

## 1. Directory layers and priority

Code and data are separated; when the same id exists in multiple layers, **higher layers shadow
lower ones**:

| Layer | Directory | Notes |
|---|---|---|
| user | `~/.pi/web/extensions/` (`PI_WEB_EXTENSIONS_DIR` overrides) | The official install location |
| extra | `PI_WEB_EXTRA_EXTENSIONS_DIRS` (comma-separated) | Environment-injected middle layer (list order wins) |
| dev | `<host package dir>/dev-exts/` | Dev-instance-only (e.g. the dev-page injection FAB) |
| bundled | `<host package dir>/extensions/` (`PI_WEB_BUNDLED_EXTENSIONS_DIR` overrides) | The baseline shipped with the package |

Data root: `~/.pi/web/data/<id>/` (`PI_WEB_DATA_DIR` overrides) — internally split into the
config/state/cache tiers ([storage guide](/en/guide/ext-data.md)).

## 2. dev/prod isolation

With `PI_WEB_DEV_DIST=1` (dev server / dev systemd service), the default roots move to
**`~/.pi/web-dev/`**:

- The dev instance loads `~/.pi/web-dev/extensions/` and **never loads the production extension
  set nor shares its runtime state**;
- Explicit `PI_WEB_EXTENSIONS_DIR` / `PI_WEB_DATA_DIR` always win.

So: during development put the extension in `~/.pi/web-dev/extensions/<id>/`; for production
install to `~/.pi/web/extensions/<id>/`.

## 3. Hot reload (server side)

```bash
# Server code change → hot reload (jiti moduleCache:false, code takes effect)
curl -X POST http://127.0.0.1:<port>/api/extensions/reload

# Load status / versions / errors (one failing extension never blocks the others)
curl http://127.0.0.1:<port>/api/extensions/status
```

Hot reload flow: `shutdown()` one by one → clear cache → `loadAll()` → `startAll()` → on success,
atomic swap of `globalThis.__piWebExt`. Clean up in `shutdown`; the core then unwinds the
extension's provided services and unregisters session backends automatically.

## 4. Making the frontend bundle take effect

- After `reload`, **refresh the browser** — client bundles live in the browser's ESM module map
  cache; the server reload doesn't clear it.
- Alternatively trigger the host client reload from the page: `ctx.reloadExtensions()` (fresh
  manifest + graph reconciliation + invalidating materialization; this is what the extension
  manager flow uses internally).

## 5. Install forms

| Form | How |
|---|---|
| Manual | Copy the directory to the instance's extension root → reload |
| extman | The extension manager (🧩 in the toolbar): search / enable-disable / install / online registry → [aiti-extman](/extensions/aiti-extman.md) |
| Bundled | Ship inside the host package's `extensions/` baseline (bundled layer; a same-name user directory shadows it) |

## 6. Versioning

- **The single source of truth is `package.json`'s `version`** (maintained by the release flow);
  the entry's `version` field is a legacy fallback only — new extensions must not write it.
- Registry/extman/manifest all display the package.json version (falling back to the entry value
  only when absent).
- Publishing discipline (private-registry validation → official npm) lives in the publishing
  repos; docs-catalog registration see the [ext metadata spec](/extensions/spec.md).

## 7. Troubleshooting

| Symptom | Check |
|---|---|
| Extension missing after reload | `status` for load errors; entry file name / directory id mismatch |
| Client changes not taking effect | Did you refresh the browser? Does the bundle path match the entry's `client` field? |
| API 404 | Unmatched paths must explicitly `return null` (the host treats null as 404; undefined is equivalent); check route assembly: `/api/extensions/<id>/<path...>` |
| A depended-on extension is missing | extman details show dependency resolution (`dependsOn` is a declarative warning, does not block loading — degrade at runtime) |
| Dev extension not visible in production | The dev root is `~/.pi/web-dev/extensions/`; production installs `~/.pi/web/extensions/` |
