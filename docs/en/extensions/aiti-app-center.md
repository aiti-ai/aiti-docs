---
title: aiti-app-center
icon: 🧭
description: The app drawer (start menu) shown in the blank state after every left-column dock block is collapsed — a single-row switch between the Apps view (action/panel/manage entry cards, hover quick-pin + info page) and the Toggles view (feature toggles grouped by extension), tag-style categories (8 fixed internal categories with i18n + custom categories + default other), search scoped per view, and edit-mode reorder/hide/restore
---

# aiti-app-center · App Center

> ❝ **Home for every plugin entry — collapsed, it becomes the start menu.** ❞

The large blank space in the left column after all DockStack blocks are collapsed → presents the App Center: a search row (with edit `✏️` / open extension manager `＋` / view switching) + a grid of frequent (pinned) cards + a "More" category browse. The moment any block expands, it automatically yields (filler semantics, zero show/hide state).

## Capabilities

- **Two views, switching takes no extra row** (v0.2.0): one compact icon button on the right end of the search row goes back and forth between "Apps" and "Toggles" (the icon points to the other side relative to the current view)
  - **Apps view (default)**: executable entry cards — `action` (toolbar declarative items, `meta.onClick` callable; lazy-extension static items carry their own materialization forwarding), `panel` (rightFileDock docked panels, `present` state machine: already docked → bring the original position to front → preferred position → right-column tab), `manage` (sidebarFooter management entry)
  - **Toggles view**: row-style toggles for manifest boolean features **grouped by source extension** (group header = extension icon + name + count; a click toggles, via the extman ops API + the `pi-web:ext-features-changed` event loop-back; a disabled feature's top-bar entry disappears but the toggle row stays visible and toggleable). string/textlist config items don't enter the pocket; the extman panel handles them
  - Search is limited to the current view; switching to the Toggles view exits edit mode automatically
- **Hover quick-pin + info page (`?`)**: in non-edit mode on desktop, hovering a card immediately shows `☆` at its top-right (pin/unpin; always visible on touch screens), no need to enter edit mode; after pinning, "More" stays expanded (consecutive pinning is not interrupted). `?` opens the info overlay (absolute-positioned on the panel root, content scrolls internally):
  - Source extension (name · id · version · **description**), feature notes (card type + name + feature description)
  - The extension's toggle list is **toggleable in place**
  - **One-click disable extension**: double confirmation → processing → optimistically remove all of the extension's cards + a note "can be re-enabled in extman"; if hard dependents exist, the button is **grayed out** and the user is guided to extman (the criterion approximates the manifest declaration; divergence from extman `depsResolved` is accepted); `aiti-app-center` itself and `aiti-extman` (the manager) provide no disable button
  - "Open extman" jump (when extman is absent, the disable area and `＋` are hidden together)
- **Edit mode (`✏️`, Apps view only)**: reorder the pinned area ▲▼, hide ✕, and an "N hidden items" restore area at the bottom — the bulk-tidying entry
- **Tag-style categorization (v2 scheme)**: item level (`meta.category` / static item `category`) → feature level (`features[].category`) → extension level (index.ts top-level `category`, passed through via manifest) → override table → default `other`. Eight fixed internal categories with multi-language support (Sessions & Projects / Code & Git / Models & AI / Automation & Agents / Debugging & Observability / UI & Reading / System & Administration / Other); non-internal ids = custom categories shown as-is. Extension authors tag a single field to be cataloged; untagged legacy extensions are classified by the `APP_OVERRIDES` override table as a fallback
- **Shape adaptation (v3)**: with ≤ 12 apps, tile them all; otherwise a two-tier "frequent + More" layout — with no pinning record (first-run state), "More" is expanded by default; the shape decision uses the **actually visible pinned count** (hidden items/unregistered entries excluded)
- **User customization**: `pi:app-center:pinned:v1` / `pi:app-center:hidden:v1` (localStorage, client-side convention; stores app cards only) + same-tab `pi:app-center:store` events and cross-tab `storage` sync; v1 leftover `toggle:*` records are cleaned once at component load by `pruneToggleIds()` (idempotent, zero writes when already clean)
- **Mobile**: card touch targets ≥40px, search doesn't auto-focus, chips wrap into a tag cloud, action buttons always visible under `hover:none`; the App Center goes fullscreen along with the sidebar drawer
- **Dead entry defense (v0.2.x)**: entries gated off by a feature don't become cards (every host consumer hides them; keeping them in the drawer = permanently unopenable); panel card ids are addressed by the host's fully-ordered dock key (`<extId>:<id>`); static panel declarations (`static:true`) don't become cards; same-name dual cards across kinds within one extension are deduplicated (the panel card is kept — present semantics are the most complete, falling back to the action card when the panel is absent)

## Architecture

- Pure client extension (zero server-side APIs of its own); delivered via the client service **`aiti-app-center.api`** (`{ renderAppCenter }`)
- Consumer session-manager orchestrator: on mount calls `ensureMaterialized("aiti-app-center")` and passes the service component factory as the `filler` prop to the aiti-float DockStack — rendered into the spacer only when everything is collapsed, zero rendering otherwise
- Soft dependency chain: App Center absent = blank as before (session-manager `optionalDependsOn`); older aiti-float (no filler prop) = App Center not shown, everything else unaffected
- Layering: `client/src/app-registry.ts` pure logic (category resolution chain / card assembly / view routing and grouping / storage and migration / extman ops calls) + `client/src/app-center.tsx` rendering (no state store of its own); cards of a disabled extension disappear via extId optimistic filtering, not depending on host store update timing

## Dependencies

- Host pi-web: `registry.ts manifest()` passes through extension-level/feature-level `category` and `description` (description = entry declaration first, package.json fallback; on unsynced hosts the category automatically falls to the override table/default category and the description shows "(no description)" — graceful degradation). ⚠ The host registry instance hangs on the `globalThis.__piWebExt` singleton; changes to `manifest()` only take effect after restarting the pi-web process (`POST /api/extensions/reload` can't swap it)
- Runtime companions: aiti-float (DockStack filler prop, v2), session-manager (orchestrator wiring), aiti-extman (`ops` set-feature/disable + the panel opened by `＋`; toggle writes and the disable area hide when it's absent)

## Plans

- `dev-repo docs/aiti-app-center-plan.md` (started and implemented 2026-09-19; v2 category scheme redesign, v3 shape adaptation)
- `dev-repo docs/aiti-app-center-refactor-plan.md` (v0.2.0 refactor: separate views taking no extra row / hover quick-pin + info page / edit-mode restore / one-click disable state machine / `toggle:*` migration, implemented 2026-09-22)
