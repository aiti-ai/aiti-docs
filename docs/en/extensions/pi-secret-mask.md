---
title: pi-secret-mask (paste-safe by default)
icon: 🎭
description: Session-level secret redaction for pi — values pasted into prompts (API keys, tokens, credentials) become stable [REDACTED:*] placeholders before the model sees them, and placeholders echoed back inside tool arguments are restored to the real values before the tool executes. Zero dependencies; one install covers the TUI and every pi-web session
---

# pi-secret-mask (paste-safe by default)

> ❝ **Paste freely — nothing leaks.** ❞

**Session-level secret redaction** for pi:

- **Redact on paste**: API keys / tokens / credentials pasted into prompts become stable
  placeholders `[REDACTED:github-token]` before the model sees them (same value → same placeholder,
  consistent across messages)
- **Restore in tool args**: when the model echoes a placeholder inside tool arguments, the real
  value is restored before the tool executes — functionality unaffected
- **Session-scoped**: one install covers the TUI and every pi-web session (each pi-web pi session
  is a `pi --mode rpc` subprocess that loads your global packages)
- **Zero dependencies**; also works standalone outside pi

## Install

```sh
pi install npm:@aiti-ai/pi-secret-mask
```
