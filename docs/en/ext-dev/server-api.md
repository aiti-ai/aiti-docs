---
title: Server ctx API
icon: 🖥️
description: Complete ExtServerContext reference received by startup/shutdown/api hooks — three-tier dirs, core contract, services, features, session backends, invokeAI
tags: [ext-dev, server, api, reference]
---

# Server ctx API

The context received by `server.startup(ctx)` / `shutdown(ctx)` / `api(req, ctx)` /
`rescanBackends(ctx)`. Source of truth: `lib/ext/types.ts`
(`ExtServerContext` / `ExtApiContext` / `ExtCoreApi`).

## 1. ExtServerContext overview

```ts
interface ExtServerContext {
  id: string;                 // extension id (= directory name)
  dir: string;                // extension code directory (read-only, for static assets)
  configDir: string;          // config area dataRoot/<id>/config/ (recoverable: reconfigure)
  stateDir: string;           // persistent area dataRoot/<id>/state/ (non-regenerable: gone is gone)
  cacheDir: string;           // cache area dataRoot/<id>/cache/ (deletable wholesale; extension must rebuild)
  core: ExtCoreApi;           // core data contract
  services: ExtServicesSlot;  // cross-extension service locator
  features: ExtFeaturesSlot;  // feature state read/write
  sessionProviders: ExtSessionProviderSlot;      // session backend registration
  sessionAnnotations: ExtSessionAnnotatorSlot;   // session-list annotations
  invokeAI?(params): Promise<{ text, provider, model, usage? }>; // generic AI invocation
}
```

The `api` hook receives `ExtApiContext` (extends the above) with `method` / `path` (path segments
after the extension id) / `searchParams` (URLSearchParams).

⚠️ **`ctx.dataDir` has been removed and throws on access** — split into three tiers since
2026-09; the decision tree and behavior contract see
[extension data & storage](/en/guide/ext-data.md).

## 2. `core` (ExtCoreApi)

The core data contract — extensions must **not implement themselves** session reading / running
state / file access:

| Member | Semantics |
|---|---|
| `listSessions(options?)` | Session list (incremental cache); `{ refresh: true }` bypasses the 5s scan cache (session just written, right after archiving — anywhere the effect must be immediate) |
| `getRunningSessionIds()` | RPC running set |
| `getAliveSessionIds()` | Alive (incl. idle) rpc session ids — **disk-write guards must include these** |
| `stopAliveSession?(id)` | Actively release an alive idle session (call before disk operations on archive/delete); running sessions return `"running"`, externally held ones (e.g. a TUI bridge) return `"missing"`. **May be absent on older hosts — check first** |
| `getHomeDir()` | User home directory |
| `readSession(id)` | Full session context (messages + entry ids); null when missing |
| `readModelsConfig()` | Read the current models.json (`{providers:{...}}`); **never hand-edit the file** — always via this API (cache invalidation included) |
| `writeModelsConfig(data)` | Write models.json (normalized + cache invalidated, effective immediately) |
| `rebindSessionBackend?(oldId, newId)` | Rebind a backend session id (backends whose process generates the id attach the real id as an alias once read back; the old key is kept so draft rows / existing references keep working). Returns false when newId is taken or oldId is unusable (idempotent-safe). May be absent |
| `fileAccess.allowRoot(root)` / `isAllowed(p)` | File access bound to pi-web's allowed-roots security (session cwds etc. pre-authorized) |

## 3. `services` (ExtServicesSlot)

The cross-extension service locator — **the only sanctioned path** (no global-variable escapes).
Keys are forced to carry the `"<extId>.<name>"` prefix (core-provided services use `core.*`):

