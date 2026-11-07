---
title: aiti-quickstart
icon: 🚀
description: Blank-state onboarding extension — new-session welcome page widgets (getting-started steps / quick actions / sample prompts, via the host newSessionWidgets slot, ⚙ customizable) + a left sidebar DockStack fully-collapsed blank guide card (shares the screen with the app center, ✕ dismissible) + a v2 workspace-acquisition Hub (Git clone / upload archive / local directory / create new) + a sidebar "Quick Start" static entry (pinnable as a card in the app center; clicking returns to the quickstart welcome page)
---

# aiti-quickstart · Quick Start

> ❝ **A blank slate is nothing to fear; your first sentence starts here.** ❞

Onboarding for pi-web's "completely blank state": both the new-session welcome page and the left sidebar fully-collapsed blank get getting-started content, and the common area can always return to the quickstart page. Since v2 it ships server-side endpoints (workspace/clone|history|forget|record); when absent/disabled, all surfaces naturally fall back to the status quo.

## Capabilities

- **New-session welcome page widgets ×3** (host `newSessionWidgets` slot; 8-column grid on desktop / 4 on mobile; the ⚙ customization panel manages hide/move/reorder uniformly; preferences stored in `pi-new-session-widgets`; all three widgets are full-row 8×1):
  - **Quick Start** (top, 8×1): 4 step cards — ① pick the project directory (left sidebar project row / Workspace dropdown) ② type the first message and press Enter to start ③ `@` to reference files, `/` to open the command menu ④ switch models with the bottom selector; the guide widget reshapes with the onboarding state (see "Workspace acquisition (v2 Hub)" below)
  - **Quick actions** (top, 8×1): `Ctrl+Alt+N` new session · `@` reference files · `/` command menu · Enter to send / Shift+Enter for newline
  - **Try asking like this** (bottom, 8×1): sample prompt chips; clicking writes into the input box via the `pi-web.composer` service and focuses it
- **Left sidebar fully-collapsed blank guide card** (delivered via the client service `aiti-quickstart.api` to the session-manager orchestrator as the DockStack filler): title + condensed 3-step guide + "Open the Quick Start page" button + ✕ close in the top right (persisted in `pi:quickstart:sidebar-dismissed`; after closing it falls back to the pure app center). Layout = guide card on top (flexShrink 0), app center below (flex:1 with inner scroll); any block expanding still auto-yields as usual
- **Sidebar "Quick Start" static entry** (sidebarFooter): serves only as a collection source for the app center; after client materialization the same-id registered item takes over with `render = null` (no button rendered in the bottom-left toolbar) — the return entry is a **card pinned in the app center; clicking it returns to the quickstart welcome page** (`?cwd=` → home fallback → toast notice; navigation goes through `pi-web.newSession.setCwd`)

## Workspace acquisition (v2 Hub)

- **Three-step start card**: get a workspace → configure the model → send the first message; the guide widget reshapes with the onboarding state (fresh: big-button flow "get workspace / configure model" / hasWorkspace: last workspace + configure-model guidance / full: four step cards)
- **Four Hub entries**: Git clone (server API `POST workspace/clone`, git clone --progress + staging placement + never-overwrite `-2/-3` increments, progress streamed as aiti-event-bus topic frames) · upload an archive (reuses the session-manager service) · local directory · create an empty directory; reachable daily via "Get workspace…" at the bottom of the Workspace dropdown
- **Recent workspaces**: acquisition records merged with a top-level scan of `~/workspace` (`GET workspace/history`, `POST workspace/forget` removes a record)

## Mechanism

- Lazy extension (`clientImmediately: false`): manifest static items are rendered by the host in standard form; after materialization a same-id registered item takes over (title switches to t() multilingual) — the welcome page widgets ×3 keep rendering as usual after takeover, while the sidebarFooter item takes over with `render = null` (no button rendered; see "Capabilities"); when the session-manager orchestrator mounts, `ensureMaterialized` deterministically pulls up the filler delivery surface
- Pure logic layer `quickstart-logic.ts` (widget metadata constants / dismissed-state storage / cwd resolution chain / onboarding state machine) + unit tests `quickstart-logic.test.mjs` (cwd resolution chain / dismissed-state roundtrip / layout constants / manifest↔client drift guard / i18n key full coverage)
- Soft dependencies: session-manager (filler consumption + upload reuse), aiti-event-bus (clone progress frames), aiti-model-wizard (configure-model deep link, degrades when the client service is absent)

## Degradation

| Scenario | Behavior |
|---|---|
| aiti-quickstart disabled/absent | filler falls back to the pure app center (widget area only builtin:recent), no sidebarFooter entry, zero errors |
| User ✕ dismisses the guide card | filler's top half is empty (returns null), app center as usual |
| aiti-app-center absent | filler contains only the guide card |
| aiti-float absent | session-manager fallback straight-layout branch has no filler (welcome page widgets unaffected) |
