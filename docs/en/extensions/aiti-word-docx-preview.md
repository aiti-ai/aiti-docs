---
title: Word Preview (aiti-word-docx-preview)
icon: 📄
description: "High-fidelity read-only .docx preview (docx-preview: pagination / headers & footers / tables / images / lists restoration)"
---

# aiti-word-docx-preview

> ❝ Read-only tier with zero dependencies — view Word on the Apache path, leave editing to SuperDoc / OnlyOffice. ❞

The Word pure-preview implementation extension of the multi-editor mechanism (aiti-editor M0), following the naming convention `aiti-<filetype>-<impl>`.
Plan: `docs/aiti-editor-office-plan.md` §2.2.

## Capabilities

- **High-fidelity paginated .docx rendering**: significantly better restoration than core's mammoth pure-HTML conversion (pages / headers & footers / footnotes & endnotes)
- Table/image/hyperlink/list style restoration; zero-install pure JS parsing (files never land on third-party services)
- Follows file changes in real time (watch); the "About this editor" menu shows capabilities / limitations / dependencies / licenses

## Design notes

- **Pure client extension**: no editing (doesn't register ContentProvider.write), no save-blob, zero data-plane dependency on the server side
- vendor UMD lazy loading (docx-preview 75K + jszip 97K); fetched only when a .docx is opened
- With only this extension installed, clicking "Edit" → capability-linked prompt/routing (aiti-word-superdoc / aiti-onlyoffice take over editing)
- Disabling this extension → docx preview falls back to core mammoth (zero regression)
- License note: the extension's package.json declares Apache-2.0 while the directory LICENSE file is MIT — inconsistent on the source side, pending unification
