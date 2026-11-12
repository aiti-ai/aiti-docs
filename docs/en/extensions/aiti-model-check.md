---
title: Model Availability Management (aiti-model-check)
icon: 📡
description: Model health probing — sends a tiny probe message to each model to check availability / 429 rate limiting / errors; parses the rate-limit recovery time (Retry-After etc.), records history to identify availability windows; long-term rate-limit expiry reminders (pure local time checks, zero probing)
---

# aiti-model-check

> ❝ **Is the model home? Knock and ask.** ❞

Model availability management extension: sends one minimal probe message (`"ping" → expects "ok"`) to every model in models.json via a **suggest-like lightweight direct connection**, and reads the result: **200 = available / 429 = rate-limited (parse Retry-After, X-RateLimit-Reset, error text → predict recovery time) / anything else = error**. Each probe is recorded into `history.jsonl` + `state.json`, and a background sentinel periodically re-tests non-available models → **the actual recovery time is observed**, identifying availability windows.

- **Model list merges two sources**: each time it opens, "explicit models.json config ∪ pi ModelRuntime snapshot" is merged — the snapshot is built at extension startup, so providers/models newly added via the wizard afterwards are supplemented from models.json even if not in the snapshot (`source: models.json`), without relying on a rebuild; entries the runtime has still defer to the runtime (store completion + baseUrl/api normalization). The check list is never based solely on its own historical state
- **Probing**: probe all models in one click (concurrency 2 · 15s timeout · ~8 tokens each · multi-key providers check per key by default `probe.perKey`), supporting openai-completions / anthropic-messages / openai-responses interfaces
- **429 recognition**: `Retry-After` (seconds/HTTP date), `X-RateLimit-Reset`, error body text ("Weekly usage limit reached. Resets in 4 days.", "GLM 套餐已到期"…) → expected recovery time
- **Records**: history.jsonl full history + state.json per-model latest status / 20-entry timeline / consecutive-429 count / `recoveredAt` recovery time
- **Background sentinel (off by default; enable via `watch.enabled`)**: every 60s re-tests only 429/error models; far-horizon rate limits auto-downsample by `watch.farFactor` → automatically identifies "when it recovers"
- **Runtime observation + per key (out-of-band, zero probing)**: per-key status for multi-key providers; tail of pi-models-combo proxy logs + 429/402/401/5xx ingested from direct-connection session events (key attribution, 1h/24h windows, notify-only, no marking); `POST /blocked-execution` reports of executions that "hit massive 429s and were genuinely blocked" → mark the model unavailable (`runtime.minBlockCount` default 3); OAuth subscription types get a provider-level status check (e.g. qoder quota/login state)
- **Rate-limit expiry reminders (recover, 2026-09-19)**: models rate-limited long-term (lasting ≥ threshold, default 72h = 3 days) get a reminder when the expected recovery time recorded with the 429 comes due — **pure local time check, zero probing**: browser notification + panel "⏰ To verify" list + per-model/provider 🔔 switches (model level > provider level > `recover.notifyDefault`, `POST /recover-notify`); due checks default to one round per 30min with idempotent catch-up on startup and panel load (`POST /recover-check`).
- **Agent tools** (8, see below; the whole group disabled by default): AI calls them directly, e.g. "check model availability"
- **ai-helper help points** (skills, invocable from the 🤖 dialog): `model-check` (check availability) / `model-config` (adjust config), see the aiti-helper integration guide (internal doc)
- **📡 Web panel**: status overview (✅/🔴/⚠️/⚪ + expected recovery) / one-click probing / history timeline
- **mc:avail event-driven**: 429/recovery broadcast `mc:avail` frames via `aiti-event-bus.publish` (persistent rate limits throttled per key to 2min, eliminating event storms); model-wizard banner consumes the data directly with no reverse lookup, no polling in the background
- **Servicification**: server features consolidated into `ctx.features`, client cross-extension services on dual tracks (`ctx.services` first + legacy global fallback), see [ext-services](/en/guide/ext-services.html)

## Agent tools

```
aiti_model_status          # Status overview (reads latest state, fast; includes per-key status/runtime errors/due reminders list)
aiti_model_keys            # Multi-key check (provider.apiKeys listed masked, per key available/429/latency)
aiti_model_availability    # Any available model (all-unavailable verdict + recent blocked execution records)
aiti_model_probe           # Probe now (all by default, filterable by provider/model; combo groups not probed directly) + record
aiti_model_report_blocked  # Report executions blocked by rate limiting (marked only when ≥ runtime.minBlockCount and genuinely blocked)
aiti_model_history         # Probe history (identifies availability windows)
aiti_model_balance         # Balance/plan usage (public balance APIs, cached ≤10min)
aiti_model_config          # Read/write config
```

> The 8 tools are **disabled by default** (features `tool.aiti_model_*` / `agentTools.enabled` default false); enable them from the extension manager or the ai-helper 🤖 help point.

## Config `config.json` (aiti-model-check dataDir)

```jsonc
{
  "modelsPath": "~/.pi/agent/models.json",
  "probe": { "timeoutMs": 15000, "concurrency": 2, "maxTokens": 8, "perKey": true },
  "watch": { "enabled": false, "intervalSec": 60, "onlyNotOk": true, "farThresholdMin": 30, "farFactor": 30 },
  "history": { "maxEntriesPerModel": 500 },
  "state": { "windowSize": 20 },
  "runtime": { "minBlockCount": 3 },
  "recover": { "enabled": true, "minLimitedHours": 72, "checkIntervalSec": 1800, "notifyDefault": true }
}
```

> Full design: internal plan document
