---
title: Model Add Wizard (aiti-model-wizard)
icon: 🧙
description: Guided AI provider/model onboarding — catalog search (models.dev + domestic AI catalog, Chinese/English, paste an API URL to reverse-search) → enter token → test (both 2xx/429 count as pass) → pick/type a model → write models.json; on miss, baseUrl reverse matching (auto-extracts URLs from any doc/code snippet) or auto detection (fills missing v1/v2, pulls the model list with a key + OpenAPI/model-prefix brand signals); tokens are masked on every read and never returned to the frontend
---

# aiti-model-wizard

> ❝ **Addresses, tokens, signup pages — keys scattered far and wide, strung into one chain.** ❞

The model-add onboarding wizard extension: **catalog-driven + reverse matching + auto detection**, three steps to add AI providers/models into models.json.

- **Catalog**: full models.dev coverage (191 providers, including 44 domestic) + a built-in **domestic AI catalog** (Chinese names / signup instructions / token pickup URLs / api type / known models, 20+ providers)
- **Download**: **justget multi-source racing** (official models.dev + **Gitee mirror** `justdb-mirrors/downloads/raw/master/models-dev/api.json`; whoever is faster wins, auto-switch on failure); cached 7 days, refreshable with one click
- **Search**: Chinese/English/alias/model-id full matching → returns api URL / signup instructions / token pickup URL / docs / known models
- **Credentials**: enter token → **test connection (both 2xx and 429 count as pass**; 429 = correct key/endpoint, just rate-limited) → pick/type model → write models.json
- **Fallback**: catalog miss → paste a baseUrl for **reverse matching** (normalized, /v1 /v2 stripped, then host+path compared) → still a miss, **auto-detect** api type + real address (missing /v1 /v2 /v1beta auto-filled); **pasting an API URL straight into the search box also reverse-hits** (with a "🔁 URL reverse hit" badge; opening it auto-detects and keeps the original plan URL)
- **Zero-friction input**: the reverse/detect input accepts arbitrary text/code snippets/docs (e.g. `base_url='https://…'` in an SDK example), auto-extracting every URL and exhaustively matching + detecting each one
- **Brand recognition**: after a detection hit, three signal layers (OpenAPI `info.title` declaration > model-id prefix > catalog URL match) reveal the real brand name; with a key it also pulls the /models list so models can be ticked directly
- **Security**: tokens are **write-only** — every read is masked (`sk-***abcd`); leaving the edit field empty = keep the original key
- **apiKey in three forms**: literal / env var name (all caps) / `!shell command` (takes stdout) — resolved uniformly for test connection, detection and model fetching; models.json stores the raw value and pi resolves it at runtime
- **Six-source metadata backfill**: configured entries → built-in catalog → vendor /models rich fields → models.dev → OpenRouter/LiteLLM fallback → **cross-provider same-id corroboration** (when this catalog lacks a new model, borrow same-id/naming-variant entries from other gateways; fields take the consensus majority; cost is carried only when all agree); the save feedback shows per-field sources "🪄 auto backfill: …"
- **maxTokens probe calibration (probe-cap)**: every newly saved model gets a minimal probe verifying its output cap; inflated values rejected by parse errors are auto-lowered and written back (ark-coding glm correction table); model rows show ⏳/✓↓/! badges
- **Three-tier temporary disable (2026-09)**: provider `/enable`, model `/model-enable`, key `enabled` — three levels with disable/enable buttons in the wizard UI; core passes through/syncs (apiKey switches to the first enabled key; combo saves preserve member disabled state, all-disabled is rejected). Integrates with pi-models-combo (provider level: no proxy built; key level: not in rotation; model level: hidden / skipped as combo member)
- **Event-driven status panel**: the "combo/multi-key running status" banner takes its data straight from `mc:avail` frames ([aiti-model-check](aiti-model-check.md)), no background pulling; `/proxy-status` additionally reports unbuilt combos (member-resolution probing: slots resolvable = lazy-built pending activation; 0 slots = configError, flagged for repair)
- **Member content roles (types, 2026-09)**: combo members get checkable content roles derived from **model capability** (text always checked; vision appears only when the model's input includes image — **capabilities a model lacks are not shown and cannot be checked**; all available ones checked by default = accept everything, equivalent to unrestricted) — unchecking "vision" = the member only takes plain-text requests, image requests route around it automatically; **vision-only members** (vision checked only) take only image requests, plain-text requests are never sent to them. Checkable per member in the "🧩 model combo" editor, or write `types: ["vision"]` etc. via the `model_wizard_combo_save` tool (other media categories — audio/video/PDF — don't appear in the UI but hand-written config/tool input still supports them). The engine classifies request content (openai/anthropic/google three protocols) and routes accordingly
- **Multi-key even-spacing throttle (minIntervalMs, carried since v0.4)**: besides the rpm cap, each key has an "interval ms" input — empty = auto (60000÷rpm even pacing), 0 = off (burst sliding window instead), a number = fixed interval in ms; effective together with rpm, the larger wait wins. Same UI in the add/edit flow key rows and the `aiti_model_wizard_keys` tool; the "combo/multi-key running status" panel labels them "interval auto / interval 2s", upstream retry-after shown transparently (capped⚠ = truncated by the internal cap)
- **Sanitized import/export**: `GET /export` + `POST /import` (diff preview/apply); add-flow search merges in pi built-in providers (providers missing from the native catalog can be completed too); the 🧙 left nav embeds a "Model Check" tab (direct access to the [aiti-model-check](aiti-model-check.md) panel)
- **UI normalization + code splitting**: feature-menu icons unified to lucide SVG; thin-shell entry 11.5K + heavy chunk 524K loaded on demand ([lazy loading contract](/en/guide/ext-lazy-loading.html) route B)
- **One-level undo**: snapshots the affected providers' old entries before save/delete; "↩ undo last save" rolls back in one click (subscription-login types exempt)
- **One-click checkup + test retention (2026-09-17)**: the tree's "🩺 one-click checkup" sends real probes serially to every configured provider (skips combos/disabled/no-credentials; the first enabled model serves as chat probe — listed ≠ inferable), the report card shows HTTP status/latency/details per provider, failed rows have a "go fix" jump straight to details; all manual tests (add flow/edit flow/details "retest"/checkup) persist verdicts in `cache/last-test.json` (keys masked), tree badges show the latest verdict + latency (yields to model-check when it has probe aggregation, no duplication), details health bar "🩺 pass · 428ms [retest]"; the `/test` timeout is adjustable in settings
- **Subscription logout (2026-09-17)**: the "logout" button on a logged-in card in the subscription page (danger confirmation) → the server forwards to host `/api/auth/logout/<pid>` to clear auth.json credentials + invalidate the model cache; all models become unavailable immediately and are recoverable by re-login; same entry inside the login panel
- **Balance health bar (2026-09-17)**: the provider-details health bar shows balance — consumes the `aiti-provider-usage.overview` **ctx.services** service added by [aiti-provider-usage](aiti-provider-usage.md) (TTL 5min/concurrency 3 are its responsibility, the wizard doesn't pull upstream itself; silently degrades when absent), currency/percent/count bucket short labels + full bucket breakdown in the title tooltip + "recheck" force refresh; falls back to the aiti-model-check balance copy when provider-usage isn't installed
- **Settings panel (2026-09-17)**: the header ⚙ opens `/config` with three visualized groups — new-model reminders (switch/scan interval/fetch timeout/daily cap/toast interval and duration), catalog (primary source/mirror URL/TTL/refresh now), probe & test (test timeout/probe timeout/probe maxTokens); saving takes effect immediately (reminder scan timer idempotently rebuilt); `/config` was promoted from "the only UI-less API" to a first-class page
- **Params view/edit dialog**: the 👁 anywhere opens it — display name/capability toggles/contextWindow/maxTokens/four cost fields/seven-level thinkingLevelMap/DeepSeek thinking compatibility/developer role/model-level headers/API overrides; key-only entries and OAuth·catalog-type providers can be viewed too (the latter read-only + a "catalog backfill" badge)
- **Brand icons**: @lobehub/icons imported on demand (subscription services/catalog browsing/recommendation cards/configured cards), falls back to an initial-letter tile on miss

## agent tools

```
aiti_model_wizard_status    # configured providers (tokens masked)
aiti_model_wizard_search    # search providers (Chinese/English), returns api URL/signup instructions/token pickup URL
aiti_model_wizard_provider  # provider details (incl. known models)
aiti_model_wizard_detect    # baseUrl → auto-detect api type + real address (fills missing v1/v2)
aiti_model_wizard_test      # test connection (both 2xx/429 count as pass)
aiti_model_wizard_save      # save provider+models to models.json (supports keys[] multi-key / provider-level headers; combo groups are rejected, use combo_save)
aiti_model_wizard_delete    # delete provider
aiti_model_wizard_keys      # multi-key management (list/set/remove; syncs apiKey = first key)
aiti_model_wizard_combo_save # create/update model combo groups (members can carry weight + types content roles)
```

## New APIs (2026-09-17)

- `GET /last-test` → each provider's latest wizard test verdict `{ ts, providers: { <p>: { ts, pass, partial?, rateLimited, status, latencyMs, detail, keyName, masked, model } } }` (tree badges/details health bar)
- `POST /checkup` → one-click checkup: serial probes to all configured providers (skips combos/disabled/no-credentials), writes last-test per provider, returns `{ ok, total, pass, rateLimited, fail, skip, results[] }` (globalThis single-flight, 409 while running)
- `POST /oauth-logout {provider}` → subscription logout: forwards to host `/api/auth/logout/<pid>` (host clears auth.json + invalidateModelsCache; not-logged-in/unknown provider returns the host error)
- `GET /usage?provider=X&force=1` → balance: soft-depends on the `aiti-provider-usage.overview` service, `{ ok, available, capturedAt?, entry? }`; `available:false` = provider-usage not installed (UI degrades)

## 🧙 Panel

- **Add**: search → provider details (api/signup/token pickup/known models) → enter token & test → tick models → save
- **Custom**: paste baseUrl / doc snippet / code example → reverse-match candidates / auto-detect (brand + model list + one-click backfill) → same credentials/test/model-pick/save
- **Configured**: list (tokens masked) → change token (leave empty to keep) / delete
- **New-model detection & reminders**: background scans (startup +3s and every 30min, pulls /models for providers with keys, 8s timeout fails silently) store two snapshots (`dataDir/reminder.json`: `prev` = previous-day baseline, `curr` = today's availability); **new models = (today − previous day) − configured**, prev auto-advances across days, first run only builds the baseline without reminding. When additions are found: ① a 10s green toast at the top of the page (**click → opens the wizard's "Configured" page**) ② provider cards show a "✨ +N new" badge ③ the edit flow's "refresh available models" auto **pre-checks** new models (with a "new" mark; clicking save enables them in one click)
- Toast rate control (server-side persisted arbitration; quota consumed only by `GET /new-models?toast=1`): ≤ 3 per day, ≥ 2h between adjacent toasts; over the limit it fails silently (badges/pre-checks still work, unaffected)
- Auto top banner guidance when no models exist

## 🧩 Model Combo (combined models)

Combines multiple real models into **one virtual model** exposed to pi (routing taken over by the [pi-models-combo](https://github.com/aiti-ai/pi-models-combo) engine). The "Model Combo" tab: a list of combo-group cards (member composition badges + weight annotations + three-tier temporary disable at combo-group/virtual-model/member level) + the combo editor:

- **Member selection**: search configured provider×model pairs (including runtime-registered providers like freeflow) and click to add; duplicate references deduped; same protocol required within one group, combo groups can't nest as members, contextWindow/maxTokens take the minimum, input takes the union, cost takes the most expensive estimate
- **Weight (weight)**: a weight box per member (default 10) — random selection proportional to weights (member-level semantics, not amplified by multi-key)
- **Content roles (types)**: per-member "roles" chips — **filtered by model capability**: text is always checkable (the base category); **vision appears only when the model supports image input** (undeclared capabilities are neither shown nor checkable — **misconfiguration not allowed**); all available ones checked by default = accept everything (equivalent to omitting the field; future new categories are auto-accepted). Unchecking "vision" = text only (image requests route around it); for a plain-text model the text chip is 🔒 locked after unchecking (no other role left to carry). **Vision-only member**: uncheck the text chip → vision only; image requests auto-route to it, plain-text requests are never sent to it; a text-only member (has vision capability but vision unchecked) → image/media requests avoid it. Other media (audio/video/PDF) don't appear in the UI; hand-written config/tools still support them. The engine classifies by request body content and routes (openai `image_url`/`input_audio`, anthropic `image`/`document`, google `inline_data`/`file_data` mime)
- **Sticky idle TTL** (minutes, default 15): the same session sticks to the same member within the TTL, maximizing prompt cache; 429 cooldown auto-switches
- **Misconfiguration warning tiers**: 🔴 blocking (empty/all-disabled members, cross-protocol, dangling references) 🟡 confirmation (context window gulf, output diff >20%, capability mismatch, **no member carries plain-text requests**) 🟢 notice (no member has vision). The UI filters checkboxes by capability → the checkbox layer can't produce capability mismatches; mismatches in hand-written config (e.g. a non-vision model with types including vision) are defended by engine warnings
- **Save**: writes a `combo:true` virtual provider into models.json (placeholder baseUrl overridden by the engine at runtime); after saving, running proxy slots auto-refresh + model changes broadcast (combo models appear in new-session dropdowns immediately); "↩ undo last save" available
- models.json hand-written example: member references can carry `weight` and `types` (omitted = accept all) — see the pi-models-combo repo README

## New-model Detection API

- `GET /new-models` → `{ ok, scanning, total, providers: { <p>: { count, newModels[] } }, baseline, toast? }` (for badges/overview, doesn't consume toast quota; `baseline=false` means day one only builds the baseline)
- `GET /new-models?toast=1` → same as above + `toast` (`allowed:true` means one quota consumed; `false` carries `reason: gap|daily-limit` and `nextAtMs`)
- `POST /new-models/refresh` → force an immediate background rescan

## Config `config.json` (aiti-model-wizard dataDir)

```jsonc
{
  "modelsPath": "~/.pi/agent/models.json",
  "catalog": {
    "primaryUrl": "https://models.dev/api.json",
    "mirrorUrl": "https://gitee.com/justdb-mirrors/downloads/raw/master/models-dev/api.json",
    "ttlHours": 168
  },
  "download": { "justget": "auto", "timeoutMs": 90000 },
  "probe": { "timeoutMs": 12000, "maxTokens": 8 },
  "reminder": {
    "enabled": true,
    "checkIntervalMs": 1800000,
    "fetchTimeoutMs": 8000,
    "maxPerDay": 3,
    "minGapMs": 7200000,
    "toastMs": 10000
  }
}
```

## Maintenance

- Refresh catalog snapshot + push the Gitee mirror: `node tools/fetch-catalog.mjs --sync-gitee`
- Deploy: `node tools/deploy.mjs` + `POST /api/extensions/reload`
