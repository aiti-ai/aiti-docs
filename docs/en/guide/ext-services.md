---
title: Extension Services and Cross-Extension Call Conventions
icon: 🔌
description: "The only sanctioned path for pi-web inter-extension communication: the ctx.services locator — how to provide, how to consume, how to degrade; global-variable red lines"
tags: [guide, ext, services, extension, dependency-injection]
---

# Extension Services and Cross-Extension Call Conventions

> ❝ Extensions don't shake hands over global variables — at registration time, core hands you a service locator (`ctx.services`). ❞

In pi-web extension development, there is exactly one sanctioned path for **calling capabilities/data across extensions**: the core-injected `ctx.services` (server side) / the `ctx.registerExtService` family (client side). This guide explains how to provide, how to consume, how to degrade, and which globals are core-reserved slots (creating new ones of the same kind is forbidden).

Design basis and full background: `dev-repo/docs/dev-repo-dependency-injection-plan.md` (signed off at the 2026-09 review).

## 1. Server Side: Providing Capabilities

Register inside `server.startup(ctx)` of your extension's `index.ts`:

```ts
export default {
  id: "aiti-git-trace",
  // ...
  server: {
    startup(ctx) {
      // key must carry the "<extId>.<name>" prefix (validated by core, prevents impersonating other extensions)
      ctx.services.provide("aiti-git-trace.trace", traceService(ctx.configDir));
    },
  },
  // Alternatively, hang it off the extension export (lazy getter, equivalent form):
  // get services() { return { get trace() { return traceService(configDir) } } }
};
```

**Conventions**:

- key = `"<extId>.<name>"`; services provided by core itself use the `core.*` prefix (e.g. `core.sessions`, `core.registry`). For the family-suffix naming conventions, see §7.
- `provide` returns a disposer; on extension shutdown/reload, core unwinds automatically — **it first runs the extension's `server.shutdown` hook, then broadcasts down per key**, so the service object itself is not required to carry its own disposer. The disposer returned by `provide` is for taking the service offline early, and it carries a race guard (a stale disposer will not accidentally remove a later registration).
- `provide` is idempotent: providing the same key again **replaces the impl in place and does not re-emit up**.
- **Use lazy getters for service objects** (fetched on access), so hot reload/reinstall doesn't leave dangling references — the consumer always gets a live instance.
- **Services exposing general-purpose capabilities must declare `provides` alongside** (§6) — the capability index only honors declarations; undeclared services don't enter the extman capability view or dependency resolution.
- Write method semantics into documentation (the provider extension's docs + the consumer's plan document). Red line: **service exports are read-only**; consumers must not read the provider's configDir directly (data layering: config at root / non-regenerable data under state/ / regenerable data under cache/ — see [Extension Data and Storage Conventions](/en/guide/ext-data.md)). Reference: the `services.trace` contract table (`docs/aiti-git-trace-plan.md` §16.3).

## 2. Server Side: Consuming Capabilities

```ts
server: {
  startup(ctx) {
    // Soft dependency: returns undefined when absent, degrade on your own (recommended — an extension can be disabled by the user at any time)
    const trace = ctx.services.get("aiti-git-trace.trace");
    if (!trace) { /* Feature degradation: hide the entry / go dormant; never crash raw */ }

    // Hard wait: use it when startup genuinely needs to wait for a service to be ready (event-driven, not polling)
    const docs = await ctx.services.require("aiti-doc-center.docs", 5000)
      .catch(() => null); // Still degrade on timeout

    // Subscribe to service up/down (notified when the provider reloads / gets disabled, replacing hand-written self-healing re-subscription)
    const off = ctx.services.onChange((key, phase) => {
      if (key === "aiti-git-trace.trace" && phase === "down") resubscribe();
    });
  },
}
```

**Three disciplines**:

1. **Fetch at interaction time**: do not hold the service object long-term as a closure/global from startup — use `ctx.services.get(...)` to fetch it at each use, or subscribe to `onChange` and re-subscribe.
2. **Degrade when absent**: the consumer must define the behavior for "the service isn't there" (feature degradation / hidden entry). Absence is the norm, not an error (users can disable any extension at any time).
3. **Read/write features via `ctx.features`**: `ctx.features.get("aiti-ai-input", "asr.hotwords.count")` — do not reach through the registry and call directly.

