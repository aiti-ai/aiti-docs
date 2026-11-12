---
title: aiti prompt snippet library (aiti-prompts)
icon: 📌
description: Prompt snippet collection — favorites/groups/session extraction/save-as-you-type
---

# aiti-prompts

> ❝ **My input is my precious fortune — good lines are never typed twice.** ❞

pi-web's **prompt snippet library**: collect the good lines you've said and the commands that work, ready to use any time.

- **Library**: prompt CRUD + tree grouping (modeled on aiti-cmd's command management)
- **Session extraction**: multi-select from user messages of historical sessions and batch-import them (your own phrasing habits are the best corpus)
- **Save from input**: the 📌 button in the chat input box stores the current input into the library in one click
- **Session export**: export this session's user messages as md/json (toolbar "Export Prompts")
- **JSON import**: import into the library (merge / replace modes)
- **Usage count**: `POST /prompts/{id}/touch` (called after a successful send, records usage)

## AI self-management capability

> What AI can do for you: **organize the good lines you've said into structured favorites and draft new prompt snippets.**

```yaml
ai:
  manage: true
  skills:
    - View the library/groups (GET /prompts, store=prompts.json)
    - Create/rename/delete prompts, create groups (POST/PUT/DELETE /prompts, /groups)
    - Session extraction: read historical session user messages → batch-summarize into the library (AI's specialty)
    - Input suggestions: suggest candidates = **commands (⚡) + favorite prompts (📌) mixed**; a command hit fills/executes directly, not via AI; only with no hit does AI generation step in
    - Session-extracted entries (source=session) default to **suggest:false** (excluded from smart suggestions)
  storage_dir: ~/.pi/web/data/aiti-prompts/config (prompts.json)
  page: left sidebar library / right file dock / dialogs (the toolbar 📌 button returns once the source's duplicate toolbar key is fixed)
```

Once wired into ai-helper: the library panel's "AI, write it for me" → describe a usable instruction → preview → save to the library (see [aiti-helper](/en/extensions/aiti-helper.html)).

### AI help point (skill: prompt-create)

| Help point | Effect | Implementation |
|---|---|---|
| `prompt-create` AI writes a prompt for me | Describe the scenario → AI generates prompt JSON → validated into the library | `POST /prompts` (mapping name/text/tags/suggest; suggest=false excludes it from input suggestions) |

Declared in `skills/prompt-create/SKILL.md` (aggregated by ai-helper from the skills directory; no registration needed).
