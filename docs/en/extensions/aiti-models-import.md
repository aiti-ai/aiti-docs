---
title: aiti-models-import
icon: 📥
description: Imports models config from other agents — scans codex/ZCode/OpenCode provider·model configs into drafts, with a first-launch dialog guiding a one-time import; persistence always goes through aiti-model-wizard saveBatch (undoable in one step), never writes models.json directly
---

# aiti-models-import · Models Config Import

> ❝ **Don't copy the config — just move in.** ❞

Scans the provider·model configs of other coding agents on this machine into drafts; a first-launch dialog guides a one-time import into pi's models.json. Key plaintext never leaves the server, changes are detected via source-level fingerprints, and saving always goes through the 🧙 aiti-model-wizard chain.

## Source adapters

- **codex**: `~/.codex/config.toml` (parsed with smol-toml) — `[model_providers.*]` → wire_api mapping (chat→openai-completions / responses→openai-responses); top-level `model+model_provider` becomes the default model; auth.json OAuth is not imported, keys go through `apiKeyEnv` + a warning
- **zcode**: top-level provider sections of `~/.zcode/v2/config.json` — strips the `builtin:` prefix, excludes `*-start-plan` channels entirely, filters coding-plan-cache by plan authorization; keys are encrypted in the desktop credentials.json → drafts carry no key
- **opencode**: multi-file merge of `~/.config/opencode/opencode.json` + `auth.json` (api key); the npm SDK package name maps to the protocol, and when models is empty a skeleton is imported + a hint
- **Non-importable, grayed out**: cursor (login state encrypted), qoder (credentials WASM-encrypted) — the reason is honestly labeled

## Mechanism

- **Auto-pops on first launch**: `GET /status` (only checks file existence, zero polling) decides firstRun, and the dialog pops only when a usable source exists; once dismissed or imported, it never pops again
- **`GET /scan`**: scan each source → normalize → source-level sha256 fingerprint (key plaintext stripped, with hasKey semantics) → state machine `available-new / changed / unchanged / source-gone` + merge/overwrite conflict detection; drafts are output key-stripped (keyHint shows only the last 4 characters), and the model list carries preview metadata (context/output/reasoning/new|existing)
- **`POST /import`**: dedupe selections → **fresh re-scan** per source (not the /scan cache) → `keepKey:true` (existing keys of same-named providers are not cleared) → persisted via the `aiti-model-wizard.saveBatch` service → per-item results backfill the markers (failed items don't get marked; total failure doesn't count as done, and the first-launch dialog pops again)
- Stores `<stateDir>/import-state.json` (0600 atomic write); on successful import broadcasts `pi-web:models-changed` so the model selector refreshes immediately

## Dependencies

- Hard dependency `aiti-model-wizard.saveBatch` (stashUndo before the batch rolls the whole batch back in one step / when absent, `/import` returns 503 prompting a wizard upgrade); soft dependency aiti-quickstart (the onboarding card probes the `aiti-models-import.open` service to open this dialog with zero re-implementation)
- npm `smol-toml` is installed into the shared root via extman reconcile; when missing, the codex adapter degrades without crashing

## Sources

Planned M2 sources (openclaw / claude archives etc.) not implemented.
