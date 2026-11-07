---
title: Floating Dialog Enhancer (aiti-float)
icon: 🎈
description: data-ext-float contract take-over — drag/edge resize/position persistence/click-to-front/double-click reset/auto maximize button, small-screen auto fullscreen + system back closes the float; the DockStack unified sidebar block-stack service
---

# aiti-float

> ❝ **The panel just sets one attribute; everything about floating is left to it.** ❞

Pure client extension: any dialog panel whose root node carries `data-ext-float="1"` automatically gets drag-to-move, edge resize, position persistence, click-to-front, double-click reset; the first child element serves as the drag handle. Since v0.4.0 it also auto-injects the standard ⛶/❐ **maximize button** into the title bar (click to fill the viewport; auto-hidden in small-screen fullscreen state; `data-ext-float-max="0"` opts out) — zero code for the integrating extension. Adding `data-ext-float-full="1"` makes the panel auto-fill the viewport on small screens (≤640px wide) and disable gestures/persistence, switching dynamically across breakpoints. Since v0.4.5, **automatic mask removal**: when enhancing a panel, semi-transparent fullscreen masks in the ancestor chain automatically turn transparent + click-through (floats no longer block message-area interactions; true modal confirm dialogs add `data-ext-float-keepmask="1"` to opt out, side effect = outside-click-to-close stops working).

When this extension is not installed/disabled, panels fall back to an ordinary centered dialog (their own style as fallback) — zero logic, zero state for integrators.

Since v0.5.0, when a panel is open on a small screen (≤640px), **system back closes the panel first** (Android back button / iOS edge swipe, consuming the host's `pi-web.overlayBack` pop-stack service, zero code for integrators; panels without a ✕ don't register, old hosts/desktop degrade automatically). v0.5 also registers the **`aiti-float.dockstack` service** — the unified sidebar block-stack container (persistent blocks + dockable items, user ordering/collapse persistence, alignment grouping, single-expand accordion, lazy extensions materialize their static shell only on expand; **`filler` prop v2 = the filler shown when everything is collapsed**); session-manager's sidebar take-over is orchestrated by it, and it `dependsOn` this capability (extman prevents disabling this extension on its own). There is also the `aiti-float.dock-header` service (dock header toolbar store; third-party extensions access it via getExtService).

Contract deep-dive (full attribute table / small-screen fullscreen / manual maximize API / keepmask opt-out / pos / persist): see `dev-repo/docs/aiti-web-ext-float-dialogs.md`; authoring overview `docs/dev-repo-authoring-reference.md` §8.3. Common attributes quick reference:

| Attribute | Effect |
|---|---|
| `data-ext-float` | `"1"` move + resize; `"drag"`/`"resize"` individually |
| `data-ext-float-w` / `-h` | Initial size in px |
| `data-ext-float-autoh` | `"1"` height adapts to content (height not persisted; for async-growing dialogs) |
| `data-ext-float-full` | Auto-fills the viewport on small screens (≤640px wide) — always use this for new dialogs' small-screen adaptation, don't hand-write matchMedia |
| `data-ext-float-max` | `"0"` don't inject the auto maximize button |
| `data-ext-float-keepmask` | `"1"` opts out of automatic mask removal (for true modal confirm dialogs) |
| `data-ext-float-drag` | Placed on a child inside the panel = designates that element as the drag handle |
| `data-ext-float-pos` | `"asis"` keeps the render position on first appearance (for anchored dropdowns) |
| `data-ext-float-persist` | `"0"` disables position persistence (the anchored-dropdown fix for off-screen drift on narrow viewports) |
| `data-ext-float-min-w` / `-min-h` | Edge-resize minimums (default 320×200) |

## Integration Examples

- Runnable references: [demo](demo.md), [ext-jsx-client template](ext-jsx-client.md)
- Actual integrators: aiti-ui-env, extman, model-wizard, session-manager, plan-first — dialogs across the whole repo are integrated

## Version History

- **0.5.x**: small-screen system-back closes the float (0.5.0, `pi-web.overlayBack`); DockStack service `aiti-float.dockstack` (filler prop v2); bring-to-front no longer lifts "non-stacking-context" positioned ancestors — fixes the transparent message area overlaying both sidebars after plan/ask cards (0.5.1); drag snapping — a floating drop point hitting a declared zone container docks it into the stack (0.5.2); same-itemKey float+embedded double-open detection (0.5.3)
- **0.4.8**: initial/restored position off-screen fallback pulls it back to center
- **0.4.7**: `data-ext-float-pos="asis"` (anchor at appearance position) + `data-ext-float-persist="0"` (disable persistence) — the combo punch for anchored-dropdown dialogs
- **0.4.6**: appear-to-front — newly mounted panels auto-raise above existing floats (fixes "later-opened dialogs buried under earlier ones"; observed case: archive viewer obscured)
- **0.4.5**: **automatic mask removal** — semi-transparent fullscreen masks in the ancestor chain auto-turn transparent + click-through (`data-ext-float-keepmask` opts out); performance red line: scan self-heal returns immediately upon hitting an already-marked ancestor (zero forced reflow in steady state)
- **0.4.4**: performance incident fix — MutationObserver callbacks no longer chain microtasks (a 0.4.3 regression starved the main thread and froze the page), switched to rAF scheduling + style same-value guards
- **0.4.0** (2026-08-26): auto-inject standard maximize buttons ⛶/❐ (`data-ext-float-max` opts out); added `__piweFloat.isFull()`; extman / ai-usage / subagents self-provided buttons migrated
- 0.3.x: small-screen fullscreen `data-ext-float-full`, manual maximize API (`toggleMax/setMax/isMax`), `data-ext-float-autoh`
