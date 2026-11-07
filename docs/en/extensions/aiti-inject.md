---
title: aiti-inject
icon: 💉
description: dev instance only — injects the production aiti-devtools launcher (FAB) into pi-web dev pages
---

# aiti-inject

> ❝ **The first step of debugging shouldn't be reading documentation.** ❞

An extension **exclusive to the pi-web dev branch**: when a dev page opens, it injects the launcher (inject JS) of the **production** aiti-devtools into the page, so the production FAB (debugger entry) appears in the dev UI.

- Two jobs (v0.3+): (1) the client injects the production aiti-devtools launcher (with a content-hash version number; launcher changes → forced re-fetch); (2) at startup it generates a dev-specific MCP config (`$PI_CODING_AGENT_DIR/mcp.json` writes only one entry — aiti-devtools → the dev local bridge `http://127.0.0.1:30142/dev/api/extensions/aiti-devtools/mcp/mcp`; all other MCP servers merge in from the shared config; overridable via `PI_WEB_DEV_AITI_MCP_URL`; inspect with `GET /status`, rewrite with `GET /sync`)
- The production environment (npm-installed package) doesn't set `PI_WEB_EXTRA_EXTENSIONS_DIRS`, so this extension is never loaded.

## Related

- The proper configurable version: [aiti-debug-inject](aiti-debug-inject.md) (feature-configured target address + switch, cross-instance debugging)
