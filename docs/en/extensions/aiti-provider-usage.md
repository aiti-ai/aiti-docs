---
title: aiti-provider-usage
icon: 📶
description: Provider balance/quota lookup — 16 adapter ids (DeepSeek/OpenRouter/Z.AI/OpenCode Go/Kimi/Codex/Copilot etc.), session info panel "remaining quota" section with the current session pinned on top, 5min TTL overview + manual refresh, event-driven zero polling
---

# aiti-provider-usage

> ❝ **How much quota each provider has left, all on one panel.** ❞

Provider balance/quota lookup extension (pi-web defork B1 migration product): an adapter registry system + the session info panel's "remaining quota" section.

## Capabilities

- **16 adapter ids**: DeepSeek / OpenRouter / Z.AI(+CN) / OpenCode Go / Kimi Coding / OpenAI Codex / GitHub Copilot / Baseten / MiniMax(+CN) / Moonshot(+CN) / Vercel AI Gateway / SiliconFlow(+CN) — declarative JSON adapters add one provider per line; complex window protocols (Z.AI quota window, OpenCode rate-limit state) get standalone adapters
- **sessionInfoPanel slot**: the whole balance section of the session info panel, current-session provider pinned at top expanded; severity-graded progress bars + window state (rate-limited/exhausted) + reset countdown
- **Overview aggregation**: 5min TTL in-process cache, concurrency 3, allSettled so one provider's failure doesn't drag the rest; manual refresh forces through
- **Multi-key rotation pool** (2026-09-18): when a provider carries `apiKeys[]` (≥2 enabled entries), pi-models-combo installs a local proxy and registers with a per-session dummy token — quota lookups instead read models.json's real key pool and query key by key, windows annotated per key (`Rolling · key-1`), single-key failures degrade to notes; keys with `enabled:false` are skipped
- **OpenCode only recognizes Go**: `/zen/go/v1/usage` is the only usage endpoint OpenCode exposes to API keys (Go plan window); Zen's pay-per-use balance has **no API** (web console only, requires a logged-in session), so `opencode` / `opencode-zen` are not registered (no rows shown, and the Go window is not filed under Zen)
- **Zero-config auth**: the host loader aliases `@earendil-works/*` to the host node_modules; ModelRuntime.getAuth shares the same source as core
- **Feature switch**: `providerUsage.enabled` off → instant fall-back (upstream-identical shape = no balance section in the info panel)

## API (host-gated dispatch)

- `POST /api/extensions/aiti-provider-usage/overview` `{force?}` → overview of all providers
- `POST /api/extensions/aiti-provider-usage/query` `{providerId}` → single-provider detail report
- **`ctx.services` service outlet**: `provide "aiti-provider-usage.overview"` — three methods `overview(force?) / query(providerId) / invalidate()`, reusing the same TTL cache/concurrency gate and adding no new upstream request surface (consumers like model-wizard's balance health bar); silently absent when the bus is missing, REST as fallback

## Provenance

Migrated out of the pi-web fork's `lib/provider-usage/*` (landed 2026-09-13); the core side was restored to upstream v0.9.1's original shape (`pi-web-defork-batch-2026-09-plan.md` §2).
