---
title: ext metadata spec
icon: 📐
description: The ext frontmatter spec for extension md files, the type enum, submitting new extensions, JSON consumption
---

# ext metadata spec

The extension registry's data comes from each extension md's `ext` frontmatter, aggregated at build time by the plugin into `/extensions.json`.

## 1. ext metadata

An extension md's frontmatter carries an `ext` object (all fields except `id`/`name` are optional; defaults apply when missing):

```yaml
---
title: aiti-helper              # page title (also the fallback display name for the list)
icon: 🧰                        # page icon
ext:
  id: aiti-helper               # required, unique id (usually same as the file name)
  name: aiti helper             # display name (default = id)
  description: one-line description  # list card subtitle
  soul: one-line soul statement      # the design's driving force (italic note on the card, optional but recommended)
  type: dev-repo              # type enum (see below)
  category: page debug injection     # list grouping (custom Chinese category)
  version: 0.2.1                # current version
  status: active                # active / beta / experimental / archived
  author: aiti-ai               # maintainer
  repo: ""                      # fill "owner/repo" when it has its own repo (leave empty when none yet)
  npm: "@aiti-ai/my-ext"         # npm package name (optional)
  install: |
    pnpm add -D @aiti-ai/my-ext
  license: MIT
  tags: [inject, inspector, mcp] # search tags
---
```

### Field reference

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique identifier, same as the file name; also the primary key in the JSON |
| `name` | — | Display name, defaults to `id` |
| `description` | — | One-line description (shown on the list card) |
| `soul` | — | One-line soul statement — the driving force behind the extension's design (italic highlight on the card, recommended) |
| `type` | — | Type enum, default `other` |
| `category` | — | List grouping, custom Chinese category name, defaults to "Other" |
| `version` / `status` / `author` | — | Version, status (active/beta/experimental/archived), maintainer |
| `repo` | — | Standalone repo `owner/repo`; **extensions without a repo yet stay empty**, fill it in later when one exists |
| `npm` | — | npm package name (if any) |
| `install` | — | Install/deploy method (multi-line uses a `\|` block) |
| `license` / `tags` | — | License, search tags |

### type enum

> ⚠️ **The registry only accepts pi-web extensions**: the aiti-devtools SDK itself and the framework plugins (Vite/webpack/Nuxt/Astro…) are **not extensions** — they belong to the separate major topic [/devtools/](/en/devtools/) and are registered in `docs/devtools/integrations/` (see "integrations registration" below); IDE plugins belong to [/ide/](/en/ide/). The former `devtools-plugin`/`ide-plugin` types are deprecated and removed.

| type | Meaning |
|---|---|
| `dev-repo` | aiti-agent runtime extensions (`~/.pi/web/extensions/`) |
| `bridge` | MCP bridge / local service |
| `theme` / `skill` | Themes / skills (reserved in the pi / aiti-agent ecosystem) |
| `other` | Other |

## 1.5 integrations registration (aiti-devtools framework integrations)

The aiti-devtools framework integration pages live at `docs/devtools/integrations/<id>.md`, whose frontmatter also uses the `ext:` block (same fields as above; type is free-form such as `vite-plugin`). They do not enter the `extensions.extensions` array; instead they are compiled into a separate `integrations` array (see JSON consumption below), and their page docs links point at `/devtools/integrations/*.html`.

## 2. Submitting a new extension

1. Copy the template below and create `docs/extensions/<id>.md` (id same as the file name);
2. Fill in the `ext` metadata and write a 2-5 sentence intro in the body (may link to detailed docs);
3. Add an entry to the "Extensions" group in the nav `docs/.vuepress/sidebar/zh.ts`;
4. Open a PR — the list page and `/extensions.json` update automatically at build time, no manual maintenance needed.

```markdown
---
title: my-ext
icon: 🧩
ext:
  id: my-ext
  name: My Extension
  description: What it does
  type: other
  category: Other
  version: 0.1.0
  status: experimental
  author: you
  publisher: you
  website: https://example.com
  repo: ""
  npm: ""
  install: |
    pnpm add -D my-ext
  license: MIT
  tags: []
---

# my-ext

(One-line positioning + link to usage docs / source. If there is no repo yet, state the current status and how to obtain it.)
```

## 3. JSON consumption

The `/extensions.json` structure (`schemaVersion: 2` — **split**: `extensions` contains only pi-web extensions; framework integrations are separated into the `integrations` array):

```json
{
  "schemaVersion": 2,
  "generatedAt": "2026-08-14T00:00:00.000Z",
  "count": 38,
  "extensions": [
    {
      "id": "aiti-helper",
      "name": "aiti helper",
      "description": "…",
      "type": "dev-repo",
      "docs": "/extensions/aiti-helper.html"
    }
  ],
  "integrations": [
    {
      "id": "aiti-devtools-vite",
      "name": "aiti-devtools-vite",
      "description": "Vite plugin — dev auto local injection, one plugin line = same-origin /aiti/ full suite",
      "type": "vite-plugin",
      "npm": "@aiti-ai/aiti-devtools-vite",
      "install": "pnpm add -D @aiti-ai/aiti-devtools-vite\n# vite.config.ts: plugins: [aitiDevtools()]",
      "status": "active",
      "docs": "/devtools/integrations/vite.html"
    }
  ]
}
```

aiti-agent fetches `https://aiti.pw/extensions.json` to auto-discover the extension list — **extension discovery consumes only the `extensions` array** (framework plugins are not installable extensions and should not appear in the extension list).

> **Note (English mirror)**: the extension registry (`/extensions.json`) is compiled from the Chinese entries (`docs/extensions/*.md`). English pages under `docs/en/extensions/` are documentation mirrors and carry no `ext` frontmatter. Registering a new extension still goes through a Chinese entry (see the zh spec above).