**Startup order is nondeterministic (why `require` exists)**: startup runs only in `startupPriority` order; dependencies **do not participate in the ordering** — the consumer's startup may well execute before the provider's, so an absent `get` during startup is the norm, not an incident. If you genuinely need to wait during startup, use `require(key, timeoutMs)` (default 5000ms; event-driven, zero polling; **the waiter is not rejected by down** — a wait inside a reload window won't fail midway; only a timeout rejects).

**onChange semantics**: fires only when a service goes **up/down** (providing a new key = up; deregistration/disabling = down); replacing the impl for the same key does not re-emit up; exceptions thrown by listener callbacks are swallowed and do not affect other listeners.

## 3. Client Side: Cross-Extension UI Calls

The ctx inside the client bundle has a symmetric API (implemented as an in-page Map; **direct in-process calls on the same page, no HTTP involved**):

```js
// Provide (e.g. your extension wants to expose "open the settings panel" to other extensions)
export function register(ctx) {
  const dispose = ctx.registerExtService?.("aiti-model-check.open", () => setOpen(true));
  return dispose; // disposer, unwound on unload — see below; be sure to return it and wire it up
}

// Consume (null-check + degrade, same habit as the old window-global null check)
const open = ctx.getExtService?.("aiti-model-check.open");
if (typeof open === "function") open();
else { /* Provider not loaded / lazy loading not yet materialized: degrade */ }

// Subscribe to client service up/down (receive up when the provider's lazy load finishes materializing)
const off = ctx.onExtServiceChange?.((key, phase) => {
  if (key === "aiti-model-check.open" && phase === "up") rebind();
});
```

**The client trio**: `ctx.registerExtService(key, impl)` (provide) / `ctx.getExtService(key)` (consume, null-check + degrade) / `ctx.onExtServiceChange(cb)` (subscribe to up/down and re-mount).

- Keys follow the same server-side convention `"<extId>.<name>"`; **server and client are two independent registries** (Node-side `ExtServicesRegistry` vs in-page Map) — same-named keys are invisible to each other, with independent semantics.
- **The client registry has no revokeExt equivalent** — unload/HMR unwinding relies solely on the disposer returned at registration, so `register` must return it and wire it up; when a reload re-materializes and re-registers the same key, the impl's race guard covers it, so no false down.
- The provider's client bundle may be lazily loaded (`clientImmediately: false`) — the service is absent until materialization. Usage pattern: null check → `ctx.ensureMaterialized?.("<extId>")` to pull it up → re-fetch → (migration period) fall back to the legacy channel (full pattern in aiti-agent-manager's `openCmdTerminal`).
- Typical migration targets: window globals like `window.__aitiModelCheckOpen` and `window.__aitiHelperInvoke` — the "extension A hangs a function, extension B null-checks and calls it" pattern (~60 legacy dualtrack sites; the migration ledger is in plan doc §5; `aiti-git-review.open` is the only one fully migrated).
- Pure UI topic items (message bubble buttons etc.) keep using `ctx.registerTopicItem(topic, item)`, which is the same-origin predecessor of this mechanism.

## 4. Prohibitions (Red Lines)

| Prohibited | Instead |
|---|---|
| `globalThis.__piWebExt.byId("...").ext.services.*` reaching into other extensions | `ctx.services.get("...")` |
| Adding any `globalThis.__<extId>*` service singleton | `ctx.services.provide(...)` |
| Adding `window.__<extId>*` client globals (cross-extension calls) | `ctx.registerExtService / getExtService` (even intra-extension shortcuts should prefer module-level singletons) |
| Reaching through the registry to call `featureValue` / `setFeatureFlag` directly | `ctx.features.get / on` |
| Crashing raw when a service is absent / assuming it's always there | Null check + explicit degradation path |
| Polling with setInterval waiting for a service to appear | `ctx.services.require(key, timeout)` (event-driven) |

