---
title: aiti-agent Extension Points
icon: 🧩
description: The aiti-agent extension framework — slots, contracts, lifecycle, and how to add new extension points
---

# aiti-agent Extension Points

> All business features of aiti-agent are implemented as **extensions**, interacting with the core only through **extension points**.
> If you want to build your own features or add something to aiti, read this page first.

## 1. Overall Model

```
Browser (aiti-agent frontend)
  ├── <ExtSlot name="toolbar" />   ← slot: renders UI items registered by extensions
  ├── <ExtSlot name="dialogs" />   ← slot
  └── ... each slot dynamically imports the extension's client bundle via ExtSlotsProvider
          (precompiled ESM; React is provided by the host; extensions do not import react)

aiti-agent server (Next.js)
  ├── instrumentation → extRegistry.loadAll() + startAll()
  │                       (jiti loads ~/.pi/web/extensions/*/index.ts)
  ├── /api/extensions/<id>/<path>  ← catch-all shell → dispatches to the extension's server.api()
  ├── proxy.ts middleware         ← extension server.middleware() hook (fail-closed)
  └── /api/extensions/manifest    ← frontend manifest (ui metadata + clientUrl + i18n)
```

An extension = one directory + one entry file (a `default export` extension object). Code lives in
`~/.pi/web/extensions/<id>/`, runtime data in `~/.pi/web/data/<id>/` (code/data separation).

## 2. Directory Conventions and Source Layering

| Layer | Root directory | Description |
|---|---|---|
| user | `~/.pi/web/extensions/` (override with `PI_WEB_EXTENSIONS_DIR`) | Official install location |
| extra | `PI_WEB_EXTRA_EXTENSIONS_DIRS` (comma-separated) | Intermediate layer injected by the environment |
| dev | `<aiti-agent package dir>/dev-exts/` | Dev instance only (e.g. dev page injection) |
| bundled | `<aiti-agent package dir>/extensions/` (override with `PI_WEB_BUNDLED_EXTENSIONS_DIR`) | Baseline shipped with the package |

Priority for the same id: **user > extra > dev > bundled**.

Entry file names: `index.ts` / `index.mjs` / `index.js` / `index.cjs`; when a directory contains only
one script file, a single-file layout also works. Loading uses jiti to transpile TS (`moduleCache: false`,
so hot reload takes effect).

## 3. Extension Object Contract

```ts
export default {
  id: "my-ext",               // must match the directory name
  name: "My Extension",
  version: "0.1.0",
  icon: "🧰",                 // optional, marks the extension's identity in the UI
  client: "client/bundle.mjs",// optional, relative path to the frontend bundle (precompiled ESM)

  server: {
    async startup(ctx) {},       // startup hook: open connections / start timers / initialize
    async shutdown(ctx) {},      // shutdown hook: cleanup / persist (called on hot reload/exit)
    async api(req, ctx) {},      // API dispatch: /api/extensions/<id>/<path...>
    async middleware(req) {},    // optional: global middleware hook (fail-closed)
  },

  ui: {                          // slot metadata (the actual UI is rendered by the client bundle)
    toolbar: [{ id, label }],
    sidebar: [{ id, label, badge }],
    sessionTopbar: [{ id }],
    sessionRowActions: [{ id }],
    dialogs: [{ id, label }],
    banners: [{ id }],
    pages: [{ id }],
    chatInputTop: [{ id }],
    i18n: { en: {...}, "zh-CN": {...} },
  },
};
```

## 4. Slot Overview

Frontend slots are rendered by `<ExtSlot name=.../>` in `components/ExtSlots.tsx`. Extensions register
the actual components via `ctx.registerItems(slot, items)` in the client bundle.

