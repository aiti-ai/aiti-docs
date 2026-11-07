---
title: aiti-recovery
icon: 🔄
description: "Recovery UI extension — queue recovery dialog (resolving queued messages left by interrupted sessions one by one) + restart recovery wizard (two-step handling of interrupted sessions), red-line semantics preserved: never auto-deliver, resuming only sends \"continue\""
---

# aiti-recovery

> ❝ **Interruption isn't scary; what's scary is not finding the way back.** ❞

Recovery UI extension (pi-web defork B3 migration product): moves the handling UI for post-crash queued-message residue and interrupted sessions out of the core, while the mechanisms (running-journal scanning / sidecar persistence / recovery RPC primitives) stay in the core.

## Capabilities

- **recoveryDialog injectable slot**: renders a dialog when a session has unresolved queued residue (items/onResolve/onExport/onImport/onDismiss/mode live props delivered by the host, same style as queuePanel); check items one by one → discard / requeue / requeue and continue; supports exporting JSON/MD and importing back
- **Restart recovery wizard**: on mount queries `/api/agent/recovery/interrupted`, shown only when interrupted sessions exist; two-step flow (pick session → handle that session's queue); "ignore session/ignore all" persists dismissed
- **Red-line semantics**: never auto-deliver anything — the resume prompt is only sent when the user clicks "retrieve and continue", and it only sends "continue" without replaying the original prompt (the original prompt might be a dangerous command)
- **Feature switch**: `recovery.enabled` off → nothing pops (sole-owner; data stays safe in the sidecar and can be handled via the first-aid path)
- **Small screen**: `data-ext-float` contract (aiti-float handles system-back close/dragging)

## Dependencies

The host pi-web must contain the `recoveryDialog` ExtSlot (defork B3 branch); the data-plane APIs (`/api/agent/recovery/*`, `/api/sessions/[id]/queue-recovery`) are pre-existing core.

## Provenance

Migrated out of the pi-web fork's `components/QueueRecoveryDialog.tsx` (559 lines) + `RestartRecoveryWizard.tsx` (504 lines) (`pi-web-defork-batch-2026-09-plan.md` §4).
