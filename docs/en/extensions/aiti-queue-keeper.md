---
title: Queue Keeper (aiti-queue-keeper)
icon: 📋
description: Queue panel take over — full queue UI (banner / row actions / drag sort / trash / undo bar / import-export); core reverts to the upstream-shaped fallback
---

# aiti-queue-keeper

> ❝ **Queuing isn't scary; what's scary is forgetting what you wanted to say after queuing.** ❞

Product of pi-web deforking P3: moves the ~900–1000-line queue enhancement UI out of ChatInput into a standalone extension; core returns to "upstream-shaped mechanism + thin integration" —
measured ChatInput fork lines +2556 → +1617 (net −939), queue-keyword lines 112 ≤ the 150 exit threshold.

## Features (takeover state)

- **Queue banner**: collapse/expand, counts, Recall all (recall everything for editing)
- **Row actions**: ↑↓ move, drag sort (desktop HTML5 / mobile touch dual implementations), steer-send to jump the queue,
  convert to follow-up, recall a single item, delete
- **Trash**: soft-deleted entries recoverable / hard-deletable (single/all, with confirmation text)
- **Undo bar**: an 8s one-click undo window after deletion
- **Import/export**: JSON export download; import goes through a staging restore dialog, decided item by item
- **Notice bar**: import/delete/trash feedback (visible even on an empty queue)

## Architecture (zero data migration)

- **core keeps the mechanism**: rpc-manager queue mirror / sidecar persistence / 12 RPCs / trash all stay in core;
  ChatInput keeps only the ExtSlot one-line integration + edit-intent check + bottomMode three states + the upstream-shaped fallback banner
- **extension keeps the policy**: all UI state lives in this extension's `client/src/QueuePanel.tsx`; operations go uniformly through
  the **actions primitives** (`QueuePanelProps.actions`) calling core RPCs — **the extension owns zero storage** —
  disabling the extension simply returns to the fallback banner; data is intact in any state
- **Contract**: core `lib/composer/queue-api.ts` (types + controller bus) ↔ extension
  `client/src/types.ts` (structural mirror); export download / import parsing pass through
  `actions.downloadExport/parseImport` to core pure functions (single implementation, zero logic in the extension)

## Control flow

- **core → ext**: ChatInput assembles `QueuePanelProps` (live projection + trash + actions + isMobile) passed in via the slot
- **ext → core**: `ctx.registerQueuePanelController({expand, notice})` — core's recovery flow
  (after the restore dialog resolves / after continue queue) calls `getQueuePanelController()?.expand()`
  to force-expand the panel; no-op when there is no takeover (the fallback banner has no collapsed state)
- **Takeover detection**: ChatInput judges by the actual queuePanel slot items (feature off / uninstalled / async
  load incomplete → fall back to the fallback banner)

## feature

- `queuePanel.enabled` (per-item toggle in extman): off = fall back to the core fallback, **effective live**, no page refresh needed

## Coordination with aiti-draft-keeper

The two keepers never talk to each other directly; everything meets through the core contract layer: draft recovery items and queue recovery items merge in core
QueueRecoveryDialog; a draft's "Re-queue" enqueues via core queueFollowUp (rendered by this extension);
after recovery resolution core calls controller.expand() to expand this extension's panel; inline recall writes the box via core edit-intent
(the draft keeper observes the same value via onChange).

## Build / deploy

```bash
npm install            # first time (vite)
npm run build:client   # vite lib mode → dist/aiti-queue-keeper.mjs
node tools/deploy.mjs  # build + copy to ~/.pi/web{,-dev}/extensions/
```

Effective: `POST /api/extensions/reload`; on the client, refreshing the page gets the new version (content-hash rev).