**Core-reserved global slots** (exemption list; extensions must not create new ones of the same kind): `globalThis.__piWebExt` (the registry itself), `__piPageEvents`, `__aitiTraceEmit` (pi extension producer), `__aitiInject` (middleware cross-bundle), `__piSessions` / `__aitiBridges` (core internal singletons), `window.__piWebPendingComposer`. What they have in common: **the producer or the consumer lives outside the extension ctx system** (middleware's independent bundle / the pi extension loader), which ctx.services cannot reach — full exemption rationale in plan doc §6. Naming convergence: core-reserved slots uniformly use the `__piWeb*` prefix (the check script allows by prefix); existing `__aiti*` reserved slots are not forced to rename; on the client side, the authoritative full exemption list is the `check-ext-globals.mjs` gray list (which also includes core-side globals like `__piPageEventsClient`, `__runningEventsBroker`, `__PIBASE`).

**Gray-list enforcement (check-ext-globals)**: red lines are not kept by good intentions — `dev-repo/_shared/check-ext-globals.mjs` statically scans all extension sources across the repo for three classes of violation: byId reach-through, direct feature calls, and unregistered globals; **it is wired into the unified test entry `scripts/test-web-ext.mjs`** (the gate runs first on every test run, hitting a red line fails the entire round; `--list` skips it). The gray list has four categories: `core-保留口` (the exemption list above) / `dualtrack` (legacy channels pending retirement during dual-track migration) / `internal` (intra-extension shortcuts, to be converged into module-level singletons in a separate batch) / `framework` (framework-level aggregated exemptions: the aiti-configs / aiti-ai-schedule / aiti-helper mechanism that reads declarations from all extensions). **A new global not on the list means FAIL** — the proper process when an addition is genuinely needed: first register the rationale in DI plan §6 / this document → update the script's gray list (with a category note) → then merge the code. Running `--strict` manually also counts dualtrack legacy channels as FAIL (for assessing fallback retirement progress; off by default).

## 5. Registered Services Quick Reference (continuously updated)

**Runtime source of truth**: the `services` field of `GET /api/extensions/status` (`ExtServicesRegistry.list()`, key + provider); the extman panel auto-renders the per-extension "service exports" section. The table below is a human-readable semantic quick reference — **shipping a new service = write the method semantics table in the provider extension's docs + add a row here** (zero registration on the extman side; automatically visible).

### Table A · Server side (`ctx.services.provide`)

| key | Provider | Purpose | Consumers |
|---|---|---|---|
| `core.sessions` | core (registry built-in) | Read-only view over session wrappers `{ ids(), has(id), get(id) }` (fetched lazily from the rpc-manager singleton) | None yet (the target slot replacing direct `__piSessions` reads; aiti-cmd etc. still dual-track) |
| `core.registry` | core (registry built-in) | Read-only projection of the registry `{ ids(), get(id) → metadata, ui(id), status() }` (does not send out the ext entry itself) | aiti-extman (slot details) |
| `aiti-git-trace.trace` | aiti-git-trace | Ledger readOps/sessionStores/watchPaths/listMd + onOp events | aiti-plan-first, aiti-doc-center, aiti-msg-smart |
| `session-manager.sessions` | session-manager | `parseSession(compositeId)` history parsing for each agent + `archivedIds()` (read-only) | aiti-doc-center + the agent extensions (codebuddy/claude-code/opencode/qoder/acp… cold-restore cwd) |
| `session-manager.tags` | session-manager | `snapshot()` full TagData (optimistic-lock version) | aiti-doc-center |
| `session-manager.hotwords` | session-manager | ASR hotword extraction `get(params)` | aiti-ai-input |
| `aiti-doc-center.docs` | aiti-doc-center | md retrieval tagsAll/search/query/docsOfSession | aiti-plan-first, aiti-folder, session-manager |
| `aiti-plan-first.plans` | aiti-plan-first | `planDocs()` session→plan-document binding map (read-only) | aiti-doc-center, aiti-git-trace (consumed via REST in reverse) |
| `service-tunnels.api` | service-tunnels | Tunnel admin-plane library singleton (enroll / injection registration) | The injection chain goes through the `__stInjectRegistry` aggregation layer; middleware still uses `__piServiceTunnels` (the provider's own singleton, not a core-reserved slot) |
| `aiti-devtools.bridges` | aiti-devtools | Bridge table `get(key)` (same-origin singleton as `__aitiBridges`) | None yet (aiti-attach-agent migrating; currently dual-track via `__aitiBridges`) |
| `aiti-event-bus.publish` | aiti-event-bus | Page event bus publish `{ publish(type, data) }` (the sole new SSE `/events`) | plan-first / model-check / editor / git-review(gr:task) / ai-schedule(sched:*) / session-manager |
| `aiti-event-bus.publish-local` | aiti-event-bus | Local direct publish (not fed into core forwarding) | Same as the publish family |
| `aiti-cmd.runner` | aiti-cmd | Unified export for cross-extension backend session creation | session-manager, aiti-ai-input, aiti-codebuddy-agent |
| `aiti-git-ops.api` | aiti-git-ops | Git operations API (same surface as REST) | Consumers currently use the `_shared/git-ops-client` REST; the ctx export is reserved |
| `aiti-git-review.aiReview` | aiti-git-review | AI group review (driven by onAgentSettled + 180s deadline) | aiti-folder (git-plan refinement) |
| `aiti-model-wizard.saveBatch` | aiti-model-wizard | Batch-save models | aiti-models-import |
| `<extId>.launch` ×9 | claude-code / codex / zcode / cursor / qoder / acp / codebuddy / pi + omp (the 9th, not in the managed driver table) | Agent launch delegation (P2 protocol drivers) | aiti-custom-agent (8 protocol drivers; omp has no consumer yet) |
| `<extId>.agent` ×7 | codebuddy / claude-code / opencode / qoder / cursor / codex / zcode | Agent descriptor self-identification | aiti-agent-manager (agents-registry) |

### Table B · Client side (provided by extensions, `ctx.registerExtService`)

| key | Provider | Purpose | Consumers |
|---|---|---|---|
| `aiti-float.dockstack` | aiti-float | Unified left-sidebar block stack (DockStack render/collapse/reorder) | session-manager (SidebarContentDock) |
| `aiti-float.dock-header` | aiti-float | Block header row | None yet (reserved) |
| `aiti-model-recent.recentOptions` | aiti-model-recent | Recently-used models data fetch (synchronous) | None yet (the host ModelSelector still reads localStorage directly — migration seam) |
| `aiti-event-bus.subscribe` | aiti-event-bus | Client frame subscription `subscribePageFrames(handler)` (falls back to `window.__piPageEventsClient` when the bus is absent) | Every client needing realtime push |
| `aiti-event-bus.subscribe-topics` | aiti-event-bus | Topic subscription (topic whitelist/wildcards; the single SSE convergence point, self-built channels forbidden) | git-review / model-wizard / editor / ai-schedule / plan-first / folder / model-check / helper / session-manager / aiti-cmd and 10+ more |
| `aiti-git-review.open` / `.work` | aiti-git-review | Open the review workspace / work with changes | aiti-git-trace (panels), aiti-folder (folder-browser) |
| `aiti-model-wizard.open` / `.openTab` / `.viewParams` / `.cleanupEdit` | aiti-model-wizard | Open the wizard / open a new tab / view with params / clean up edit state | aiti-model-check |
| `aiti-model-check.open` / `.app` | aiti-model-check | Open the availability panel / get the app instance | aiti-model-wizard |
| `aiti-ai-schedule.open` | aiti-ai-schedule | Open the scheduling panel | aiti-prompts |
| `aiti-helper.invoke` / `.suggestFallback` | aiti-helper | AI help-point entry / suggestion fallback | aiti-model-wizard, aiti-ai-input, aiti-extman, _shared/soffice-panel |
| `aiti-cmd.open-session` / `.open-shell` | aiti-cmd | Open a session / terminal across extensions | aiti-agent-manager (open-session; open-shell has no consumer yet) |
| `session-manager.mention` | session-manager | Session mention | _shared/new-session-cwd |

### Table C · Client side (provided by the host, `registerExtClientService("pi-web", …)`)

| key | Provider | Purpose | Consumers |
|---|---|---|---|
| `pi-web.session` | AppShell | Current session handle / switching | aiti-editor, aiti-plan-first, aiti-git-trace, aiti-ai-speek (the `onExtServiceChange` re-mount pattern) |
| `pi-web.home` | AppShell | Back to home / navigation | session-manager (store, sidebar-content) |
| `pi-web.toast` | AppShell | Global toast | session-manager (toast.tsx) |
| `pi-web.overlayBack` | AppShell | Overlay back registration | 14+ sites (`_shared/overlay-back-client` unified wrapper + aiti-float / aiti-editor / service-tunnels / aiti-folder / session-manager) |
| `pi-web.ui` | **Host AppShell** (client) | Host navigation/mention callbacks and component factories fetched by name: `get(name)`/`names()` — same set as the sidebarContent extra + `onLineMention` (see 5.1 below) | aiti-folder (resolveHostFace pattern), aiti-editor, aiti-cmd |
| `pi-web.composer` | **Host ChatInput** (client) | Composer callbacks/refs fetched by name: `setInputValue`/`focusComposer`/`textareaRef`/`openSessionInfo`/`queueActions` (see 5.1 below) | aiti-ctx-meter, aiti-ai-input, aiti-queue-keeper |

**Status note**: the Table A/B services have been rolling out to dev since 2026-09-07; the production pi-web core is synced (2026-09-08). The first four items of Table C predate this guide; `pi-web.ui`/`pi-web.composer` were added on 2026-09-16 (production sync status in §5.1).

**Dual-track note**: the legacy window-global fallbacks are still in place (~60 client-side dualtrack sites + server-side byId fallback comment lines); retirement condition = full sync of production extensions; the progress ledger is in plan doc §5.

### 5.1 Host capability services (slot extra callback decoupling, 2026-09-16)

**Background**: the host used to hand-assemble extra callbacks at each slot render point; a missed assembly at a new render point/new field = the feature silently disappearing (postmortem of the broken @ link in the right-sidebar folder panel). The decision: **host slot extras feed data only; callbacks/refs/factories are all registered as client services**, with extensions carrying their own fallback. Design origin: `dev-repo/docs/pi-web-slot-extra-callback-decoupling-plan.md` (implemented; the host changes belong to pi-web core, **production sync pending approval**).

| Service | Provider | Field contract |
|---|---|---|
| `pi-web.ui` | AppShell (`hostUiRef` delegates to the latest render closure) | Same set as the sidebarContent extra (callbacks + factories) + `onLineMention` + `closeTopPanels` (collapse all top-bar dropdown panels; call before an extension item inside a top-bar panel opens another full-screen surface; added 2026-09-19); host source `lib/ext/host-ui-contract.ts` |
| `pi-web.composer` | ChatInput (`composerUiRef`) | `setInputValue` / `focusComposer` / `textareaRef` / `openSessionInfo` (first collapses the mobile InfoSheet) / `queueActions` (same set as the queuePanel extra.actions) |

**Red line**: services hold only **reference-stable** members (useCallback callbacks / refs / component factories). Data that changes with rendering (sessionId/cwd/isStreaming/inputValue/context…) must go through slot extra props — a service `get` is an imperative snapshot; routing data through a service "freezes the value".

**Consumer pattern** (rp first → service fallback; see aiti-folder's `resolveHostFace`):

```js
const svc = ctx.getExtService?.("pi-web.composer");
const openSessionInfo = rp.openSessionInfo ?? svc?.get?.("openSessionInfo");
```

New host slot render points **only need to feed data**; when callbacks are absent, extensions degrade by "not rendering the button", consistent with the old host behavior when rp is missing (no regression).

## 6. Declarative Dependencies and the Capability Model (dependsOn / optionalDependsOn / provides / takeover)

`ctx.services` is the **runtime** soft dependency (null-check + degrade); extension registration also supports a **declarative** layer of dependency and capability language, resolved by the platform and surfaced/adjudicated by extman. The two complement each other: declarations govern the static facts of "who depends on what / who provides what" and UI hints, while services govern actual runtime fetching. Authoritative design + implementation record: `dev-repo/docs/aiti-ext-deps-capabilities-plan.md` (**P0/P1/P2 implemented and live, reviewed 2026-09-08, including production core sync; P3 not implemented, to be reviewed separately** — hard-dependency prefetch linkage, folding in ui.provides, dev-priority toggle initial values).

Four optional fields at the entry top level (same level as `conflicts`/`features`); existing extensions need zero changes:

| Field | Strength | Semantics |
|---|---|---|
| `dependsOn: string[]` | Hard | Feature-level dependency; elements are extension ids or capability names. **Pure declaration, does not block loading** — extman shows a warning when the depended-on extension is disabled/uninstalled; resolution failure marks it missing |
| `optionalDependsOn: string[]` | Soft | Optional dependency (npm `optionalDependencies` semantics): present → the consumer can enable extra features; absent → no effect at all. **Pure declaration, triggers no warning** |
| `provides: string[]` | Multi-impl | Declares provided capabilities; the same capability can be provided by multiple extensions at once |
| `takeover: string[]` | Exclusive | Declares exclusively taken-over features; multiple declarants of the same feature resolve to a single effective one via adjudication |

```ts
export default {
  id: "aiti-msg-smart",
  optionalDependsOn: ["aiti-git-trace"],  // with it, show change tracking; without it, no impact
  // dependsOn: ["cap.git-trace"],        // capability names conventionally carry the cap. prefix (id matches win at resolution)
  // provides: ["cap.msg-intelligence"],
  // takeover: [],
} as PiWebExtension;
```

**Capability resolution**: a dependency element first matches exactly by extension id; otherwise the provider set is consulted (`provides ∪ takeover`) — empty set = missing (hard dependencies turn red, optional ones stay silent); with multiple providers, the effective provider is chosen by **user pin > takeover declarant > newest semver > id lexicographic order**. Same-id multi-source (user/dev/bundled multi-root) adjudication follows the same order; the dev-debug-priority toggle can switch it.

**Pin operation**: pin the provider via its dropdown in the extman "Capabilities" view detail (persisted to `<dataRoot>/ext-pins.json` with the dual keys `source:<id>` / `capability:<cap>`); when a pin goes stale (disabled/uninstalled), soft validation falls back to automatic adjudication; a reload is required for changes to take effect.

**The conflicts field**: declares mutual exclusion (exact match by npm source package name or path-scoped package name); matches are removed entirely from the session-creation path — note this is heavier than a dependency warning: it takes the other side offline outright.

**Runtime probing**: the manifest passes through the four declaration fields, so extensions can query at runtime "who provides capability X" (the runtime fulfillment path for optional dependencies). ⚠ `ui.provides` (the EXT_PROVIDES built-in takeover) is a legacy mechanism — it is not the same thing as the caps `provides` in this section; do not mix them up.

**Declaration gap note**: the capability index only honors `provides/takeover` declarations — currently most services (the runner/api/launch/agent families etc.) are undeclared and don't enter the extman capability view or dependency resolution. **Extensions providing general-purpose services should declare `provides` alongside** (backfilling declarations for existing services is a follow-up item).

**extman presentation**: the detail "Dependencies" section renders by edge type (hard / optional `·optional` / capability edges with resolution chains); the "Capabilities" and "Conflicts" views group by capability name to inspect providers/consumers/pins. Warnings only consume hard edges — operations on optional dependencies don't pop dialogs. See [aiti-extman](/en/extensions/aiti-extman.html).

## 7. Service Naming Conventions (codified 2026-09-18)

Keys must carry the `<extId>.` prefix (core uses the literal `core.*`, the host client uses `pi-web.*`). Family suffixes are already the de facto convention; name new services accordingly to avoid divergence:

| Suffix | Semantics | Examples |
|---|---|---|
| `.api` | Server-side admin-plane export (same surface as REST) | `service-tunnels.api`, `aiti-git-ops.api` |
| `.open` | Client-side open panel / entry | `aiti-model-check.open`, `aiti-ai-schedule.open` |
| `.launch` | Agent launch delegation (P2 protocol drivers) | `aiti-zcode-agent.launch` |
| `.agent` | Agent descriptor self-identification | `aiti-qoder-agent.agent` |
| `publish` / `publish-local` / `subscribe` / `subscribe-topics` | The four event-bus exports | `aiti-event-bus.*` |

The `cap.` prefix on capability names is convention only, not enforced (extension id matches win at resolution, see §6).

## 8. Testing and Gates

- **Host unit-test exemplar**: pi-web `lib/ext/services.test.mjs` — covers up/down, same-key re-provide not re-emitting up, reload coming back online after down, the require startup wait, and the disposer race guard. Copy it when adding assertions for service behavior changes.
- **Global-variable gate**: `scripts/test-web-ext.mjs` runs `check-ext-globals.mjs` first before every test run (also runs with `--only` filtering; skipped by `--list`), hitting a red line fails the entire round — see the gray-list section in §4.
- **Retirement assessment**: manually run `node dev-repo/_shared/check-ext-globals.mjs --strict` to also count dualtrack legacy channels as FAIL; counting how many remain is the fallback-retirement progress.
