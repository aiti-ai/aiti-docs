---
title: File Editor (aiti-editor)
icon: ✍️
description: Extensible editor — Monaco editing take over + save (mtime conflict 409 + whitelist/size checks) + archive extraction + unified image viewer (message images and file images unified, zoom · pinch · info panel)
---

# aiti-editor

> ❝ **See wrong code, fix it on the spot — no switching out to open an IDE.** ❞

pi-web file editor extension (extensible editor architecture, design in `docs/pi-web-file-editor-design.md`):

- **fileViewer slot take over**: text-like files are rendered by the extension component (Monaco editing); non-text goes to the core's legacy viewer
- **Unified image preview hosting (2026-09-17)**: images popped from the message list/input box/markdown (base64/API URLs, no disk path) share the same full-featured viewer with on-disk image files (zoom · pinch · pan · rotate · info panel · copy · download). The host invokes it via `__aitiEditor.openImagePreview(src,{alt})` (the host side has no image container/image tab; lazy extensions are materialized idempotently by the entry bridge); the extension presents it as a floating window — dialogs slot + aiti-float contract (drag / small-screen fullscreen); without aiti-float installed, its own fixed positioning serves as the fallback; when the extension is unavailable on the host side it falls back to the upstream native lightbox. On small screens the toolbar wraps with bounded width and no overflow; the checkerboard background follows the host theme.
- **Save**: `POST /save` fs write + baseMtime conflict detection (409) + whitelist/size checks
- **Read/watch**: goes through its own ticketed endpoints (paths never appear in URLs, preventing access-log leaks) — `POST /ticket` (TTL 1h sliding renewal) exchanges for a ticket → `/t/<ticket>/raw|stat|file` (provider delegation + Range streaming); watch is its own fs.watch (300ms debounce) → pushed via the event-bus topic `ed-watch`, auto-stops after 30min idle
- **Archive extraction**: 7-Zip chain — use the system install when present; otherwise justget races multiple sources to download a portable 7za, cached locally
- **Delivered** (formerly the M2+ roadmap): the `window.__aitiEditor` registry is open; file provider registration (registerFileProvider + `/file` delegation); Markdown smart preview (editor.mdPreviewSmart); TS sibling-file extraLib (/ts-siblings)
- **Document preview**: ticketed `/preview` (CSP sandbox + opaque origin + `noscript=1` can strip author scripts); soffice-to-PDF conversion (doc-pdf, feature `soffice.path`); convert to an editable format and save-as (`POST /convert-saveas`: .doc→.docx / .ppt→.pptx); AI self-management skill install-soffice
- **Editor surroundings**: file rename/move (`/rename` `/move`); unsaved edit cache (cache-write/read/delete, survives reopen); git change markers (git-changes/git-base); session-files session file aggregation; `GET/PUT /prefs` preferences (editor-prefs.json covered by the aiti-configs backup)

Depends on js-yaml / sql-formatter / tar-stream / yauzl / exifr / @aiti-ai/ext-shared.
