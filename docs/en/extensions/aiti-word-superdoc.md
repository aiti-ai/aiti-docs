---
title: Word Editing (aiti-word-superdoc)
icon: ✍️
description: "Online .docx editing (SuperDoc: ProseMirror bidirectional docx). The AGPL is isolated within this extension — don't install it and it's simply not there"
---

# aiti-word-superdoc

> ❝ ProseMirror both ways — opening gives docx structure, exporting gives a docx file. ❞

The Word editing implementation extension (M1b) of the multi-editor mechanism (aiti-editor M0).

## Capabilities

- **.docx WYSIWYG editing** (headings / bold-italic / lists / tables / images / links) + a built-in toolbar in edit mode
- Ctrl+S saves back to the original file (409 conflict asks to confirm overwrite); save as a .docx copy
- Preview mode = read-only editor (same rendering engine as edit mode, no second conversion)
- Follows file changes in real time (watch)

## Feature switches

- `word.edit`: when off, .docx is preview-only (editing capability disabled as a whole)

## AGPL policy dividend

SuperDoc's AGPL-3.0 obligations are **isolated within this single extension** — without installing it, pi-web globally has zero AGPL frontend components:
docx preview goes through `aiti-word-docx-preview` (Apache), deep editing goes through `aiti-onlyoffice` (optional Docker tier).

> License note: the whole package ships via npm declaring AGPL-3.0, with SuperDoc's dependencies isolated inside this extension directory; the directory LICENSE file (MIT) and package.json (AGPL-3.0) are inconsistent, pending unification.

## Technical notes

- SuperDoc enters a single vite vendor chunk as an npm dependency (dist marks vue/yjs external, which direct browser imports can't resolve;
  same conclusion as Univer: the whole node_modules family is folded into a single chunk); fetched only when a .docx is opened and this provider is selected (gzip ~3.5MB)
- worker entries (browser/review-index/collaboration) land in `client/assets/` along with the chunk; the deploy script copies them recursively
- Save chain: `sd.export({ exportType: ["docx"] })` → host.save(ArrayBuffer) → save-blob atomic write