| Slot | Mount location | Carries | Current users |
|---|---|---|---|
| `toolbar` | Top toolbar (next to globe) | Tool buttons (with icon/label); supports declarative items (see below) | aiti-devtools (🧰 entry), aiti-cmd, aiti-testagent (declarative) |
| `sidebar` | Sidebar header (next to New/Refresh) | Panel entry button + running-count badge | session-manager |
| `sidebarFooter` | Sidebar bottom quick-action row (same row as models/skills/plugins) | Quick-entry buttons (same style as built-ins) | aiti-extman (🧩 extension management) |
| `sessionTopbar` | Chat top bar | Current session tag area (chips + ★ + edit) | session-manager |
| `sessionRowActions` | Hover action area of sidebar session rows | Inline ★ / tag buttons | session-manager |
| `dialogs` | AppShell dialog area | Dialogs | aiti-devtools, aiti-cmd (terminal) |
| `banners` | Page-top alert area | Alert banners | service-tunnels (self-exposed alerts) |
| `pages` | AppShell tab system | Full-page views | session-manager (kanban) |
| `chatInputTop` | Above the chat input | Input assistance area | aiti-devtools (inspect candidates), demo-lazy (word count) |
| `userMessageActions` | Hover action area at the bottom of user messages | Message-level action buttons | aiti-prompts (favorite prompt), demo (📌) |
The table above is the **common subset** — the host slot full table has **29+ slots** (beyond the 10 above: dock-family `sidebarContent`/`sidebarProjects`/`rightFileDock`/`sidebarExplorerDock`/`terminalDock`/`compactLead`/`modelInfoLead`; chat-surface `chatOverlay`/`composerTools`/`assistantMessageActions`/`sessionRowMeta`; model/settings-surface `modelSelector`/`sessionStats`/`settingsModels`/`settingsAgentsFeature`; new-session surface `newSessionWidgets`/`newSessionSelectors`/`newSessionPreparers`/`newSessionBackendOptions`/`workspacePickerActions`/`queuePanel`/`fileViewer`/`pathPicker`, etc.). See the extension authoring reference (`docs/dev-repo-authoring-reference.md`, "slot full table").

### Slot Context (render props)

Slot components receive `currentSession` plus slot extras (e.g. `onSelectSession` / `activeCwd` /
`newSessionCwd`), so they are aware of the currently selected session.

### Toolbar Declarative Items (2026-08 contract)

