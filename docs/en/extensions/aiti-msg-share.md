---
title: Message Share (aiti-msg-share)
icon: 📤
description: Share sessions, single messages, selections, files and images — the workbench runs on your own machine, so content goes through a configurable share target (Gitee / image hosts / object storage / note archives, 161 built in) to get a public URL, with secret redaction before upload and a QR code
---

# aiti-msg-share

> ❝ **Sharing it out is how the conversation continues.** ❞

The workbench runs on your own machine, so a session URL is not reachable from outside. This extension uploads what you pick through a **configurable share target** and hands back a public URL — plus a QR code, clipboard copy and, where the platform supports it, the OS share sheet.

Sharing only happens when you say so, and the **preview is always editable** first, so you see exactly what leaves your machine.

## Where you can share from

| Entry | What gets shared |
| --- | --- |
| Message hover actions | That single message |
| Message Intelligence (aiti-msg-smart) selection popover | The selected text |
| Message Intelligence file card | The referenced file |
| Session row `⋯` more menu | The whole session (markdown export) |
| File editor toolbar | The open file, or the current selection |
| Image preview window | The image |
| Command palette | Share center |

Every entry is a **host slot or an extension topic**: this extension registers providers and other extensions render them — no hard-coded buttons.

## Targets

161 built-in targets come from [`@aiti-ai/content-share`](https://www.npmjs.com/package/@aiti-ai/content-share):

- **Publish** (public URL): Gitee Snippet, Lsky Pro, SM.MS, Pastebin, Rentry, paste.rs, Alibaba Cloud OSS, and the full ShareX `.sxcu` catalog (catbox, imgbb, gofile, 0x0.st, …)
- **Archive** (into your own notes): Joplin, Obsidian Local REST, memos, SiYuan, Flomo
- **Local** (no upload): a link back to the session on your own workbench
- **Custom**: any HTTP endpoint (`.sxcu` config or the template provider)

The dialog shows a **recommended set** first (maintainable online: recommended list and dead-service flags); "Add more…" opens the full catalog with search, config-state badges (🟢 anonymous / 🟠 needs setup / ✓ configured / 💀 dead) and one-click ShareX `.sxcu` import.

## Redaction

Before upload the text passes through [`@aiti-ai/secret-mask-core`](https://www.npmjs.com/package/@aiti-ai/secret-mask-core) — the same deterministic credential-detection engine behind `pi-secret-mask`. Hits become `[REDACTED:RULE#hash]` placeholders shown in the preview; toggling re-renders the textarea immediately and restores the original when unchecked. Binary content (images/files) is not scanned — the UI says so.

## Page-info stamp

A multi-select in the preview header prepends optional context: **OS**, **browser**, **URL**, **session id**, **session name**.

## AI skills

Declared through `aiti-helper`'s standard `skills/` mechanism:

- `configure-target` — obtain and store a token/key for a provider, then verify it
- `troubleshoot` — read share history, classify the failure (network / auth / size / dead service), recommend a fix or another target
- `import-sxcu` — validate a ShareX config's compatibility and register it as a target

## Data & privacy

- Target credentials live in `<configDir>/targets.json` (mode `0600`); API responses are always masked.
- Uploads go through the extension's own server route — the browser never holds a token, and there are no CORS workarounds.
- Share history lives in `<stateDir>/shares.json` (last 200 entries).
- File shares respect the host's allowed-roots policy (`ctx.core.fileAccess`); image sources are restricted to same-origin/localhost to avoid SSRF.
