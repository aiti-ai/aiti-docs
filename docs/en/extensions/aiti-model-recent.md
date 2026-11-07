---
title: aiti-model-recent
icon: 🕐
description: The model selector's "recently used" data provider — a pure service extension (zero UI); the panel's recent section fetches data synchronously and pick events feed the LRU; the localStorage key matches the original implementation, zero migration
---

# aiti-model-recent

> ❝ **Frequently used models should be at your fingertips.** ❞

The model selector's "recently used" data provider extension (an outcome of pi-web deforking P4 externalization): **a pure data service with zero UI** — when the core ModelSelector panel renders the recently-used section it fetches data synchronously via the client service; UI belongs to the host, data belongs to the extension (the minimal seam form).

## Contract

- **client service** `aiti-model-recent.recentOptions`: `getRecent({ open, filter, sortedOptions })` → panel group entries (only when the panel is open and not in search state; reverse order by recorded time; delisted models disappear automatically; dedup; cap 8)
- **pick event**: listens on the window `pi-web:model-picked` (detail `{provider, modelId}`) → LRU record (move to front / dedup / truncate)
- **Storage**: localStorage `pi-web:recent-models` — identical to the original core implementation, **zero data migration**
- **Immediate materialization**: `clientImmediately: true`; the service must be registered before the panel is first opened

## feature switch

`modelRecent.enabled` off → service unregistered → the core panel has no "recently used" section (graceful degradation, data retained).

## Origin

Externalized from the recent inline implementation (~110 lines) of the pi-web fork's `components/ModelSelector.tsx` (`pi-web-model-selector-ext-plan.md`, executed after re-measuring the criteria on 2026-09-16); the 9 LRU/pick unit tests migrated into this extension along with the logic.
