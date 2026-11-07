---
title: aiti-mail
icon: ✉️
description: The general "mail sending outlet" inside pi-web — zero-dependency SMTP client + send log (node:sqlite) + management dialog (config/test/log)
---

# aiti-mail

> ❝ **Configure SMTP once, and any extension and AI inside pi-web can send mail.** ❝

The general mail-sending outlet inside pi-web. The first consumer is ⏰ scheduling (task-result mail delivery in `aiti-ai-schedule` v0.4.0).

- Full design: `aiti-work/docs/aiti-ai-schedule-integration-plan.md` §4.6

## Capability overview

| Capability | Description |
|---|---|
| SMTP client | Zero dependencies (`net`/`tls`): 465 implicit TLS / 587·25 with automatic STARTTLS upgrade / `noStarttls` plaintext direct mode (port 25 internal relays, default off); AUTH PLAIN preferred with LOGIN fallback; 25s timeout throughout; no auto-retry |
| MIME | UTF-8 body (base64 wrapped at 76); subject as RFC 2047 encoded-word; `Date`/`Message-ID`/`From`/`To` headers; dot-stuffing in the DATA phase |
| Send log | `node:sqlite` (`<extRoot>/cache/mails.db`, WAL): time/recipient/subject/status/duration/source; 90-day retention with automatic cleanup |
| Management dialog | Toolbar ✉ → two tabs (config [SMTP form + send test] / send log table); `data-ext-float` floating-dialog contract |

## API (registerHttpRoute, same-origin calls)

| Endpoint | Description |
|---|---|
| `GET /config` | Current config (**`pass` is never echoed back, only `hasPass`**) |
| `POST /config` | Save (`pass` omitted = keep the old value; file 0600) |
| `POST /test` | `{to}` sends a test mail (source=test) |
| `POST /send` | `{to, subject, body, source?}`; `to` separated by commas/full-width commas, sent one by one and logged per item; returns `{ok, error?, results:[{to,status,messageId?,durationMs,error?}]}` (on partial failure the top level is ok:false with "n/m recipients failed to send") |
| `GET /log` | Send log (default last 50 in reverse order, filterable by status) |

## AI help point (M3)

`ai: { manage: true, skills: "skills" }` — `skills/mail-setup/SKILL.md`: teaches AI to help the user configure SMTP, call `/send`, and check `/log` (visible via the 🤖 at the dialog's top right).

## Security

- The SMTP password is stored only in `dataDir/config.json` (0600); the API never echoes plaintext.
- Covered by the aiti-configs encrypted sync surface (`encrypt.patterns`: `web/data/aiti-mail/*.json`, aes-256-gcm ciphertext goes into the repo and can be backed up); `mails.db` is caught by the `**/*.db` exclusion rule and stays out of the repo.
- Known trade-off: TLS does not validate the certificate chain (`rejectUnauthorized:false`, the lenient tier for self-hosted scenarios).

## Gating and deployment

No feature switch; the toolbar button appears as soon as it is registered. `node tools/deploy.mjs` deploys to both instances.
