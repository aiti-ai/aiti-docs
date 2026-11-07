---
title: aiti-devtools-idea
icon: 🟨
description: JetBrains plugin — injection + bridge + AI Assistant integration
tags: [ide, idea, jetbrains]
---

# aiti-devtools-idea

> Status: 📋 planned. Supports IntelliJ IDEA / PyCharm / WebStorm / GoLand / Android Studio (JetBrains platform).

## Features

| Feature | Description |
|---|---|
| One-click injection | Proxies the dev server to inject aiti-devtools (same architecture as the VS Code version) |
| Auto-starts the bridge | Starts/stops `aiti-bridge`, configurable port |
| Auto-configures MCP | Writes the JetBrains MCP config (`mcp.xml`), giving **AI Assistant** the page tools |
| AI window aiti panel | Embedded as a Tool Window: pageId, sessions, answer cards, event log |
| Answer cards inline | `user_*` interactions answered directly in the AI Assistant window |
| Source code jump | `open_file` opens the file and jumps to the line via IDE API (same semantics as `code --goto`) |

## Menu

```
Tools → aiti
  ├─ Enable Page Debugging   # inject + start bridge + configure MCP
  ├─ Stop Debugging
  ├─ Bridge Panel            # pageId / sessions / events
  └─ Re-inject               # fixes double injection
```

## Platform differences

| Difference | Handling |
|---|---|
| AI Assistant version differences | Older versions lack MCP support → fall back to "open cockpit" + manually copying the pageId |
| Multilingual IDEs | Panel copy follows IDE localization; the bridge protocol is language-independent |
| Android Studio | Injection targets web pages (dev builds); on-device debugging goes through Chrome CDP |

## User journey

```
1. Open the project → Tools → aiti → Enable Page Debugging
2. The dev server is proxied and injected automatically; AI Assistant gets the aiti MCP tools automatically
3. "Help me debug this form validation" → AI: page_exec triggers validation → finds the email regex is wrong
4. AI: user_choose "Option A: fix the regex / Option B: switch validation library" → a choice card pops up in the AI window
5. Option A chosen → AI changes the code → the page verifies automatically
```

> Related: [IDE plugins product page](/en/products/aiti-ide-plugins.md) · [Integrating AI agents](/en/guide/mcp/ai-agents.md)
