---
title: dsh-secret-mask (paste-safe by default, for DSH)
icon: 🥷
description: Session-level secret redaction for DeepSeek Harness (DSH) — values pasted into messages become stable [REDACTED:*] placeholders before a step enters the model, and placeholders echoed back inside whitelisted tool arguments are restored to the real values before the tool executes. Detection engine shared verbatim with the pi edition
---

# dsh-secret-mask (paste-safe by default, for DSH)

> ❝ **Paste freely — nothing leaks, on any harness.** ❞

**Session-level secret redaction** for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) — the sister edition of [pi-secret-mask](/en/extensions/pi-secret-mask.md); the detection engine is shared verbatim via `@aiti-ai/secret-mask-core`:

```text
you:          my api key is sk-ant-api03-<80 chars> — put it into .env under ANTHROPIC_KEY
model sees:   my api key is [REDACTED:ANTHROPIC_KEY#a1b2c3d4] — put it into .env ...
bash tool:    ANTHROPIC_KEY=sk-ant-api03-<80 chars>   ← restored inside the shadow wrapper at execution time
session log:  placeholders persisted (pre-step replacements are durable — unlike pi, see below)
```

## How it works (five hook layers)

| Stage | Hook | Behaviour |
|---|---|---|
| Send boundary | `agent/pre-step` | Redacts every text block of the claimed `UserMessage[]` batch (followup / steering / injected context all arrive here); high-confidence rules auto-register new secrets from **user-authored text only**. Replacements are **durable**: the session log stores placeholders |
| Agreement | `systemPrompt.section` | A `secret_masking` section (rendered only when the session holds registered values): placeholders are opaque, copy them verbatim, never guess |
| Execution | shadow tools | `bash` / `write` / `edit` / `str_replace_editor` are re-registered in the agent scope with wrapped `execute`: placeholders restored into a deep clone of the arguments; the frozen pipeline arguments and the model-visible call record keep placeholders |
| Tool output | `tools/post-execute` | Replaces the canonical `value` first (schema-revalidated, fail-closed), falling back to rendered `content` text blocks |
| Proof layer | `llm/stream` | With `/secret audit on`: scans the **final outgoing payload** (conversation plus compaction/title auxiliary calls) — `leaks=0 + placeholders>0` is direct evidence; any raw value raises an immediate `secret-mask LEAK` alarm. Evidence: `~/.dsh/secret-mask-audit.log` (0600, never contains raw values) |

## Commands

`/secret add <value> [as <alias>]` (**`recordInput: false` — the value never reaches the model nor the session log**), `list`, `remove`, `clear`, `on`/`off`, `status`, `save`/`unload` (persist per workspace to `~/.dsh/secret-mask.json`, 0600, opt-in), `audit on|off|show`.

## Ecosystem fit

- The official `@deepseek-ai/dsh-client-ui-secret-mask` masks the **browser display only** (model input keeps the raw characters); this plugin works at the **model boundary** — complementary, safe to run together.
- Community `dsh-redact` covers tool-output tokenization only; this plugin adds user-input redaction, placeholder restore and the audit layer. Hook chains compose (waterfall; disjoint token formats).

## Install

```sh
dsh plugin --profile web add @aiti-ai/dsh-secret-mask
```

Works across web / headless / acp profiles. Known difference vs pi: pre-step replacements are durable in DSH, so the local session log stores placeholders rather than originals. Engine details: [secret-mask-core](/en/extensions/secret-mask-core.md).
