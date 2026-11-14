---
title: Slot Tables
icon: 🧩
description: All pi-web UI slots grouped for lookup — mount points, props contracts, declarative-item support
tags: [ext-dev, slots, reference]
---

# Slot Tables

Frontend slots are rendered by `<ExtSlot name=.../>` in the host's `components/ExtSlots.tsx`.
Extensions register actual components via `ctx.registerItems(slot, items)` in the client bundle,
and/or declare static items in the entry `ui` (lazy-load v2 — "zero-bundle entries" the host
renders before the client materializes).

Source of truth: `lib/ext/types.ts` (`ExtSlotName` + `ExtSlotContractMap`). Slots keep growing with
the host; this table reflects the host as of 2026-11.

## 1. Usage

```js
// Runtime registration (inside the client bundle's register(ctx))
ctx.registerItems("toolbar", [{
  id: "open",
  // Declarative item (toolbar only): the host renders the standard button
  meta: { label: "Open", icon: { svg: '<path d="..."/>' }, onClick: (e) => {} },
}]);

// Stateful item: render owns the body (badges/status colors)
ctx.registerItems("sessionTopbar", [{
  id: "tags",
  render: (props) => h("div", null, props.currentSession?.name ?? ""),
}]);
```

- Item = `{ id, render?, meta?, feature? }`; composite id = `"extId:itemId"`.
- `render(props)` receives `currentSession` + slot extras (`ExtSlotPropsWithBuiltIn`).
- `ctx.disposeItems(slot, ids)` removes exactly these registrations (HMR semantics).
- **Extras carry data only; callbacks always go through services**
  ([host slot red line](/en/guide/ext-services.md) §5.1).

## 2. Slot groups

### Toolbar & global entries

| Slot | Mount point | Carries |
|---|---|---|
| `toolbar` | Top toolbar (next to globe) | Tool buttons; **the only slot supporting fully declarative items** (host-rendered 36×36 grayscale buttons + ⋯ menu) |
| `sidebar` | Sidebar header (next to New/Refresh) | Panel entry buttons + running badge |
| `sidebarFooter` | Sidebar bottom quick-action row | Quick entries in the same row as built-in models/skills/plugins |
| `banners` | Top alert area | Alert banners |
| `pages` | AppShell tab system | Full-page views |
| `dialogs` | AppShell dialog area | Dialogs |

### Session list

