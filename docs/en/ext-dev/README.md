---
title: Extension Development Manual
icon: 🔧
description: Complete manual for developing pi-web (aiti-agent) extensions — from writing your first extension to shipping it
keywords: extension development, pi-web extensions, aiti extensions, ExtSlot, ctx API, feature management
---

# Extension Development Manual

> All business features of aiti-agent (pi-web) are implemented as **extensions**; the core keeps only
> mount points and contracts. This manual is the complete developer reference for extension authors:
> writing your first extension → debugging → publishing → registering it in the catalog.

> ℹ️ Some linked pages (the [extension catalog](/extensions/)) are Chinese-only for now; the guides
> under [Guide](/en/guide/) have English versions.

## Learning path

| Stage | Read | Goal |
|---|---|---|
| ① Framework overview | [aiti-agent extension points](/en/devtools/extension-points.md) | Understand the model in 15 minutes: directory conventions, load chain, extension object shape |
| ② Hands-on | [Quick start: your first extension](/en/ext-dev/quick-start.md) | Follow the tutorial to build a working extension (server API + toolbar button) |
| ③ Contract reference | [Extension object contract](/en/ext-dev/contract.md) · [Slot tables](/en/ext-dev/slots.md) | Look things up while coding: every entry field, 40+ slots and props contracts |
| ④ API reference | [Server ctx API](/en/ext-dev/server-api.md) · [Client ctx API](/en/ext-dev/client-api.md) | Complete member lists of `startup(ctx)` / `register(ctx)` |
| ⑤ Topics | "Topic guides" below | Cross-extension calls, data storage, features, AI integration |
| ⑥ Ship | [Deployment & hot reload](/en/ext-dev/deploy.md) · [ext metadata spec](/extensions/spec.md) | Install on an instance, version it, register it in the docs catalog |

## Manual chapters

| Chapter | Content | Status |
|---|---|---|
| [Quick start](/en/ext-dev/quick-start.md) | From zero: directory → index.ts → hot reload → client bundle → publish | ✅ |
| [Extension object contract](/en/ext-dev/contract.md) | Full `PiWebExtension` field reference (features/dependsOn/provides/publicApi included) | ✅ |
| [Slot tables](/en/ext-dev/slots.md) | 40+ slots grouped for lookup + type contracts (ExtSlotContractMap) + declarative items | ✅ |
| [Server ctx API](/en/ext-dev/server-api.md) | `ExtServerContext` / `ExtCoreApi` / services / features / sessionProviders / invokeAI / agent hooks | ✅ |
| [Client ctx API](/en/ext-dev/client-api.md) | Full `ExtClientContext` (React toolkit / i18n / slots / behavior hooks / host capabilities) | ✅ |
| [Feature declaration & consumption](/en/ext-dev/features.md) | ExtFeature types, `tool.*` convention, `ctx.features` / `getFeatures` consumption chain | ✅ |
| [AI integration](/en/ext-dev/ai.md) | `invokeAI` generic calls / `server.agent` per-session extension point / ai-helper skills | ✅ |
| [Deployment & hot reload](/en/ext-dev/deploy.md) | Directory layers, dev/prod isolation, reload API, extman install, versioning | ✅ |
| [i18n & security](/en/ext-dev/i18n-security.md) | `ui.i18n` table + type contract; fail-closed gate / fileAccess / publicApi whitelist | ✅ |

## Topic guides (existing docs, referenced directly)

| Doc | Content |
|---|---|
| [Extension services & cross-extension calls](/en/guide/ext-services.md) | 🔌 The `ctx.services` locator: provide/consume/degrade; dependency & capability model; global-variable red lines (**must-read**) |
| [Extension data & storage](/en/guide/ext-data.md) | 💾 Three-tier data model config/state/cache: decision tree, behavior contract, migration rules (**must-read**) |
| [Lazy-loading contract](/en/guide/ext-lazy-loading.md) | Two-phase: thin entry resident + heavy UI materialized on demand (`clientImmediately: false`) |
| [Reference implementation: demo](/extensions/demo.md) | The all-slots demo extension — "framework first has examples, people have patterns" |
| [Build template: ext-jsx-client](/extensions/ext-jsx-client.md) | Shared template for JSX + TypeScript + npm deps in client bundles (vite lib mode + host-shim) |

## Source of truth

The host source code is the single source of truth for all contracts (docs may lag behind):

| Contract | Source file |
|---|---|
| Extension object / slot names / features / dependency-capability model | `lib/ext/types.ts` (`PiWebExtension` / `ExtSlotName` / `ExtFeature`) |
| Full client ctx members | `components/ExtSlots.tsx` (`ExtClientContext`) |
| Directory & data tiering | `lib/ext/data-dir.ts` |
| Loader / entry file names | `lib/ext/loader.ts` |

If docs disagree with the code, the code wins — PRs fixing the docs are welcome.

## Red lines (distilled from real accidents; details in each chapter)

1. **Cross-extension calls only via `ctx.services` / `registerExtService`** — never add `window.__<extId>*`
   global escapes ([services guide](/en/guide/ext-services.md)).
2. **Write data only into the three-tier directories** (configDir/stateDir/cacheDir) — **`ctx.dataDir` has
   been removed and throws on access** ([data guide](/en/guide/ext-data.md)).
3. **Slot extras carry data only; callbacks always go through services** — render-varying values stay in
   props; writes go through `pi-web.*` client services.
4. **`onAgentSession` must be idempotent** — idle GC and hot reload re-fire it ([AI integration](/en/ext-dev/ai.md)).
5. **Client never imports react** — `h` and hooks come from the host; Rules of Hooks: call hooks before any
   conditional return.
6. **Never hand-write `version`** — the source of truth is `package.json`; the entry value is a legacy
   fallback only.
7. **Lazy extensions** without ui[slot] static items but service-triggered mark `clientLazyVia: "service"`
   to be exempt from the static diagnostic ([lazy loading](/en/guide/ext-lazy-loading.md)).
