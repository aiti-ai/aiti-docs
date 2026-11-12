---
title: aiti-plan-review
icon: 🧐
description: Plan-Sandbox adoption wrap-up UI — reads the review.json contract (declared vs actual changes); adopt selected and close the sandbox / keep only (sandbox preserved) / discard all + sandbox history (re-extract / reuse / destroy)
---

# aiti-plan-review

The Plan-Sandbox adoption wrap-up UI: the adoption interface after a plan sandbox trial run. 13 server API endpoints: list / status / start / new-plan / end / preview / settle / extract / reuse / history / file / apply / discard.

- **Contract**: reads `review.json` (a comparison of declared changes vs the sandbox's actual changes); per item, **adopt selected and close the sandbox / keep only (sandbox preserved) / discard all + sandbox history (re-extract / reuse / destroy)**.
- **Session takeover**: agent tools plan_start / sandbox_bash / declare_deliverables (plus plan_abort as the failure exit) override read/write/edit/bash/ls/find/grep by the same names — once active, all reads/writes and commands go into the isolated snapshot; while inactive they pass through to the built-in implementations. Features come in three groups: "Plan tools / sandboxed system tools / Plan UI".
- **Adoption safety**: manifest.baseHashes workspace-drift detection (a missing key rejects adoption) + full order rollback when the gate fails; adopt/discard lands in the aiti-git-trace ledger (plan-accept / plan-discard), and a terminal-state copy is kept under configDir cache/ for retrospective tracing.
- **lineage relation**: it is the closing piece of the "sandbox adoption bypassing tracking" gap (GAP-3) in lineage closure; the ledger row's additive `planRel` (binding the plan into the row) is implemented (2026-09, P1-2).

