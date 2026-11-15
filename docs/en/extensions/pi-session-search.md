---
title: pi-session-search (session search for pi)
icon: 🔎
description: Adds read-only session_search / session_read tools to the pi coding agent — full-text search across past sessions (optionally every agent family via the pi-web session-manager index) and reading original messages; recover context lost to compaction and find how something was done before
---

# pi-session-search (session search for pi)

> ❝ **The context compaction ate away? One query brings it all back.** ❞

Two read-only tools for the **pi coding agent**:

- **session_search**: full-text search across past sessions — precise recovery in the current
  session, every agent family via the pi-web session-manager index, role/repo filters, CJK
  trigram index (3+ characters)
- **session_read**: read original messages by session or entry, paged truncation for long texts

Typical use: recovering details after compaction, digging up "as we discussed last time", reusing
existing solutions across sessions.
