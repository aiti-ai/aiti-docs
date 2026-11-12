---
title: aiti-session-cards
icon: 💬
description: Session request card extension — full UI for interaction-primitive cards (zcode plan approval / AskUser / omp OAuth / generic fallback) and tool authorization cards, migrated out of pi-web core (agent capability UI de-coring P1)
---

# aiti-session-cards · Session Request Cards

> ❝ **The cards where an agent begs you for an answer — what they look like is the extension's call.** ❞

Product of the agent-capability-UI de-coring P1 migration (~630 lines of components moved out of pi-web core): the host keeps the `sessionRequestCard` slot (the single seam for the request-answer form) + a minimal fallback card (capabilities never run bare), while the full card UI belongs to this extension.

## Request Card Family

- **`interaction:plan_approval`** (zcode ExitPlanMode adapter): full plan rendered as MiniMarkdown + approve / reject / send revision feedback (feedback goes back to the agent via respond message to keep refining the plan)
- **`interaction:ask_user`** (zcode AskUserQuestion adapter): multi-question option buttons (single/multi select, submit only after all answered) + skip/submit + optional extra notes
- **`interaction:tool_auth`** (CC-family can_use_tool fallback form): plain-language summary (keys like reason/command/path normalized) + deny/allow
- **`interaction:open_url`** (omp login adapter): one-way login authorization card — open login page / copy link (local short link first, guarding against long-URL truncation) / close; the agent detects authorization completion and auto-continues
- **`interaction:generic`**: free-form fallback (prompt + input summary + accept/reject)
- **`permission`** (backend permission_request from cursor/claude etc.): structured rendering = single-line summary + `<details>` collapsible full args; the button set comes from the host-passed `options` (ACP optionId protocol semantics passed through, e.g. "always allow"); without options falls back to allow/deny
- Red line: cards with empty bodies must not run bare — plan/tool_auth/generic lacking a body always fall back to the input summary + default answer buttons

## Contract

- The host filters by `meta.kinds ∋ request.kind`, highest priority wins; a miss lands on the core minimal fallback card (≤40 lines per family, sessions never hang)
- extra: `SessionRequestPayload` (kind/capability/prompt/plan/questions/options/captchaConfig…) + `respond(answer) => Promise<boolean>`; the `provider_headers` captcha card doesn't belong to this extension — "whose capability renders it" — it belongs to the aiti-zcode-agent client; aiti-provider-usage takes over the usage badge
- **Float contract**: cards carry the full `data-ext-float` family (draggable/bring-to-front/position persistence); centered styling as fallback when aiti-float isn't installed
- Ships its own MiniMarkdown (React-escaped, zero `dangerouslySetInnerHTML`, guards against agent injection); host-shim redirects react to the host's rendering primitives, the bundle has zero React references

## Feature Switch

`sessionCards.enabled` (on by default) turned off → the host core's minimal fallback card takes over (accept/reject still possible). Old hosts without this slot → registerItems try/catch degrades gracefully, no throw, no white screen.

## Provenance

Migrated out 2026-09-16 (implemented). Future agent capabilities like task are barred from the core — all go through the extension channel.
