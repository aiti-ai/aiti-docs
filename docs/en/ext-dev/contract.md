---
title: Extension Object Contract
icon: 📜
description: Full PiWebExtension field reference — every entry field, its type and semantics
tags: [ext-dev, contract, reference]
---

# Extension Object Contract

The extension entry (`index.ts` etc.) default-exports one object; the host reads it by structural
contract. Source of truth: host `lib/ext/types.ts` (`PiWebExtension`).

## 1. Top-level fields

| Field | Type | Required | Semantics |
|---|---|---|---|
| `id` | `string` | ✅ | Unique id, **must match the directory name**; the registry key, API route and service-key prefix all derive from it |
| `name` | `string` | ✅ | Display name |
| `version` | `string` | ⚠️ | **Never hand-write** — the source of truth is `package.json` (release flow maintains it); the entry value is only a fallback when package.json has none (legacy compatibility). New extensions must not declare it |
| `icon` | `string` | — | Short icon: emoji (`"🧰"`) or a relative path to an icon file inside the extension (`"icon.svg"`, lucide line style) |
| `category` | `string` | — | App-center category tag; internal category ids (session/code/ai/auto/debug/ui/system/other) show localized labels, other values display verbatim as custom categories |
| `description` | `string` | — | One-liner; falls back to `package.json` `description`; passed through the manifest to app-center |
| `client` | `string` | — | Relative path to the frontend bundle (a single precompiled ESM, e.g. `"client/bundle.mjs"`) |
| `server` | `ExtServerHooks & { agent? }` | — | Server hooks (see §2) |
| `ui` | `ExtUiDefinition` | — | Slot metadata and client behavior declarations (see §3) |
| `features` | `ExtFeature[]` | — | Feature management (per-item toggles) → [feature guide](/en/ext-dev/features.md) |
| `conflicts` | `string[]` | — | Conflicting extensions: identifiers are npm package names (scoped written in full); when assembling SDK load results the platform removes matching packages/paths **wholesale** (never initialized) |
| `dependsOn` | `string[]` | — | Hard dependencies: elements are **extension ids or capability names** (`cap.*` prefix convention; exact id match wins). Disabled/uninstalled deps show a warning in extman; missing ones are flagged "dependency unsatisfied". **Declarative only — does not block loading**; runtime fallback is the extension probing the manifest itself |
| `optionalDependsOn` | `string[]` | — | Optional dependencies (npm optionalDependencies semantics): extra capability when present; absent/disabled has no effect at all, no warnings; shown only in extman details |
| `provides` | `string[]` | — | Provided capabilities (multiple extensions may declare the same one); consumers can point `dependsOn` at a capability name; the platform arbitrates the effective provider: **user pin > takeover declarer > newest semver > id lexicographic**. Capability names conventionally carry `cap.` (not enforced) |
| `takeover` | `string[]` | — | Exclusive takeover declaration: multiple declarers of the same capability = conflict; one effective winner is arbitrated (does not block loading; conflicts surface in the extman panel). Distinct from `ui.provides` (EXT_PROVIDES built-in takeovers, a legacy special case) |
| `startupPriority` | `number` | — | Server startup priority: higher starts earlier (default 0; same priority keeps scan order, stable), shutdown in symmetric reverse. For infrastructure extensions (e.g. event-bus = 100) that must be ready before consumers. Affects start/stop order only, not dependsOn semantics |
| `publicApi` | `string[]` | — | Cross-origin GET whitelist for API paths: elements are paths after `/api/extensions/<id>/` (joined with `"/"`, e.g. `"cpu-meter.js"`), exact match. For read-only assets injected into arbitrary pages server-side (cross-site `<script src>` is double-blocked by the request-security gate + ORB by default). Security boundary: GET only + exact paths; writes and undeclared paths still go through the default gate |

## 2. `server` hooks

