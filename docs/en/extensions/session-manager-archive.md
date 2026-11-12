---
title: ".pwarc Archive Format"
icon: 📦
description: Container format specification for session-manager's "true archive" — binary layout, manifest, integrity checks and design decision record of a brotli random-access container
---

# `.pwarc` Archive Format

> Container format specification for session-manager's "true archive". Implementation: `dev-repo/session-manager/lib/session-archive.ts` (the single authoritative source for reads and writes).

## 1. One-liner and Design Motivation

`.pwarc` (Pi Web ARChive) is a custom container: **one independent brotli block per session + a trailing manifest**, supporting random access — extracting a single archived session only requires seeking to and decompressing one block, without sequentially decompressing the entire stream.

**Why not tar.gz / zip** (design decision of 2026-08-08, source in §10):

| Option | Findings at the time / conclusion |
|---|---|
| tar.gz | Node has **no built-in tar module**; and unpacking must sequentially decompress the entire stream → on-demand access to a single session is costly |
| zip | Node v24.11.1 has **no built-in `node:zip`** (verified unavailable) |
| gzip | Built-in, but the measured compression ratio on a JSONL sample was gzip-9 **2.9%** |
| **brotli** | Built-in (`zlib.brotliCompress`), measured **0.5%** on the same sample, clearly better → chosen |
| zstd | Not built-in at the time (requires a native module) → kept as a future option |

Core insight: **independent block per file = random access**. Both requirements — "packaging" and "fetching a single file on demand" — are satisfied at once, which tar.gz cannot do.

## 2. Binary Layout

```
Offset              Content
─────────────────────────────────────────────────────────
0                   magic "PWARC1\n" (7 bytes)
7                   [brotli stream of session 0]
…                   [brotli stream of session 1]
                    ⋮
                    [brotli stream of session N-1]
(EOF-8-manifestLen) manifest.json — single-line JSON (UTF-8, no newline)
EOF-8               [u32 LE: manifest byte length][u32 LE: magic 0x43524157 → bytes "WARC"]
```

- Each session gets its own independent `brotliCompressSync` stream (`BROTLI_PARAM_QUALITY: 6`) — decompressable on its own
- The footer is fixed at 8 bytes; the manifest can be located by reading backwards from the end of the file (no directory needed in the header, so writing is naturally streaming)
- An empty manifest with length field 0 is invalid; the footer magic is the sole credential for format self-identification

## 3. Manifest Structure

```json
{
  "version": 1,
  "createdAt": "2026-09-12T02:00:00.000Z",
  "files": [
    {
      "sessionId": "<sessionId>",
      "path": "/home/<user>/.pi/agent/sessions/--home-<user>-workspace-myproj--/<sessionId>.jsonl",
      "offset": 7,
      "size": 693504,
      "brotliSize": 136662,
      "mtimeMs": 1755000000000,
      "sha256": "a41e479159e9…"
    }
  ]
}
```

| Field | Semantics |
|---|---|
| `version` | Format version, currently `1` |
| `createdAt` | Packing time (ISO) |
| `files[].sessionId` | Session id — lookup key for extract / restore / delete |
| `files[].path` | Absolute path of the original live file (write-back target on restore) |
| `files[].offset` / `brotliSize` | Position and length of the block inside the package (for random access) |
| `files[].size` | Original (uncompressed) byte count |
| `files[].mtimeMs` | Modification time of the original file |
| `files[].sha256` | sha256 of the **original plaintext** (verified after decompression, not the hash of the compressed block) |

## 4. Package Naming and Rolling Buckets

- Naming: **`<cwdKey>-<YYYY-MM>-<uuid8>.pwarc`**
  - `cwdKey`: characters in cwd that are not `[A-Za-z0-9_-]` are replaced with `-`, leading/trailing hyphens trimmed, truncated to 40 characters
  - `YYYY-MM`: month of last activity of the first candidate session in this batch (rolling bucket)
  - `uuid8`: random 8-char hex to avoid name collisions
- Rolling buckets: a single package holds at most **200 sessions** or **50MB (uncompressed)**; beyond that a new package is opened automatically

## 5. Storage Location (Data Tiering)

| Content | Path | Tier |
|---|---|---|
| Archive packages | `<configDir>/state/archive/*.pwarc` | **state** — non-regenerable data, must not be deleted wholesale |
| Decompression cache | `<configDir>/cache/archive-extract/<sessionId>.jsonl` | cache — regenerable, 200MB LRU cap |

