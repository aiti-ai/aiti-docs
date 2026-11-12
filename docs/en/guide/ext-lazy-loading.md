---
title: Extension Client Lazy-Loading Contract (v2 Two-Phase)
icon: ⚡
description: clientImmediately:false two-phase items + narrowed materialization rules — when you can mark lazy, how to change it, known pitfalls
tags: [guide, ext, lazy-loading, extension, performance]
---

# Extension Client Lazy-Loading Contract (v2 Two-Phase)

Marking an extension's client as `ui.clientImmediately: false` makes it a lazy extension: **your client bundle is not loaded on cold start** until some explicit channel pulls it up. 15+ extensions across the repo are already lazy (cold-start requests 42→28); M1-M3/D1/D3 implemented.

## 1. Materialization Rules (Host Mechanism)

Lazy extensions are no longer triggered by "first render of a persistent slot" — the **automatic channel of persistent slots (toolbar/sidebar/chatInputTop and 20+ others) is closed entirely for lazy extensions**. Only three explicit channels pull them up:

1. **Static item click** (two-phase, see §2) — manifest `ui[slot][]` declarations are rendered by the host as standard buttons before materialization; click → host `ensureMaterialized` pulls it up → forwards to the registered item's `meta.onClick`/`meta.open`;
2. **Interaction-time mounted slots** (`INTERACTIVE_SLOTS`: sessionStats/fileViewer/pathPicker/terminalDock/settingsModels/settingsAgents/settingsAgentsFeature/rightFileDock) — the slot's first render pulls up all declaring extensions;
3. **Explicit API**: `ctx.ensureMaterialized(id)` / `ctx.ensureSlotMaterialized(slot)` (cross-extension pull-up, takeover springboards, and the extman "Open" button are all built in).

## 2. Two-Phase Item SOP (toolbar-button-style lazy marking, ~15 lines)

- **Manifest side** `ui.toolbar[]`: `{ id, label, title, icon, feature? }`
  - **The id must match the raw id in the client's `registerItems("toolbar",[...])`** — the host renders the static composite id `extId:rawId`, and registered items override by the same key; a mismatch = double button (host dev warning).
  - **icon must be provided** (otherwise the first character of the label renders as a placeholder); feature gating goes in the `feature` field (off → host doesn't render the static button).
- **Client side** entry: for toolbar items, **remove `render`** and switch to `meta: { label, title, icon, onClick }` (keep `meta.open` for extman) — declarative items are rendered by the host as a standard 36×36 button.
- **Smoke test**: cold start with F12 shows no client request for this extension → the static button is visible → clicking loads and opens → zero flicker on the button → the ⋯ menu row works the same.

Runnable exemplar: [demo-lazy](/en/extensions/demo-lazy.html) (minimal two-phase implementation).

## 3. Known Pitfalls (hit in practice)

| Pitfall | Notes |
|---|---|
| Historical id mismatch between ui declaration and client registration | Double button; the three sites aiti-channels/ui-env/aiti-helper were fixed during batch conversion |
| `clientImmediately` written in the wrong place | Must live under `ui.*` — writing it at the extension top level is dead config that never took effect (aiti-editor was once bitten) |
| Wrong slot placement | Declaring pages/dialogs items under toolbar produces phantom static buttons (helper was once bitten) |
| deploy manifest missing files | The extension deploy script copies files per the manifest — newly added shared modules (e.g. backend-queue.ts) must be added to the manifest in sync |
| Bundle code splitting | When dynamic import/React.lazy produces chunks, deploy must switch to `copyClientBuild(root, extDir, "main-bundle.mjs")` from `_shared/copy-client-bundle.mjs`, or the chunks 404. All 33 existing deploys are single-file copies — **must change before adding dynamic import** |
| Sole entry points must not be marked lazy | Persistent takeover / dynamic-state entries, the new-session page and other "sole entry points" stay immediate or go through bundle splitting — after lazy-marking, the entry disappears (aiti-acp-agent was once rolled back) |

## 4. Bundle Splitting (Route B)

Don't want to be lazy as a whole, but the bundle is too heavy: a thin-shell entry stays immediate + heavy UI is `import()`-chunked on demand. Exemplars: aiti-folder (the folder-actions open point extracted into a thin module + the FolderBrowserLazy wrapper), D1 model-wizard (thin-shell entry 11.5K + heavy chunk 524K on demand). The deploy script must copy all hash chunks (`copyClientBuild`).

## 5. Decision Tree (run through before marking lazy)

- Has persistent toolbar/sidebar buttons → two-phase (§2), can be marked lazy
- Only appears in interaction-time mounted slots → naturally lazy (no changes needed)
- Pulled up by other extensions / takes over others → the other side pulls it up via `ensureMaterialized`, so it can be lazy, but the client service registration will arrive late — consumer null-check degradation is mandatory (see [ext-services](/en/guide/ext-services.html) §3)
- Sole entry point / takes over core built-ins (modelSelector etc.) → don't mark lazy; if too heavy, go with bundle splitting
