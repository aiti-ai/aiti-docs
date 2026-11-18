---
title: pi-secret-vault (encrypted secret vault)
icon: 🔐
description: Encrypted, persistent secret vault for pi — /vault add takes the value through masked input, the model only receives stable rsec_<hash8> tokens (vault_list / vault_get), and the runtime substitutes the real value inside tool arguments. The AI is read-only, values are AES-256-GCM at rest (keyfile or OS keychain), and the session JSONL never contains plaintext.
---

# pi-secret-vault (encrypted secret vault)

> ❝ **You own the vault; the AI gets tokens.** ❞

The persistent, encrypted superset of `pi-secret-mask`:

```text
you:       /vault add openai-key        (masked input — the value never enters the chat)
model:     vault_list()                 → openai-key — OpenAI production key (llm)
model:     vault_get("openai-key")      → rsec_a1b2c3d4   (mounted in this session)
model:     bash("curl -H 'Authorization: Bearer rsec_a1b2c3d4' …")
runtime:   substitutes the real value at tool-execution time
```

## Why a vault

- Tokens are derived from the alias (`fnv1a("vault:"+alias)`) → after a restart, `/vault unlock` + `vault_get` revives **the same token**, so earlier references keep working.
- Values are AES-256-GCM at rest; the session JSONL stores only tokens (`vault` landing is the default).
- The AI is **read-only**: no write/reveal tool exists, so a prompt-injected model can neither change nor read the library.
- Same engine as `pi-secret-mask`; when both are installed the same-session handshake makes mask yield (vault wins).

## Commands (human only)

| Command | Effect |
|---|---|
| `/vault add <alias> [desc] [--project] [--tags a,b]` | Masked input; the first write creates the vault + keyfile (no passphrase); same alias = rotate (version+1) |
| `/vault set <alias>` | Rotate (token unchanged, value updated) |
| `/vault capture <alias> -- <command>` | Store stdout directly (≤4KB, 10s timeout, never echoed) |
| `/vault import <file.env>` / `import-env` | Batch import / scan this process's environment |
| `/vault list [--global\|--project]` | Aliases + metadata (zero values) |
| `/vault get <alias>` | Mount and print only the token |
| `/vault reveal <alias>` | Dialog + clipboard only — never the transcript |
| `/vault remove <alias>` / `forget` | Delete (confirmation) / unmount everything (tokens invalidated, guarded) |
| `/vault scope` / `mode` / `lock` / `unlock` / `status` | Paths, unlock mode, lock state, counters |
| `/secret …` | Full session-level surface (landing/guard/strict/rules/save/load/audit) |

## AI tools (read-only)

| Tool | Returns |
|---|---|
| `vault_list {tag?}` | Alias, scope, description, tags, version, last use — **never values** |
| `vault_get {alias}` | The stable token `rsec_<hash8>` plus the usage contract; actionable errors for not-initialized / locked / unknown alias |

## Storage, unlock and threat model

```text
~/.pi/agent/secret-vault/
  master.key            32 bytes, 0600 (keyfile mode)
  config.json           {mode:"keyfile"|"keychain"}
  global.json           global bucket (metadata plaintext, values encrypted)
  vault.<cwdHash8>.json project bucket (shadows global aliases)
  session-state.json    zero-value session records (alias names only)
```

- **Unlock**: keyfile (default, auto-created on first write) or the OS credential store — macOS `security`, Linux `secret-tool`, Windows DPAPI (all bounded 10s subprocesses). `/vault mode` switches by generating a new key and re-encrypting everything.
- **Honest boundary**: encryption protects the file leaving this machine (backup/sync/accidental commit/theft). A same-uid malicious process can read the keyfile, and prompt injection can still send a restored value to an attacker. The main value is the **boundary + ledger**: the value never enters the session file (an infinitely-copied channel), and N scattered plaintext copies become one controlled reference.
- **Fail-closed**: a missing key with existing vault data refuses to mint a new key.

## Management UI

The companion pi-web extension **`aiti-secret-vault`** provides a management dialog (list/add/rotate/reveal/remove, lock/unlock, keyfile ↔ keychain mode, session mount overview). Values still never reach the AI. See [aiti-secret-vault](./aiti-secret-vault.md).