| Hook | Timing | Semantics |
|---|---|---|
| `startup(ctx)` | Service startup (instrumentation `startAll`) | Open connections, start timers, register services/session backends; ctx see [Server ctx API](/en/ext-dev/server-api.md) |
| `shutdown(ctx)` | Hot reload / exit | Cleanup, persist; the core unwinds the extension's provided services afterwards |
| `api(req, ctx)` | `/api/extensions/<id>/<path...>` hit | Return a `Response`; `null`/`undefined` = 404; ctx is `ExtApiContext` (adds `method` / `path[]` / `searchParams`) |
| `middleware(req)` | Every request, before the core DNS-rebinding gate | Return `{ handled: true, response }` to short-circuit, or `{ handled: false }` to pass; **throwing = fail-closed 403** |
| `rescanBackends(ctx)` | POST `/api/session-backends/rescan` | Backend extensions re-run probe+register (idempotent; re-registering overwrites the availability snapshot); return `{ registered?, unavailable? }` aggregated into the response. startup scans once — CLIs installed after boot are picked up here |
| `agent.*` | Every agent session | Per-session extension point: `agentTools` / `onAgentSession` / `onAgentSessionEnd` / `onAgentSettled` → [AI integration](/en/ext-dev/ai.md) |

## 3. `ui` fields (ExtUiDefinition)

| Field | Semantics |
|---|---|
| `toolbar` / `sidebar` / `dialogs` / `banners` / `pages` / `chatInputTop` / … | Static item declarations per slot (`ExtUiItem[]`) — the "zero-bundle entries" the host can render before the client materializes; full table see [slot reference](/en/ext-dev/slots.md) |
| `provides` | Take over host built-in capabilities (`EXT_PROVIDES`): current values `"session-delete"` (sidebar hides the built-in delete button) / `"session-agent-source"` (auto-discovery of session sources) / `"queue-panel"` (hide the queue fallback banner) |
| `clientImmediately` | Default `true`; `false` = lazy (the bundle materializes when rendering first reaches a slot this extension declared) → [lazy-loading contract](/en/guide/ext-lazy-loading.md) |
| `clientDependsOn` | Other extensions the client bundle depends on: startup-graph inject edges (parallel prefetch / load-order hints) — **not a correctness dependency**; affects prefetch scheduling and HMR diff display only |
| `clientLazyVia` | `"service"`: credential for lazy extensions with no ui[slot] static items whose render surface is delivered to consumer extensions via a client service (exempts them from the "ineffective lazy marker" static diagnostic) |
| `i18n` | `Record<locale, Record<key, message>>`; looked up by client `ctx.t(key, params)` → [i18n & security](/en/ext-dev/i18n-security.md) |

## 4. Static items (ExtUiItem)

| Field | Semantics |
|---|---|
| `id` | Item id (composite id = `"extId:itemId"`) |
| `label` / `title` | Menu text / hover tooltip |
| `icon` | Declarative icon: `{ svg }` (24×24 viewBox inner markup, lucide line style, stroke=currentColor) / emoji / relative `.svg` path inside the extension (CSS-mask rendered) — the host renders a unified grayscale line style to stop per-extension style drift |
| `badge` | Slot-specific hint (e.g. sidebar badge) |
| `noMenuLabel` | The menu entry already carries full content (e.g. a search input); the host adds no text label |
| `feature` | Lazy-load v2: the boolean feature id gating this static item; off → the host doesn't render it; after materialization the client-registered item's own feature takes over |

## 5. Loading and directories

- Entry file names: `index.ts` / `index.mjs` / `index.js` / `index.cjs`; a directory containing a single
  script file also works as a single-file layout.
- Loaded via jiti with TS transpiled (`moduleCache: false`, hot reload works); directories with neither
  package.json nor an entry script are skipped.
- Directory layers and same-name priority (user > extra > dev > bundled) → [deployment](/en/ext-dev/deploy.md).

## 6. TypeScript type augmentation (optional)

Host-side TS files can gain slot-props / i18n-key type checking via module augmentation:

```ts
declare module "dev-repo/ext" {
  interface ExtSlotContractMap {
    chatInputTop: { props: { inputValue: string } };
  }
  interface LocaleNamespaceMap {
    "my-extension": { "inspect.start": string };
  }
}
```

Note: this typing only works when developing **inside the host repo** (dev-exts etc.); external
extension entries are plain objects (loaded directly by jiti, no type-checking pass). Contracts are
"type-level documentation" with no runtime effect.