Both the read and write sides must share `archivePackagesDir()` / `archiveExtractDir()` (**write and read from the same source** is a hard rule for path-related changes: historically, a split between read and write paths once caused restore/view/delete to fail silently across the board for 30h+).

## 6. Archive Lifecycle and Guards

| Rule | Default |
|---|---|
| Candidate threshold (automatic) | last activity > **90 days** or single file > **20MB** (`archiveAgeDays` / `maxLiveSizeMb`) |
| Auto archive | on, interval **6 hours** (`autoArchive` / `autoArchiveIntervalH`) |
| Running / live sessions | **never auto-archived**; explicit archive (`ids`) releases idle handles first; sessions actually running are skipped and counted in `skippedIds` |
| Pre-archive validation | package re-parse passes **and** index `markArchived` row count matches; otherwise **delete the package and abort** (original files untouched) |

Explicit archive candidates must already be in the index (no index record = cannot be restored safely → excluded). Archived sessions are read-only: view / export / restore / delete allowed; resume/fork forbidden.

## 7. Random Access and Failure Safety

- **View**: `findEntry` (read manifests package by package to find the sessionId) → `readSync` reads only that block → `brotliDecompressSync` → sha256 verification → write into the decompression cache
- **Restore**: decompress → **sha256 verification** → write back to the original `path` → remove the entry from the package. The order is "file first, then rewrite the package" — if interrupted, the archive stays intact and a rerun converges
- **Delete entry**: copy surviving brotli blocks (**no recompression**, only recompute offsets) → write `.tmp` → re-parse validation passes → `rename` overwrite; if the package becomes empty, delete the package file
- **Deleting original files** always happens after "the package is verifiable" (triple safeguard: package re-parse + sha256 + index row count)

## 8. Related API

Endpoint prefix: `/api/extensions/session-manager/`

| Endpoint | Purpose |
|---|---|
| `GET archive/status` | Archive candidate list `{sessionId, cwd, modified, sizeBytes, ageDays}` + cache usage |
| `POST archive/run` | Run archiving (may carry `ids`; may override `ageDays` / `maxLiveSizeMb`) |
| `GET archive/session/:id` | View an archived session (decompressed to cache internally, then parsed into messages and returned) |
| `GET archive/export/:id?format=jsonl\|md` | Export (raw JSONL / Markdown) |
| `POST archive/restore` | Restore to the original path and remove from the package |
| `POST archive/delete` | Permanently delete an archive record (rewrite the package + clear index rows) |
| `POST archive/extract` | Decompress to cache only (returns the cache path) |
| `GET archive/cache?clear=1` | Clear the decompression cache |
| `POST archive/ext` | Hide/restore ext source rows via "view-layer archiving" (`archive_ref="__ext__"`, **no .pwarc package**, source data untouched) |

## 9. Versioning and Evolution

- Currently `version: 1`; the footer magic is fixed, and the read side returns null for unknown versions (no guessing)
- Future compression algorithm evolution can add a per-entry `codec` field in the manifest (old packages without codec default to brotli, zero migration for existing data) — measured compression/performance comparisons are in the "indexing and compression research" record

## 10. Design Decision Record (Traceable Sources)

`.pwarc` is an **original container format derived from the constraints of its time**, not a port of any existing implementation (structurally isomorphic to the ZIP central directory / game asset PAK "blocks + directory" pattern, a generic design). The design process is traceable:

1. **Requirement origin** (2026-08-08 09:54, user's own words): *"For long-term operation… message archiving must be true archiving — pack, compress, save resources; but for search and viewing, if there is an index before archiving, you can quickly search or browse to them."*
2. **First proposal was tar.gz** (same day 09:56): `<cwdKey>-<YYYY-MM>.tar.gz` + manifest (sha256 per file).
3. **Format pivot** (same day 10:14, derivation of per-file independent brotli blocks): on-demand unpacking needs random access → tar.gz's sequential decompression was the pain point; Node has no built-in zip/tar (verified) → custom container; brotli measured better than gzip.
4. **Written down** (same day 10:15–10:16): compression benchmark for the choice (gzip / brotli / zstd / zip / tar); code committed on 2026-08-16.

- Original session record: `~/.pi/agent/sessions/--home-wind-workspace-pi-web--/2026-08-06T07-38-25-787Z_019fd602-587b-76c7-85b3-fc96401d7f49.jsonl` (segment 2026-08-08 09:54–10:22)
