---
title: pi-models-combo (pi model governance)
icon: 🎛️
description: Model governance for the pi coding agent — model list filtering + sticky multi-key API rotation against 429 rate limits + multi-provider aggregation (combo virtual models) + quality monitoring; installs into ~/.pi/agent/pi-plugins/
---

# pi-models-combo (pi model governance)

> ❝ **Keep the model list tidy and keep 429s from breaking your flow — filtering, rotation and aggregation each do their part.** ❞

A model governance plugin for the pi coding agent (formerly pi-models-respect). pi's `models.json`
is additive: built-in providers keep their full catalogue and your entries merge on top —
openrouter-class providers show 300+ built-in models, and on 429 rate limits pi has no way to
retry with a different key. This plugin closes both gaps without changing how pi resolves
providers.

## 1. Model filtering

For providers with an explicit `models` list in `models.json`, only the configured models stay
visible — hundreds of built-in catalogue models (e.g. openrouter's full catalogue) quietly step
aside. Providers without an explicit list are untouched. The allowlist is generated 100% from
`models.json` (auto re-read by file mtime): add or remove models in the wizard and the next query
reflects it — no extension edits, no restarts.

## 2. Multi-key rotation (local proxy)

When a provider has multiple `apiKeys`, a **random-port local proxy** starts automatically and
registers into the session via `pi.registerProvider()` (extension-level overrides beat
models.json, so routing always goes through the proxy). pi only sees a normal URL and a random
dummy token — **it never touches the real keys or the raw rate-limit headers**. Proxy behaviour:

| Behaviour | Detail |
|---|---|
| Per-API-type key injection | `Authorization: Bearer` (openai-completions/responses), `x-api-key` + `anthropic-version` (anthropic-messages), `x-goog-api-key` (google-generative-ai) |
| 429 auto-retry | up to 5 attempts, exponential backoff + jitter; rate-limited keys cool down (`Retry-After` or 30s default) |
| Per-key rpm throttle | even spacing auto-derived as 60000/rpm; `minIntervalMs: 0` opts out to a burst-then-quiet sliding window |
| Role rewrite compat | openai-completions `role:"developer"` → `system` (GLM-style relays reject the developer role; `PMC_NO_ROLE_REWRITE=1` disables) |
| OpenCode Go compat | auto-injects `x-opencode-session` for Console Go upstreams (stable per-session hash, prompt-cache friendly; `compat.xOpenCodeSession` to force/disable) |
| Upstream timeout | 120s default → 504; day-scale `retry-after` truncated to a ≤60s small response so rotation never stalls |
| Proxy state singleton | a `globalThis` singleton: CLI invocations and every aiti-agent session reuse the same running proxies instead of leaking one port per session |

## 3. Model aggregation (combo virtual models)

Create a custom provider with `"combo": true` and a `combo.members` list (optional `weight`,
default 10) — several real models become **one virtual model**, and the proxy provides:

- **Sticky sessions**: same member within an idle TTL (maximises upstream prompt-cache hits)
- **429-cooldown failover**, weight-based member selection
- **Vision-aware routing** (`types`, v0.4.4): members may declare `["text"]` / `["vision"]` /
  `["other"]` service classes (unset = serves everything); a `["vision"]` member is
  vision-dedicated — image requests route to it, plain-text never hits it (requires the model to
  declare `image` input); request-class sniffing covers openai (`image_url`/`input_audio`),
  anthropic (`image`/`document`) and google (`inline_data`/`file_data`); mixed image+media
  requests are served only by untyped (catch-all) members

## 4. Quality monitoring & three-stage timeouts

| Stage | Budget | Behaviour |
|---|---|---|
| TTFB | 90s | rotate to the next key/member on timeout |
| Stream idle | 45s | kills stalled SSE streams — the root cause of sessions hanging for tens of minutes |
| Total | 15min | hard cap per client request |
| **Pool deadline** | 300s | wall-clock budget across ALL retries/member switches — free pools serially TTFB-timing out used to burn 6×90s≈11.5min client-side; now cut with a structured 504 |

Any timeout **halves that member's weight** (frozen via the usual error cooldown) until its next
real success; persistently slow members (median TTFB of last 8 requests >30s) are skipped
immediately even while sticky; any ≥400 response expires the sticky pointer.

## aiti-agent integration

The 🧙 model wizard visually edits the multi-key pools and combo models declared here (the
"Model aggregation" tab, sticky rotation config); 📡 model check shows combo member composition
and rate-limit status — multi-key / multi-provider orchestration without hand-writing
`models.json`. i18n (v0.4.3): proxy logs, structured errors and `/combo` output are localised
(`PMC_LANG` > `PMC_LOCALE` > POSIX chain; native Windows sets none of LANG/LC_* so the OS region
is probed there); protocol anchors (`error.type`, the `[quota exceeded: …]` marker) stay
untranslated by design.

## Install

```sh
pi install npm:@aiti-ai/pi-models-combo
# aiti source repo: deploy-all --only combo (install-plugin.mjs handles the pi-web bundled copy)
```