| Member | Semantics |
|---|---|
| `provide(key, impl)` | Provide a service; returns a disposer (the core unwinds automatically on shutdown/reload). Idempotent: re-providing the same key replaces in place without re-emitting up |
| `get(key)` | Soft dependency: `undefined` when absent — consumers degrade themselves (recommended default) |
| `require(key, timeoutMs?)` | Hard dependency: event-driven wait for provide (no polling), rejects on timeout |
| `onChange(cb)` | Subscribe to service up/down (replaces hand-written self-healing resubscribes); returns an unsubscribe function |

Full spec (client services, naming conventions, dependency-capability model, test gates) →
[extension services guide](/en/guide/ext-services.md).

## 4. `features` (ExtFeaturesSlot)

| Member | Semantics |
|---|---|
| `get(extIdOrFeatureId?, featureId?)` | Read the effective value: `get(fid)` reads this extension; `get(extId, fid)` reads a given one. boolean returns on/off, string returns the value; unset features follow the declared default |
| `on(cb)` | Subscribe to feature changes (any extension; fired after extman edits); returns an unsubscribe function invalidated with ctx on shutdown |

Declaration side (`features: ExtFeature[]`) and client consumption (`getFeatures` /
`onFeatureChange`) → [feature guide](/en/ext-dev/features.md).

## 5. `sessionProviders` (session backend registration)

Plug custom agent backends into the host's multi-agent frontend. Keys are automatically prefixed
(`"<extId>/<type>"`) so they can never shadow built-ins or other extensions; entries are
unregistered automatically on shutdown/reload.

```ts
ctx.sessionProviders.register({
  type: "my-backend",              // short name (no "/")
  label: "My Backend",             // display name in the new-session backend picker
  maxCapabilities: { ... },        // capability ceiling (fail-loud; declare false for unsupported, throw UnsupportedCapabilityError in the method)
  listModels?,                     // static model catalog (fetchable without a session; feeds the picker) — optional
  refreshModels?,                  // manual model catalog refresh (shows the "refresh models" button when present) — optional
  async createSession(options) {   // create a session → SessionHandle (lib/session/types.ts)
    // options: { sessionFile?, cwd?, socketPath?, env?, ...free-form pass-through keys }
    // Free-form keys: the extension may add its own fields; the host does not interpret them.
    // Without sessionFile the backend creates one itself.
    return { /* ... */ };
  },
  async shutdown() {},             // optional
}); // → returns the full registry key "<extId>/<type>"
```

Companion members: `remove(type)` hot removal, `canOpen(agentKey)` whether a backend can drive an
external history session, `open(compositeId, options?)` attach-from-history (returns
`{ ok: true, sessionId }` or `{ ok: false, reason: "no_provider" | "open_failed", error? }`).
Real examples: aiti-echo-agent (a zero-LLM fake backend), aiti-attach-agent.

## 6. `sessionAnnotations` (session-list annotations)

Attach extension-owned fields to session list rows (e.g. an occupancy marker). Data ownership
stays with the extension; the core knows nothing about formats:

```ts
ctx.sessionAnnotations.register({
  async annotate(rows) {           // rows = lightweight projection { id, path?, cwd? }
    return { [rowKey]: { busy: true } };  // key matches the row's id or path; the core merges it into the response
  },
});
```

## 7. `invokeAI` (generic AI invocation)

The core's lowest-level model capability: any system+messages → `{ text, usage }`. **Zero business
logic, zero accounting in the core** — prompt assembly / context / project state / token billing
are entirely the calling extension's responsibility:

```ts
const { text, usage } = await ctx.invokeAI({
  provider?, modelId?,  // default = the cheapest non-reasoning model globally (⚠️ not the session's current model)
  system?,
  messages: [{ role: "user", content: "..." }],
  maxTokens?, temperature?, reasoning?,   // reasoning e.g. "off", only effective when the provider supports it
  caller: "myext-input/complete",         // billing dimension (defaults to ext.id; break down per scenario)
});
```

More AI surfaces (per-session tool injection, lifecycle callbacks, ai-helper skills) →
[AI integration](/en/ext-dev/ai.md).
