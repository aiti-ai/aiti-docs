---
title: Message Intelligence (aiti-msg-smart)
icon: 💬
description: Message click recognition — paragraph/heading/code-line clicks → quote/copy/option popups + clause/line highlighting
---

# aiti-msg-smart

> ❝ **However well the AI says it, copying it is still a chore.** ❞

pi-web's **message click intelligence**: any piece of text in the chat can be quoted/copied/acted on with a click — the recognition capability and popup UI live entirely in this extension, and core only provides thin extension points (broadcasting paragraph clicks + passing through host capabilities).

## What it can do

- **Paragraph/heading/list/table-row clicks**: pop a card → copy / quote (full text or a single sentence) / option buttons (yes/no, A/B prefill)
- **Code block line clicks**: click a line → copy that line / quote that line + **clicked-line highlight** (accent selection ring, scroll-following)
- **Hover quote-single-sentence button** → **clause highlighting** circles the corresponding text in the original (similar to the inject selection ring)
- **Inline code click**: one-click copy of inline code + a small action layer (default "copy"; external providers can append actions)
- **Recognizers** (features can enable/disable them, managed by extman):
  - `recognizer.question`: closed-ended questions → yes/no, A/B option buttons (quote prefill)
  - `recognizer.file`: file/directory paths → 📂 open + 📁 locate (existence check, silent on 404)
  - `recognizer.url`: http/https links → 🔗 open in a new window
  - `recognizer.summary`: any paragraph → copy full text / quote full text
  - `recognizer.selection`: text selection → popup copy / quote-reply (current session) / quote into a new session
  - `recognizer.fileExternalRoots`: when the primary cwd misses, resolves files across repos via aiti-git-trace's session-recognized repos / watched paths (optional dependency)
- **user messages**: a fixed 💬 quote inside the bubble (action area, no paragraph-click detection)

## Architecture (boundary with core)

```
Page (markdown paragraphs/pre)            aiti-msg-smart (client bundle)
  └─ core thin extension points            └─ all business logic
     registerParagraphClick (broadcast)     Recognizers: question/file/url/summary
     handler.tags declares clickable tags   Popup cards: copy/quote/options/file/url
     (p/li/tr/h1-h6 + pre lines)            Overlay positioning: tr/pre fixed following scroll
     host-api: openFile/revealDir/appendText  Clause highlight / clicked-line highlight
     tip visual contract (hint copy provided by the extension)   Inline code click-to-copy (event delegation)
```

core holds no recognition/decision/UI copy (i18n hints are moved out too); adding a new clickable scenario (e.g. headings) = the extension declares `tags` and it takes effect.

Action provider extension point: other extensions can register under the `msg-popover-action` / `inline-code-action` topics to append actions to the popups (e.g. aiti-cmd commands).

## AI self-management capability

> The AI can, for you: **understand popup behavior and recognition boundaries, and troubleshoot clicks not taking effect (first check the extension enabled + core sync).**

```yaml
ai:
  manage: true
  skills:
    - Troubleshooting "clicking a paragraph does nothing": extension loaded/enabled (/api/extensions/status) + whether core contains registerParagraphClick (unavailable if the production build lags behind)
    - Adding clickable semantic blocks: within the core CLICKABLE_TAGS candidates + declared in the extension's ph.tags (no hardcoding core business)
    - Popup positioning: tr/pre go through portal fixed (the extension manages anchorRect + scroll following itself); p/li/h go in-flow sibling
  storage_dir: none (no server-side storage; only a resolve-roots read-only API, consuming the aiti-git-trace outlet in-process for cross-repo file resolution; optionalDependsOn aiti-git-trace)
  source_dir: dev-repo/aiti-msg-smart
  page: direct clicks on chat message paragraphs/code blocks
```

## Recognition boundaries (narrowed decisions)

- **The code recognizer has been removed** (redundant with "copy full text"; tr cell `|` concatenation mis-triggers); path merged into file
- **Table cells (td/th) are not handled** — tr whole-row clicks already cover them
- Images/blockquote not done (nesting conflicts TBD)
