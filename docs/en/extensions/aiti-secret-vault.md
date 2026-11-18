---
title: aiti-secret-vault (vault management UI)
icon: 🔑
description: pi-web management dialog for the encrypted secret vault — list/add/rotate/reveal/remove aliases, lock/unlock, switch between keyfile and OS-keychain unlock, and inspect which aliases are mounted per session. Values travel browser → local pi-web server → encrypted vault, never through the AI conversation.
---

# aiti-secret-vault (vault management UI)

> ❝ **Manage the vault in the browser; the AI only gets tokens.** ❞

The pi-web management surface for `@aiti-ai/pi-secret-vault` (toolbar key icon → dialog).

## Dialog

**Vault tab**

- Entry table: alias, scope (global/project), description, tags, version, last use (**zero values**)
- Add / rotate with a write-only value field (browser → local server → encrypted vault, never logged)
- Reveal: display + copy in this browser only (`cache-control: no-store`)
- Delete: two-step confirmation; mounted tokens become invalid (guarded)
- Lock/unlock; **unlock-mode switch**: keyfile ↔ OS keychain (regenerates the master key and re-encrypts the whole vault, with confirmation)

**Sessions tab**

- Zero-value session records written by the pi extension: session id, cwd, landing mode, mounted alias names
- Answers "which session holds which alias" without exposing any value

## API (same-origin, behind pi-web auth)

```text
GET    /api/extensions/aiti-secret-vault/status
GET    /api/extensions/aiti-secret-vault/entries
POST   /api/extensions/aiti-secret-vault/entries            {alias,value,desc?,tags?,project?}
DELETE /api/extensions/aiti-secret-vault/entries/:alias
POST   /api/extensions/aiti-secret-vault/entries/:alias/reveal
POST   /api/extensions/aiti-secret-vault/lock | /unlock
POST   /api/extensions/aiti-secret-vault/mode               {mode:"keyfile"|"keychain"}
GET    /api/extensions/aiti-secret-vault/sessions
```

All responses are `no-store`; values never enter server logs or the AI context.

## Dependencies

Server dependency `@aiti-ai/secret-vault-core` resolves from the aiti-extman-managed shared `node_modules`. The dialog follows the aiti-float contract; the 🤖 / 🔧 buttons are injected by the host.
