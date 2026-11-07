---
title: aiti-devtools
icon: 🛠️
description: pi-web extension — injector / bridge / MCP server side + Plan M agent tool in-process injection
---

# aiti-devtools (pi-web extension)

> ❝ **AI shouldn't squint blindly at a screen; it should truly see the page.** ❞

> ⚠️ **Same name, different thing**: this page is about the **pi-web extension** deployed at `~/.pi/web/extensions/aiti-devtools/`; the npm-published injection SDK proper and the framework plugins (vite/webpack/nuxt…) are **not extensions** — they belong to a separate big topic → **[aiti-devtools integration](/en/devtools/)** (SDK proper in [core](/en/devtools/core.html), framework integrations in [integrations](/en/devtools/integrations/vite.html), examples in [examples](/en/devtools/examples.html)).

## What this extension does

The server side and wiring layer of aiti-devtools in the pi-web scenario:

- **Injector**: injects the launcher (fab/HUD/toolbar/AI window) + client (selection, event freeze, CDP-like command set) into pages accessed via pi-web
- **Bridge**: the message/session core between page ⇄ agent (claim/SSE/result protocol; browser side in `bridge-client.js`)
- **MCP server side**: the `aiti_*` tool family is injected in-process into every agent session via Plan M (the `server.agent` extension point), zero MCP config files; external standard MCP hosts go through the aiti stdio shim (registered by core `mcp-config.ts`, connected via `AITI_BRIDGE_URL`)

## AI self-management

> AI can, for you: **debug any page — and debug its own window too; AI manages itself.**

```yaml
ai:
  manage: true
  skills:
    - Multi-surface debug targets: aiti_page_exec/snapshot/logs/network/bridge_status (CDP-class against any page)
    - AI manages itself: the **AI main window (non-iframe)** additionally registers its own pageId `xxx/ai` into the bridge → CDP its own window (read dialogs / fill extension dialog forms / screenshot for review); **when there is no host, the main window itself is also under management (`xxx/ai` present, channel present)**
    - User interaction: element pick / confirm / option / input / presence probing / notification
  storage_dir: <dataDir>
  source_dir: dev-repo/aiti-devtools (core in dev-repo/core)
  page: Toolbar 🧰 AITI
```

After hooking into ai-helper: result backfill goes through two channels — "API direct write" or "CDP backfill of extension dialog forms"; the latter is the AI window self-bridging via this extension (see [aiti-helper](/en/extensions/aiti-helper.html)).

## Big-topic navigation

| Want to know | Go to |
|---|---|
| SDK proper (`@aiti-ai/aiti-devtools`) | [/en/devtools/core](/en/devtools/core.html) |
| Vite/webpack/Nuxt/Astro plugins | [/en/devtools/integrations/*](/en/devtools/integrations/vite.html) |
| Runnable examples per carrier | [/en/devtools/examples](/en/devtools/examples.html) |
| Injection principles / CDP command set | [/en/devtools/inject](/en/devtools/inject.html) · [/en/devtools/cdp-commands](/en/devtools/cdp-commands.html) |
