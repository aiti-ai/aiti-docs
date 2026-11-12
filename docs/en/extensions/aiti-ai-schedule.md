---
title: aiti-ai-schedule
icon: 🗓️
description: pi-web resident scheduler — extension declarative scheduled tasks + AI plans (cron/interval/one-shot) + three-mode execution engine + AI self-service plan tool + management page
---

# aiti-ai-schedule

> ❝ **Stop hand-rolling setInterval in every extension — declare it and it's scheduled; AI can roster its own shifts too.** ❝

pi-web resident scheduler: **runs 7×24, regardless of session life or death**. Two kinds of tasks feed one kernel:

1. **Extension hook tasks (§2.5 mechanism)**: other extensions add a top-level `schedules: [{ id, name, intervalSec, enabled, run(ctx) }]` to their entry's `export default`; this extension aggregates, registers, and calls them on time — integrators write zero timers.
2. **AI plans (plans.json)**: created by users on the ⏰Schedule page, or self-created by agents via the `schedule_task` tool; when due, the execution engine drives the AI to completion in one of three modes.

- Full design: internal plan document

## Capability overview (v0.4)

| Capability | Description |
|---|---|
| Scheduling | cron expressions (5/6 fields, `0 9 * * *`), intervals (`30m`/`90s`), one-shot (`+30m` / ISO time); multi-schedule (array/multiple lines — the run fires when any time point is reached) |
| Watermark persistence | state.json records `nextRunAt`; catch-up runs within the stop grace window (default 5min), recorded as missed beyond it |
| Three execution modes | `session` injects into a live session's steer · one-shot full-featured session (tools/files available) · `invokeAI` lightweight Q&A; `auto` degrades automatically |
| Safety nets | concurrency cap 2 · per-run timeout 10min · 1 retry on failure (after 60s) · once/maxRuns self-stop at quota · auto-pause after 3 consecutive failures · daily execution budget (per-plan dailyCap + global config.dailyCap; manual runs don't consume quota) |
| Timezone | a plan may specify an IANA timezone (cron computed on that wall clock, DST iteration converges); default is local |
| Permissions | AI-created plans default to disabled pending manual approval; agent tools have no enable/approve power; edits must not carry enable/disable fields |
| AI self-created plans | the `schedule_task` tool exposes only the actions `add/list/get/update/disable/remove/run-now` (no enable/approve — calling them returns an error pointing to the management page for approval); agent-created plans default to pending confirmation (the tool is off by default: enable via extman or the helper help point, `agentTools.enabled`) |
| Management page | ⏰Schedule page: list / create-edit / enable-disable / approve / run-now / delete / run history / live refresh (via the frame bus) / browser notification |
| Result delivery | ccProject+ccSessionKey pushes to a specified IM session via cc-connect · mailTo sends mail via aiti-mail · sendOn controls delivery conditions (all\|ok\|error, default all); missed runs also alert (1h throttle); notes are appended in place as run records |

## Gating and deployment (prevent dual-instance double triggering)

```bash
# prod (runs the scheduler): systemd drop-in already in place — takes effect on next restart
#   /etc/systemd/system/pi-web.service.d/ai-schedule.conf
#   Environment=AITI_AI_SCHEDULE_ENABLED=1
# dev (does not run the scheduler): env unset = off (UI/API remain fully viewable and manageable)
```

| Variable | Meaning |
|---|---|
| `AITI_AI_SCHEDULE_ENABLED` | unset = no auto triggering (prefer manual enable); at runtime, config `{enabled:false}` can pause it too |
| `AITI_AI_SCHEDULE_DATA_DIR` | self-managed data dir (state/ sits directly under it), overriding the host three-dir defaults. **Dual-instance separation plan**: dev/prod each get their own DATA_DIR — the two instances' plans/state are naturally isolated, so even if both enable gating someday their watermarks won't stomp each other |
| `PORT` | explicitly set by the drop-in (fallback address for the one-shot session's self-calls, not relying on Next internals) |
| `AITI_AI_SCHEDULE_API_ORIGIN` | one-shot session self-call address (default `http://127.0.0.1:$PORT`) |
| `AITI_AI_SCHEDULE_CATCHUP_GRACE_SEC` | catch-up grace seconds (default 300) |

## Storage

```
<extRoot>/state/plans.json                # AI plan snapshot (atomic write)
<extRoot>/state/state.json                # watermark table (post-crash catch-up runs / missed marking rely on it)
<extRoot>/state/runs.jsonl                # run history (append-only, truncated at ≥256KB keeping the latest 500 entries)
<extRoot>/config/aiti-ai-schedule.json    # runtime enable/disable switch
```

## Integration from other extensions (hook tasks)

```ts
export default {
  id: "my-ext",
  schedules: [
    { id: "my-job", name: "My task", intervalSec: 3600, enabled: true,
      run: async (ctx) => { /* ctx = { configDir, extId, scheduleId, manual } */ } },
  ],
}
```

First integrator: [aiti-configs](./aiti-configs.md) — crash sentinel (60s) / stale-session reminder (1h) / fallback commit (24h).

## API quick reference

`/api/extensions/aiti-ai-schedule/…`
`GET plans` · `POST plans` · `PUT plans/:id` · `DELETE plans/:id` · `POST plans/:id/run|enable|disable|approve` · `POST plans/validate`
`GET schedules` · `POST schedules/:id/run` · `GET schedules/log` · `GET runs?limit=` · `GET|POST config`
`GET cc/projects` · `GET cc/sessions?project=`

## File structure

```
the internal dev repo
├─ index.ts              # entry assembly (api / agent hooks / schedule_task tool)
├─ sched/cron.ts         # zero-dependency cron·interval·once time math
├─ sched/store.ts        # plans/state/runs persistence
├─ sched/engine.ts       # scheduling kernel + execution engine
├─ sched/outbound.ts     # result delivery (cc-connect + aiti-mail)
├─ client/src/*.tsx      # ⏰Schedule management page (vite build)
└─ tools/deploy.mjs      # dual-instance deploy
```