| Slot | Mount point | Carries |
|---|---|---|
| `sessionTopbar` | Chat top bar | Current-session tag area (chips + ★ + edit) |
| `sessionRowActions` | Session-row hover action area | Inline ★ / tag buttons |
| `sessionRowLeading` | Session-row leading position | Row-leading decoration/status |
| `sessionRowMeta` | Session-row second line, after meta | Row meta (e.g. plan badge + tags) |
| `sidebarProjects` | Left "Projects" list full takeover | SidebarClone (session-manager; props passed through in full — contract is SessionSidebarProps itself) |
| `sidebarContent` | Left sidebar full takeover (AppShell layer) | Header + DockStack block stack + bottom row (unified dock plan; without items the host's original sidebar falls back) |
| `sidebarTasks` | Left sidebar "Tasks" area | Subagent task block (float extension; not rendered with no items) |

### Chat surface

| Slot | Mount point | Carries |
|---|---|---|
| `chatInputTop` | Above the chat input | Input-assist area (inspect candidates etc.) |
| `chatOverlay` | Overlay above the message area | Message scroll navigator etc. floating toolbars |
| `composerTools` | Control row under the input | Same row as compact/stop/import-queue (git-trace timeline entry etc.) |
| `composerAffix` | Affix position inside the input, right edge | Mobile 🎤 etc. (rendered only on the mobile input row; naturally exclusive with the built-in ×) |
| `userMessageActions` | Hover area under user messages | Message actions (📌 save prompt etc.) |
| `assistantMessageActions` | Hover area under assistant messages | Message actions (🔊 read aloud etc.) |
| `assistantMessageFooter` | End of assistant message content | Turn-level aggregates (changed-file lines etc.; contract `AssistantMessageFooterSlotProps`) |
| `modelInfoLead` | Mobile model-info leading position | Context ratio bar (contract `ModelInfoLeadSlotProps`) |
| `compactLead` | Desktop position left of the compact button | Same contract (desktop variant, isMobile always absent) |
| `sessionRequestCard` | Session request-card takeover seam | Unified takeover of interaction-primitive / tool-authorization / captcha cards (contract `SessionRequestCardSlotProps`; routed by kind, misses fall to the host's minimal card) |
| `queuePanel` | Queue panel | Full queue UI takeover (contract `QueuePanelProps`; fallback banner without takeover) |
| `recoveryDialog` | Queue recovery dialog | Recovery UI takeover (live props injected; render conditions stay in core) |

### Models & settings

| Slot | Mount point | Carries |
|---|---|---|
| `modelSelector` | Chat input model button takeover | Registering replaces the native ModelSelector (contract `ModelSelectorSlotProps`; native fallback when unregistered) |
| `modelSelectorFooter` | Bottom action area of the model dropdown | Manage-models entry (contract `ModelSelectorFooterSlotProps`) |
| `sessionStats` | Inside the session-stats dropdown | Report entry rows (usage-report etc.) |
| `settingsModels` | Settings "Models" tab full takeover | Registering replaces the native ModelsConfig (contract `SettingsModelsSlotProps`) |
| `settingsAgentsFeature` | Feature block atop the settings Agents page | Engine banner + entry (contract `SettingsAgentsFeatureSlotProps`) |
| `settingsAgents` | Settings "Subagents" tab full takeover | Registering replaces the native AgentsConfig (contract `SettingsAgentsSlotProps`) |

### New-session surface

| Slot | Mount point | Carries |
|---|---|---|
| `newSessionSelectors` | Picker row between Workspace×Backend | Branch/worktree pickers etc. (extra carries `{ cwd, isMobile }` only; side effects go through `newSessionPreparers`) |
| `newSessionPreparers` | (registration surface, no rendering) | Pre-creation pipeline before the first message: `meta.prepare({cwd}) => { cwd? } / { abort }` |
| `newSessionBackendOptions` | Extension entries inside the Backend dropdown | One `<option>` per item; selecting runs `meta.onClick` |
| `newSessionContextTrailing` | Trailing buttons after Workspace×Backend | Upload-workspace shortcut etc. (contract `NewSessionContextTrailingProps`; moving the composer goes through the `pi-web.newSession` service) |
| `newSessionWidgets` | Top/bottom widget areas of the welcome page | One registration surface, two render points (meta declares areas/grid size; contract `NewSessionWidgetSlotProps` + `NewSessionWidgetMeta`) |
| `noWorkspaceGuide` | Full replacement of the no-workspace placeholder | Fresh first-screen guide (contract `NoWorkspaceGuideSlotProps`; actions via `pi-web.newSession.setCwd` etc.) |

### Files & workspace

| Slot | Mount point | Carries |
|---|---|---|
| `fileViewer` | File view/edit takeover | Text editing / folder browsing etc. (springboard-rendered, needs a match predicate; native viewer falls back) |
| `pathPicker` | Directory-picker capability | Consumed by the top bar's "open folder" etc. (items carry `render({path,onSelect})`) |
| `workspacePickerActions` | Bottom action area of the cwd picker dropdown | Workspace list management (contract `WorkspacePickerActionsProps`) |
| `terminalDock` | Workspace terminal tab content takeover | Real PTY terminal view (contract `TerminalDockSlotProps`; tab⇄dialog single-instance toggle) |

### Dock family

| Slot | Mount point | Carries |
|---|---|---|
| `sidebarExplorerDock` | Vertical dock below the sidebar file area | Collapsed header + stacked items (whole block not rendered with no items) |
| `rightFileDock` | Right-column dock | Each item derives a TabBar tab (`dock:<extId>:<itemId>`; mutually exclusive switching with file/terminal tabs) |

## 3. Type contracts (ExtSlotContractMap)

Slots with declared props carry a contract in `ExtSlotContractMap` (the "contract" column above);
undeclared slots degrade to a loose `Record<string, unknown>` (backwards compatible). Extensions
(TS-authored clients) can add contracts for the slots they use via augmentation:

```ts
declare module "dev-repo/ext" {
  interface ExtSlotContractMap {
    chatInputTop: { props: { inputValue: string } };
  }
}
```

Host-declared contracts (e.g. `queuePanel`) merge in directly; both sides consume by structural
contract. **Type-level documentation, no runtime effect.**

## 4. Declarative-item constraints

- Fully declarative (no render) is **toolbar-only**; interactive widget slots such as
  `sessionTopbar` must still provide render.
- For items with render, if `meta.icon` + `meta.onClick` are provided, the ⋯ menu's icon slot and
  click destination belong to the host and render's menu branch is not used.
- Consumers (host internals) narrow uniformly with `hasExtRender()`
  (ExtSlot/pathPicker/FileViewer filter built in).
- The `feature` gating of `ui[slot]` static items and the takeover by client-registered items see
  [lazy-loading contract](/en/guide/ext-lazy-loading.md).