The appearance of toolbar items (buttons/icons/dividers) is rendered **uniformly by the host**;
extensions no longer hand-draw their own buttons — eliminating style-constant drift copied extension
by extension (historically three of them were inconsistent: plan-first's green icon, Plan adoption's 📥,
Java's rounded corners).

```js
// Fully declarative (no render): the host renders the standard 36×36 grayscale button (right divider + hover); the ⋯ menu gets the same icon slot + text
ctx.registerItems("toolbar", [{
  id: "java",
  meta: {
    label: "Java",                         // ⋯ menu text + fallback title
    title: t("at.title"),                  // hover tooltip (optional)
    icon: { svg: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>' },
    onClick: () => panel.open(),           // click callback (receives the click event)
  },
}]);

// Item with state (has render): render only handles the toolbar body itself (badge/status color);
// once meta.icon + meta.onClick are provided, the icon slot and click in the ⋯ menu belong to the host; render's menu branch is no longer used
ctx.registerItems("toolbar", [{
  id: "plan-review-open",
  render: ToolbarButton,                   // includes pending badge/highlight
  meta: { label: "Plan adoption", icon: { svg: "..." }, onClick: () => setPanelOpen(true) },
}]);
```

Three forms of `meta.icon` (`ExtUiItemIcon`):

- `{ svg: "..." }` — an SVG inner markup string with a 24×24 viewBox (lucide line style, stroke=currentColor)
- an emoji string (e.g. `"📥"`)
- a relative path to an `.svg` file inside the extension (e.g. `"icon.svg"`; rendered via CSS-mask, color follows currentColor)

Constraint: declarative items are only supported by the `toolbar` slot; interactive widget slots such
as `sessionTopbar` must still provide render.
Consumers narrow uniformly with `hasExtRender()` (ExtSlot/pathPicker/FileViewer already filter built in).

### Extension Points Beyond Slots

Besides slots, the client-side `register(ctx)` also provides two behavior-level extension points:

- **`ctx.registerChatHook({ preSend })`** — chat send hook: rewrite text before sending /
  collect candidate elements (aiti-devtools' `[element N]` replacement is implemented with this).
- **`ctx.registerPopoverAction(provider)`** — message-click recognition popover (QuoteReplyPopover):
  click a paragraph → the full paragraph text is handed to each provider's `recognize(text, { cwd })`
  (may validate asynchronously) → returns action buttons (`{ type, label, danger, unavailable, onClick }`) → clicking executes.
  Built-in conventional types: `quote` (reply to a question) / `file` (file) / `command` (command);
  extensions can customize any string. aiti-cmd's command recognition uses this extension point.

## 5. Server-Side Hooks

| Hook | Timing | Purpose |
|---|---|---|
| `startup(ctx)` | Service startup (instrumentation `startAll`) | Open connections, start timers, initialize state |
| `shutdown(ctx)` | Hot reload/exit | Cleanup, persist |
| `api(req, ctx)` | `/api/extensions/<id>/<path...>` hit | The extension's own API (returning `null` = 404) |
| `middleware(req)` | Every request, before the DNS-rebinding gate | vhost branching, gating, etc. (**throwing = fail-closed 403**) |

`ctx` (server side): `{ id, dir, dataDir, core }`, where:

- `dir`: the extension code directory (read-only, for static assets);
- `dataDir`: `~/.pi/web/data/<id>/` (guaranteed to exist by the framework);
- `core`: the core data contract — extensions must **not implement themselves** session reading / running state / file access:

```ts
interface ExtCoreApi {
  listSessions();                 // session list (incremental cache)
  getRunningSessionIds();         // RPC running set
  getHomeDir();
  readSession(id);                // full session context (messages + entry ids)
  fileAccess: { allowRoot(root); isAllowed(p); }  // reuses aiti-agent's file safety rules
}
```

## 6. Client Bundle Protocol

- `ui.client` points to **a single precompiled ESM file** (can be bundled with esbuild, or hand-written as `.mjs`).
- the bundle does `default export function register(ctx)`; ctx provides:
  `{ h, useState, useEffect, useRef, useCallback, useMemo, t(key, params), apiUrl(path), registerItems(slot, items), registerChatHook(hook), registerPopoverAction(provider) }`.
- **no react imports**: `h` and the hooks are passed in by the host (single React instance, provided via importmap).
- component = `(props) => ReactNode` (props include `currentSession` and slot extras).
- **Rules of Hooks**: hooks must be called before any conditional returns.

## 7. Lifecycle

```bash
# Server-side code change → hot reload (jiti moduleCache:false, code takes effect)
curl -X POST http://127.0.0.1:<port>/api/extensions/reload   # dev instance

# Frontend bundle change → refresh the browser after reload (ESM module map cache)
curl http://127.0.0.1:<port>/api/extensions/status           # load status/versions/errors
```

Hot reload: `shutdown()` one by one → clear cache → `loadAll()` → `startAll()`; on success, atomically
swap `globalThis.__piWebExt`; a single extension failing to load does not block the others (errors go into status).

## 8. Security and Constraints

- Extensions = **fully server-privileged code**, loaded only from trusted directories (`~/.pi/web/extensions/`).
- A `middleware` hook throwing → fail-closed 403 (aiti-agent core fallback).
- New business features **must not be written into the aiti-agent repo**; if a new core capability is
  needed → extend the `ctx.core` contract or slot props (change the contract/slot first; the business
  logic still lives in extensions).

## 9. Existing Extensions

| Extension | Location | Description |
|---|---|---|
| session-manager | `~/.pi/web/extensions/session-manager/` | Cross-project session panel: tag tree + colors / favorites / search (FTS5) / archive (.pwarc) / kanban |
| service-tunnels | `~/.pi/web/extensions/service-tunnels/` | Service port discovery + tunnels + self-exposure (middleware hook consumer) |
| aiti-devtools | Main repo source → deployed artifacts | In-page AI debugging assistant: MCP bridge + injection + AI window (toolbar/dialogs/chatInputTop + ChatHook) |
| aiti-cmd | `~/.pi/web/extensions/aiti-cmd/` | Command manager: real PTY terminal + common commands + message-recognized commands (PopoverAction consumer) |
| demo | `~/.pi/web/extensions/demo/` | All-slots demo (for framework validation, removable) |
| dev-exts/aiti-inject | Main repo `dev-exts/` | Dev instance only: injects the production launcher (FAB) into dev pages |

## 10. Need a New Extension Point?

When the existing slots/hooks are not enough:

1. Open a PR in the **aiti-agent repo** to add the extension point:
   - `lib/ext/types.ts`: add a slot name to `ExtSlotName`, or add new contract fields;
   - `components/ExtSlots.tsx`: add a `<ExtSlot name="..." />` mount location,
     extend `ExtClientContext` (e.g. a new hook);
   - same on the server side: add capabilities to `ExtServerHooks` / `ExtCoreApi` in `lib/ext/types.ts`.
2. **Business code still lives in extensions**; the core keeps only mount points and contracts.

This way the extension ecosystem can evolve independently while the core stays small and stable.
