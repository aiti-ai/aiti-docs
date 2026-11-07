---
title: Agent Management UI (aiti-agent-manager)
icon: 🤖
description: Unified aggregation of external agent login states + login action proxying + multi-account profiles (backup/alias/one-click switch) + account quota display — implements no login protocol at all
---

# aiti-agent-manager

> ❝ **Six agents' login states on one screen; multi-account rotation, one-click switch.** ❞

A unified agent management surface: the toolbar 🤖 opens a panel that aggregates each external agent's login state, account profiles (multi-account backup/switch/logout) and account quotas on one screen.
**Implements no login protocol, never touches credential contents** (forwards existing `/login/*`; account profiles only take file-level snapshots, never parse tokens).

**Dynamic discovery (the six agents are not hard-coded)**: each agent extension self-reports at startup via `ctx.services.provide("<extId>.agent", descriptor)`
(label/modes/fs probe table/credential slots/login actions/quota toggles); the manager collects them dynamically by walking the host extension list.
Integration contract (new-agent checklist + current status/TODO) → **`docs/dev-repo-agent-account-contract.md`**.

## Panel Capabilities

| Capability | Description |
|---|---|
| Login-state aggregation | Badges ✅/⚠/❓/🔄; CLI accounts (user/uin/validity); smart endpoints first, fs probing as fallback |
| Login actions | Inline "login / cancel / paste code / API Key / browser OAuth", proxied to each agent extension's existing endpoints |
| **Multi-account profiles** | The "current login" row's "save as account profile…" dialog creates an alias; the saved-profile list supports **one-click switch** / delete; `_auto-before-*` safety profiles are auto-saved before login/switch/logout |
| **Account quota** | Supported agents show a quota chip on the account row (click to force refresh; tooltip with per-bundle breakdown) |
| Logout | Available for every agent (clears local credential files; auto safety save first) |

Account profile storage: `<agent-mgr configDir>/agent-accounts.json` (single file, 0600; aiti-configs encrypts it during backup via `**/agent-accounts.json`).

## Quota Status (2026-09-13)

| Agent | Display | Data source |
|---|---|---|
| CodeBuddy | `quota x / y credits` | Official usercenter billing (CLI OAuth) |
| Qoder | `quota remaining x credits` (+ plan/bundles) | WASM credentials → OpenAPI quota/usage |
| Cursor | `quota remaining x%` (auto/api bundles) | Cursor Dashboard `GetCurrentPeriodUsage` |
| ZCode | `plan: <channel> available` | Local coding-plan cache (no numeric quota API) |
| Claude / Codex | Shown after login (implemented, pending real-machine calibration) | Anthropic OAuth usage / ChatGPT wham usage |

## Endpoints

- `GET /agents` (alias `/login-status`) → aggregated list: `{agents:[{agent,label,modes,installed,authState,flowState,authSource,dependencyHint,ext?,tui?,accounts,hasContent,quota?}], piHost:[…]}`
- `POST /ctl/{agent}/start|cancel|submit` → standard controlled-login actions; non-standard actions are mapped by each descriptor.actions (e.g. codebuddy's `tui-*`/`set-key`)
- `GET /accounts` · `POST /accounts/{agent}/{save|switch|remove|logout} {alias?}` → account profiles
- `GET /quota/{agent}?force=1` → quota proxy (only agents declared via descriptor.accountQuota are queryable)

Cross-extension calls go through the host registry's in-process `api()` — no HTTP loops, no new cross-extension globals.

## Boundaries

- The fs probe criterion is "credentials on disk / env present", which is not equivalent to "token still valid" — the final word is each CLI's own.
- Quota only works for official login channels (API Key / third-party gateway profiles don't apply, shown as "unavailable"); the quota API needs network access and auto-backs-off 10s on failure.
- Switching accounts only affects sessions created/rebuilt afterwards; running sessions keep the original account.
- pi host subscription providers are listed read-only alongside (`piHost` section: auth.json fields, tokens never leave the server).
