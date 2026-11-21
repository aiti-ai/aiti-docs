---
title: Local development and one-command start
icon: 🛠️
description: Clone the repository and run it with one command — extensions load in place and changes take effect immediately; dev and compiled modes
tags: [guide, local-dev, development, in-place, extension]
---

# Local development and one-command start

Edit code in the repository and run an instance directly — **no deploy into
`~/.pi/web/extensions` required**. The host already loads extensions from
`<repo>/extensions` (the bundled tier); `npm run local` fills in the surrounding
steps (dependencies, builds, start).

## 1. Requirements

- Node.js ≥ 22.19
- A git clone of this repository

## 2. One command

```bash
git clone <repo> && cd <repo>
npm run local
```

The first run does the following (later runs skip what is already done):

1. **Root deps** — `npm install` when `node_modules/next`, `node_modules/vite` or `node_modules/esbuild` is missing
2. **pi plugins** — write `pi-plugins/*` as local paths into `~/.pi/agent/settings.json` (`--no-plugins` skips; the original file is backed up as `settings.json.bak-inplace`)
3. **Extension runtime deps** — run `bin/bundled-extensions-reconcile.js`, prepare the shared `node_modules` and the `extensions/node_modules` symlink
4. **Extension client bundles** — build only extensions whose product is missing, stale or incomplete
5. **Start** — `next dev`, default http://127.0.0.1:30141

> Extensions and pi plugins are loaded **in place from their source directories**: edit → reload / rebuild / restart. No deploy step.

## 3. Compiled mode

```bash
npm run local -- --prod
```

Steps: extension builds → `next build --webpack` → `next start` (same port).
Build output lives in `.next-local/`, isolated from any existing `.next` / `.next-dev`.

## 4. Options

| Option | Description |
| --- | --- |
| `--prod` | compiled mode (build + start) |
| `--port <n>` | port (default 30141) |
| `--build-only` | dependencies + builds, no server (`npm run local:build`) |
| `--only a,b` | build only the listed extension ids |
| `--skip-build` | skip extension client builds |
| `--force-build` | rebuild every extension client |
| `--no-install` | skip root install and extension dependency reconcile |
| `--no-plugins` | do not write pi plugin local paths |
| `--restore-plugins` | remove plugin entries added by this script and exit |

## 5. Edit-and-see matrix

| Change | Takes effect |
| --- | --- |
| `app/` `lib/` `components/` `hooks/` | next dev HMR, refresh the page |
| Extension server TS (`index.ts` etc.) | `POST /api/extensions/reload` |
| Extension client (`client/**`) | `npm run local:build -- --only <id>` → refresh |
| `packages/aiti-devtools-inject` | `npm run local:build -- --only aiti-devtools` (also builds inject assets) |
| `pi-plugins/**` | restart `npm run local` (plugins load in-process) |
| Host env / port | restart `npm run local` |

## 6. Directories and data

| Item | Location |
| --- | --- |
| Extension sources | `<repo>/extensions/*` (loaded in place) |
| Extension client products | inside each extension (`dist/` or `client/`, never committed) |
| Extension runtime deps | `extensions/node_modules` → `<webRoot>/node_modules` (symlink) |
| Instance data | `~/.pi/web/data` (shared by dev/prod, same as a regular install) |
| Next output | `<repo>/.next-local` |

## 7. Troubleshooting

**Extension UI missing / client 404**
Run `npm run local:build -- --only <id> --force-build`; if the build fails, follow the hint `cd extensions/<id> && npm install`.

**Build cannot find vite/esbuild**
Run `npm install` (the root devDependencies include `vite` and `esbuild`).

**`deployed extension(s) ... shadow the in-place sources`**
The user extension layer (dev: `~/.pi/web-dev/extensions`; prod: `~/.pi/web/extensions`) contains a deployed copy with the same id, which wins over the repository source. Move it away — in-place mode needs no deployed copy.

**pi plugin changes do not apply**
Plugins load when the instance starts; restart the instance (and sessions in the TUI).

**The first start modified `tsconfig.json`**
Next adds `.next-local/types` to `include`; this is a one-time, normal change — commit it or leave it local.

## 8. Difference from a deployment

- `npm run local` is for development: extensions load from source, no `deploy-all`.
- Releases/production still use deployed artifacts (`~/.pi/web/extensions`); the two do not interfere.
- Prefer running only one instance against the same `~/.pi/web/data` at a time.
