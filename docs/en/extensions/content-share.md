---
title: content-share (content sharing engine)
icon: 📦
description: Provider-based content sharing engine — 161 built-in targets (the full ShareX .sxcu catalog plus China-friendly Gitee / Lsky / SM.MS / Pastebin / Rentry / paste.rs / Alibaba OSS and note archives Joplin / Obsidian / memos / SiYuan / Flomo), a zero-dependency .sxcu executor (4 body types, ShareX syntax parser, JSONPath/regex URL extraction), remote catalog overlay and a redaction hook
---

# content-share

> ❝ **One provider engine, one shared path from content to URL.** ❞

## What it is

A base library that uploads text, images or files to paste bins, image hosts, object storage or note archives and hands back a shareable URL. **The package stops at the URL** — QR codes, clipboard writes and OS share sheets belong to the caller.

Used by [aiti-msg-share](/en/extensions/aiti-msg-share) as its sharing engine.

## Why it

- **161 built-in targets**: the full [ShareX CustomUploaders](https://github.com/ShareX/CustomUploaders) catalog (148 `.sxcu` configs, synced upstream) plus 7 China-friendly services, 5 note archives and 2 code providers.
- **Data-driven**: an `.sxcu` config *is* a provider — add a target without writing code; one engine executes them all (4 body types, ShareX syntax parser port, JSONPath/regex URL extraction).
- **Runtime registration**: `registry.register()` / `addEntry()` for user-defined or remotely delivered targets.
- **Remote catalog overlay**: recommended set, dead-service flags and new entries maintained at a central JSON URL (disk cache + TTL + stale fallback).
- **Redaction hook**: `share()` accepts `hooks.transformText`, so callers can inject a secrets scanner (e.g. `@aiti-ai/secret-mask-core`). The package has no opinion on content.
- **Zero runtime dependencies**, Node >= 22.18.

## Usage

```ts
import { Registry, share } from "@aiti-ai/content-share";

const registry = new Registry();
await registry.init();                       // loads the 161-entry catalog

const result = await share(
  registry.get("gitee-gist")!,
  { text: "# Hello" },
  { provider: "gitee-gist", values: { token: process.env.GITEE_TOKEN! } },
);
console.log(result.url);                     // terminal output
```

CLI:

```bash
content-share list [text|image|file]            # list targets by content kind
content-share share --provider <id> --text hi   # upload and print the URL
content-share import-sxcu <file.sxcu>           # validate a config's compatibility
content-share mock paste-demo --port 8931       # start the demo paste server
```

## Categories

`publish` (public URL) · `archive` (Joplin/Obsidian deep links) · `bookmark` · `local` (local session links).

## Target availability audit (2026-11)

All 161 targets were probed with real uploads (direct connection → VPN policy routing → retest, merged multi-run evidence). Bottom line: **only 11 of the 136 zero-setup targets work out of the box and pass verification** — direct from China: paste.rs / dpaste.com / p.ip.fi / f.blicky.net; behind a VPN: rentry / gofile.io / write.as and others. The ShareX `.sxcu` catalog has aged badly (services moved, APIs changed, sites shut down), and the catalog `status` field disagrees with reality. The table below is filterable and searchable; each row carries its registration entry and notes. Machine-readable data: [`/share-targets.json`](/share-targets.json) (usable directly as the remote overlay catalog URL).

<ClientOnly>
<ShareTargetStatus />
</ClientOnly>

## License

MIT. The `.sxcu` syntax semantics are derived from ShareX (GPL v3) by independent reimplementation — no ShareX source code is included.
