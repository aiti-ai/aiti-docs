---
title: Client ctx API
icon: 🎛️
description: Complete register(ctx) reference for client bundles — React toolkit, i18n, slots, behavior-level extension points, host capabilities, features and lazy loading
tags: [ext-dev, client, api, reference]
---

# Client ctx API

The context received by the client bundle's `default export function register(ctx)`.
Source of truth: `components/ExtSlots.tsx` (`ExtClientContext`).

## 0. Ground rules

- **No react imports**: `h` and all hooks come from the host (single React instance, host-shim
  delegation).
- Component = `(props) => ReactNode`; props include `currentSession`
  (`{ id, cwd, name?, firstMessage? } | null`) and slot extras.
- **Rules of Hooks**: hooks must run before any conditional return (this applies to
  host-injected hooks too).
- Members marked `?` may be **absent on older hosts** — check before consuming.

## 1. React toolkit

| Member | Notes |
|---|---|
| `h` | createElement |
| hooks | `useState` / `useEffect` / `useLayoutEffect` / `useRef` / `useCallback` / `useMemo` (always present); `useContext` / `useReducer` / `useSyncExternalStore` / `useImperativeHandle` / `useId` (?may be absent on older hosts) |
| `createContext`? / `forwardRef`? / `memo`? | Component primitives (?may be absent on older hosts) |
| `createPortal(children, container)` | Portal into any DOM node (fixed-position elements inside transformed ancestors need this to escape) |
| `renderSlot(name, props?)`? | Embed a host slot inside the extension's own tree (returns the host ExtSlot element; props support `only: "extId:itemId"` single-item rendering — DockStack cells use it) |
| `useSlotItems(slot)`? | Reactive read of slot items (a hook — call it inside a component render body; includes the lazy-load boot side effect and store/locale subscriptions; returns composite ids `"extId:itemId"`) |

## 2. i18n / network

| Member | Notes |
|---|---|
| `t(key, params?)` | Translate via the extension's own `ui.i18n` table; declaring `LocaleNamespaceMap` gives keys compile-time checking |
| `apiUrl(path)` | Build extension/host API paths |
| `getLocale()`? | Current UI locale (for Intl formatting; follows the host language setting) |

## 3. Slots

| Member | Notes |
|---|---|
| `registerItems(slot, items)` | Register items: `{ id, render?, meta?, feature? }` |
| `disposeItems(slot, ids)` | Precise removal (DSH effect semantics; used for HMR invalidation) |
| `getExtProvides()`? | Read all extensions' `ui.provides` declarations (static manifest, not a hook) |
| `ensureSlotMaterialized(slot)`? | Ensure all lazy extensions declaring this slot are materialized (springboard/interactive-time slots) |

Full slot tables → [slot reference](/en/ext-dev/slots.md).

## 4. Behavior-level extension points

| Member | Notes |
|---|---|
| `registerChatHook({ preSend? })` | Chat send hook: `preSend(text) => { text?, elements? } | null` — rewrite text before sending / collect candidate elements (devtools' `[element N]` replacement) |
| `sendChatMessage(text, mode, images?)` | Programmatic send (same path as user input: preSend hooks apply; idle sends directly, streaming steers/queues by mode); does not clear the input box |
| `queueFollowUp(text, images?)` | Enqueue only, never triggers (queues even when idle — the "re-queue" semantics) |
| `registerParagraphClick(handler)` | Message-paragraph click takeover: the host broadcasts paragraph plain text + context + anchor rect; the handler may carry `hint` (hover tooltip) and `tags` (clickable tags, default p/li/tr, extensible to h1-h6); info provides `setInline(node)` / `close()` |
| `registerSessionForkGate(gate)` | Pre-fork / edit-and-resend gate: awaited in registration order; false/throw cancels (returns a disposer for precise HMR removal) |
| `registerComposerEnhancement(enh)` | Composer enhancement chain: value observation / session-key switching / pre-send hooks |
| `registerRecoveryItemsProvider(provider)`? | Recovery dialog items provider (leftover input merges into the recovery dialog) |
| `registerDraftApi(api)`? | Register the draft storage API (all draft functionality belongs to the implementor — the draft-keeper contract) |
| `registerQueuePanelController(ctrl)`? / `getQueuePanelController()?` | Queue panel controller (ext → core reverse channel; without takeover the core falls back to a banner and expand is a no-op) |

## 5. Cross-extension (client services & topics)

| Member | Notes |
|---|---|
| `registerExtService(key, impl)`? | Register a client service (key forced to the `"<extId>."` prefix; in-process direct calls within the page, no HTTP); returns a disposer |
| `getExtService(key)`? | Synchronously read a service (undefined when absent — consumers must degrade while the provider's lazy load is not ready) |
| `onExtServiceChange(cb)`? | Subscribe to service up/down (provider materialize/unload) |
| `registerTopicItem(topic, item)` | Publish a topic item (indirect coupling between extensions; topic id and payload are defined by the consumer — the core does not interpret content); returns a disposer |
| `getTopicItems(topic)` | Synchronously read all items of a topic (consumers call at interaction time) |

The services spec and host capability services (`pi-web.ui` / `pi-web.composer` /
`pi-web.newSession`…) → [extension services guide](/en/guide/ext-services.md).

## 6. Host capabilities (files / tabs / composer)

| Member | Notes |
|---|---|
| `openFile(path, fileName?, options?)`? | Open a file tab (fileName defaults to the path tail; OpenFileOptions pass through to the host) |
| `openFolder(path, folderName?, options?)`? | Open a folder tab (right-panel FolderViewer; display-only, does not change cwd) |
| `revealDir(absPath)`? | Reveal a directory in the sidebar file tree |
| `getFileTabs()`? | Read open tabs (array order = open order; `{ id, filePath, kind?: file|folder|dock|agent, pinned? }`) — the primitive for bulk close / capacity control |
| `closeFileTabs(ids)`? | Close given tabs (state removal + active-tab reindex only; dirty confirmation / pinned protection are the extension's responsibility) |
| `appendText(text)`? | Append text to the composer without sending (quote-reply prefill) |
| `writeComposerValue(text)`? | Programmatic write (the controlled path: state → DOM-sync effect; false when the composer is not mounted) |
| `restoreComposerDraft(draft)`? | Fully restore a draft (text + images; raw, no hooks; false when not mounted — the caller must not consume the draft) |
| `getComposerTrashWriter()`? | Read the clear-to-trash executor (for implementors of the clear enhancer's onClearToTrash) |

## 7. Features / lifecycle / lazy loading

| Member | Notes |
|---|---|
| `getFeatures()`? | Synchronously read all effective feature values of this extension (`Record<string, boolean | string>`; the host fetches them in one go — zero extra requests) |
| `onFeatureChange(cb)`? | Subscribe to this extension's feature changes (fired after extman edits); returns an unsubscribe function |
| `reloadExtensions(opts?)`? | Trigger a host-side extension reload (fresh manifest + graph reconciliation + invalidating materialization); `opts.resyncOnly` skips the POST /reload full reload (the caller already reloaded server-side) and only refetches the manifest; older hosts ignore the flag and degrade to a full reload |
| `extLoaderState()`? | Current loader state (`{ materialized, prefetched }`) — for extension-management UIs |
| `ensureMaterialized(id)`? | Ensure an extension's client is materialized (idempotent; used by static-entry click forwarding / extman void opens / cross-extension interaction-time bootstrapping); returns whether this call completed the registration |

Feature declaration side → [feature guide](/en/ext-dev/features.md); lazy-loading mechanics →
[lazy-loading contract](/en/guide/ext-lazy-loading.md).
