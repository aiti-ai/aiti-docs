---
title: pi-secret-mask (paste-safe by default)
icon: 🎭
description: Session-level secret redaction for pi — values pasted into prompts (API keys, tokens, credentials) become stable [REDACTED:*] placeholders before the model sees them, and placeholders echoed back inside tool arguments are restored to the real values before the tool executes. Zero dependencies; one install covers the TUI and every pi-web session
---

# pi-secret-mask (paste-safe by default)

> ❝ **Paste freely — nothing leaks.** ❞

**Session-level secret redaction** for pi — paste-safe by default:

```text
you:          my api key is sk-ant-api03-<80 chars> — put it into .env under ANTHROPIC_KEY
model sees:   my api key is [REDACTED:ANTHROPIC_KEY#a1b2c3d4] — put it into .env ...
write tool:   ANTHROPIC_KEY=sk-ant-api03-<80 chars>   ← restored at execution time
session file: the original text (the context hook is non-destructive)
```

## How it works (five hook stages)

| Stage | Hook | Behaviour |
|---|---|---|
| Send boundary | `context` | Redacts all roles (user, assistant text, tool results, `!` bash command/output, compaction summaries); high-confidence rules auto-register new secrets from **user-authored text only**; the hook gets a deep copy — the session transcript keeps the original |
| Agreement | `before_agent_start` | Injects a `secret_masking` prompt section: placeholders are opaque, copy them verbatim into tool arguments, never guess the value |
| Return boundary | `tool_call` | Restores placeholders inside tool arguments **in place** (pi reads the fields off the event object); bash is included by design — the primary use case is "use this key in a command" |
| Tool output | `tool_result` | Redacts registered values from tool output before it re-enters the context and the session record (so `cat .env` does not re-leak) |
| Proof layer | `before_provider_request` | With `/secret audit on`: scans the **final wire payload** (provider-serialized, right before HTTP) — `leaks=0 + placeholders>0` per send is direct evidence that only placeholders went out; any raw value raises an immediate alarm. Independent of the redaction pass |

## Commands

| Command | Effect |
|---|---|
| `/secret add <value> [as <alias>]` | Register a value (interactive input when omitted); the alias makes the placeholder readable |
| `/secret list` | Registered values with masked previews (`…****abcd`), source and rule id |
| `/secret remove <alias\|label>` / `clear` | Unregister one / all |
| `/secret on` / `off` | Toggle redaction for this session |
| `/secret status` | State summary (incl. audit state and last audit result) |
| `/secret save` / `unload` | Persist values per project to `~/.pi/agent/secret-mask.json` (0600, opt-in) / drop them |
| `/secret audit on\|off` / `show` | Per-send wire-payload proof log (toggle / show latest evidence) |

## Detection rules

Deterministic regex + checksum rules, **no network, no model calls**: AWS, GitHub, GitLab, Slack
(tokens + webhooks), Stripe live, SendGrid, Twilio, Google API/OAuth, Anthropic, OpenAI, Hugging
Face, npm, PyPI, Azure storage, JWT (alg-header validated), PEM private keys (complete +
truncated), DB URLs with real passwords, `Authorization` header values, generic `key = "value"`
assignments guarded by Shannon-entropy thresholds and code-identifier/template/URL exclusion;
Base64-wrapped prefix tokens are decoded and caught whole; values shorter than 6 characters are
ignored (noise guard).

**CJK keywords** (v0.1.x): the generic-assignment keyword table includes `密码 / 密钥 / 秘钥 / 口令 /
令牌 / 授权码 / 授权密钥 / 访问令牌 / 访问密钥 / 凭证 / 凭据 / 私钥`; assignment separators accept the
fullwidth colon (`密码：xxx`); latin–CJK adjacency (`API密钥`) and pure-CJK prefixes (`数据库密码`)
both count as word boundaries. Known trade-off: bare (unquoted) pure-CJK phrase values need ~8
distinct characters to pass the entropy floor (3.0 bits/char) — quoted forms are reliable, or use
`/secret add`.

False positives are guarded three ways: the `plausibleSecret` exclusion set (template slots,
`${VAR}`, paths, URLs, `process.env.*`, filler like `example`/`changeme`), entropy floors
(≥2.0 quoted / ≥3.0 bare bits-per-char), and code-identifier / member-chain exclusion
(`Uint8Array` is not a value). Rule shapes follow the public gitleaks / GitHub secret-scanning
corpus (as implemented by the MIT-licensed claude-code-redact project); `tools/fp-corpus.mjs`
reuses its 11 pinned public repositories (42k+ files) for false-positive measurement.

## Placeholder formats

- Manual entry with alias: `[REDACTED:github-token]` — the alias is the semantics
- Auto-detected: `[REDACTED:GITHUB_TOKEN#a1b2c3d4]` — hash = fnv1a(sessionSalt + value);
  **stable within a session** (same value → same placeholder, cache-friendly), meaningless across
  sessions

## Install

```sh
pi install npm:@aiti-ai/pi-secret-mask@latest
```

Takes effect in newly started sessions (each TUI/pi-web session spawns a fresh pi process).
aiti-agent (the pi-web workbench) ships it **pre-installed** with auto-provisioning on startup;
standalone pi users get every capability with no dependency on any other aiti component.
