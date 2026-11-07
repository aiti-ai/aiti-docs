---
title: Append System Prompt Management (aiti-append-system)
icon: 📝
description: Manage pi's APPEND_SYSTEM.md (appended into the system prompt at session start) — global ~/.pi/agent/ and per-project <cwd>/.pi/ copies, edited and saved online in a web panel, with 🤖 AI drafting and writing directly
---

# aiti-append-system

> ❝ **One line of reminder, effective every time.** ❞

Append system prompt management extension: at every session start pi appends the contents of `APPEND_SYSTEM.md` into the system prompt (global `~/.pi/agent/APPEND_SYSTEM.md` + per-project `<cwd>/.pi/APPEND_SYSTEM.md`). This extension gives these two files an **online editing panel** + an **AI draft-and-write-directly** help point — no more opening a terminal to hand-edit.

- **📝 Web panel**: global / project tabs, edit online + save; shows file path, set status, mtime, word count and an unsaved marker
- **Save semantics**: `Save` = overwrite-write · `Append save` = append after the existing content · `Clear` = delete the file (back to the "not set" state); takes effect for **new sessions** after saving
- **🤖 ai-helper help point** (`write-append`): click 🤖 in any dialog to invoke — the AI reads the current state first (avoiding duplication/conflicts), drafts following the "imperative, one sentence per rule, brief" principles, and can write directly to global or project level
- **Safety**: project-level read/write validates that cwd is the working directory of a session currently known to pi-web (prevents writing files at arbitrary paths)
- **Entry**: the panel lives permanently in the pages slot, entered via the **Extension Manager's "Open"**; the top toolbar "📝 Prompts" button is hidden by default (feature `behavior.showToolbar`; enable it in the extension manager when needed)

## Usage

1. Extension Manager → Append System Prompts → Open (or enable the toolbar button, then click 📝 Prompts)
2. Pick the "🌐 Global" or "📁 Project" tab (the project tab needs an active session on the current page)
3. Edit the content → 💾 Save; 🤖 to have the AI draft it for you

## Effect chain

pi's resource-loader reads both files **at session start** and appends them into the system prompt — saving takes effect for **new sessions**; in-flight sessions are unaffected.
