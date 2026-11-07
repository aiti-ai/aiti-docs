---
title: Plan First (aiti-plan-first)
icon: 📋
description: "AI development, plan first then act — aiti-git-trace event awareness (push-listen architecture, zero scanning): md changes pop the binding wizard (plan-named files prioritized), reminders for big changes without plan updates and for getting ahead with \"do the plan first\", a tags closed loop (front-matter as the source of truth + manual/self-nominated tags), and a 📋 binding badge at the front of session list rows"
---

# aiti-plan-first · Plan First

> ❝ AI development: plan first, then act ❞

## What it is

The toolbar "📋 Plan First" button + a short non-modal dropdown. **Push-listen architecture** (zero polling, zero scanning in the steady state):

1. **Binding wizard**: an md appears among this round's changes (**plan-named prioritized**: design/plan/spec/rfc/方案/计划/设计 pop on new creation, bypassing the cooldown) → asks "Is this the plan for this session?" (you can browse all mds to choose; obvious non-plans like skills/** and SKILL.md are excluded)
2. **Drift reminder**: bound, and a single turn's changes ≥ threshold (default 3 files/3 ops) with the plan not updated → pop a reminder with one-click insert of "Update the plan doc: @file"
3. **Ahead reminder**: unbound + code or any non-ignored file changed ≥ 1 → pop "Do the plan first" (independent 30min cooldown; writing skills also counts as changing code)
4. **Tags closed loop**: teach (prompt/inserted text carries the front-matter tags convention, including status tags 方案/评审中·已实施·已过时) → AI writes (front-matter is the source of truth; tags may be self-nominated, not limited to a vocabulary) → self-check (status/doctags read the doc in real time + followed triggers a doc-center scan) → manual (in the bound-state dropdown tags row: chips × to remove / type + Enter to add, written back)
5. **List icon**: the `sessionRowLeading` row-leading extension slot (a new generic position in pi-web) — bound session rows carry a persistent green 📋 badge; shown the same in the All Sessions panel and the doc-center 🧵 session view
6. **Session-entry check** (0.3.0 — plan-document milestone number, not the package version): switching sessions / entering with `?session=` → POST /check evaluates the ledger once — sessions missed while terminal-bridged or with the page absent also pop the binding wizard; the **entry check's stale evaluation** is the only automatic reminder channel for terminal-bridged sessions (their events can't cross the bridge)
7. **Clickable suggest-md paths**: suspected plan doc paths in reminders are buttons; clicking calls openFile to open a tab for verification

## Event chain (push-listen, zero intrusion into git-trace)

```
pi extension appendRow ledger row → globalThis.__aitiTraceEmit? (loosely coupled optional chaining; core §6 reserved hook — the producer, the pi extension loader, sits outside the extension ctx system)
  → aiti-git-trace sink → traceBus
     ├─ services.trace.onOp (v2 + onOp/SSE /events)   ← in-process listening in this extension (main channel)
     ├─ GET /events (SSE)                             ← browser
     └─ readOps                                       ← seq-gap filling + downgrade, not the normal path
```

Full design: `dev-repo/docs/aiti-plan-first-plan.md` (cold-start seeding, seq-gap filling, three-tier degradation, buffer capacity, terminal-bridged session boundaries, etc.).

## Gating (extman feature switches)

| feature | Default | Notes |
|---|---|---|
| plan.toolbar | on | Toolbar button |
| plan.suggestMd | on | Binding wizard on md changes |
| plan.leadRemind | on | Ahead reminder (unbound + code changed pops "do the plan first") |
| plan.staleRemind | on | Big-change-without-plan-update reminder |
| plan.bigFiles / plan.bigOps | 3 / 3 | "a lot changed" threshold |
| plan.mdIgnores | empty | Additional md ignores (glob) |
| plan.autoCloseSuggestSec / autoCloseStaleSec / autoCloseLeadSec | 0 / 30 / 10 | Seconds before a reminder auto-dismisses (wizard/drift/ahead; 0 = stays until handled) |
