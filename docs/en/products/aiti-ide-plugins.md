---
title: aiti IDE Plugins
icon: 💻
description: aiti-devtools-vscode / aiti-devtools-idea — complete injection + direct connection to the IDE AI agent window
tags: [product, ide, vscode, idea]
---

# aiti IDE Plugins — vscode / idea

> **In one sentence**: IDE plugins are the **last mile** of "injection + bridge + AI window" — one-click injection completion, and through aiti-bridge, **messages are sent directly to the AI agent window inside the IDE** (Copilot Chat / Cursor / JetBrains AI Assistant, etc.).

## 1. Plugin Matrix

| Plugin | Package / Marketplace Name | Target IDEs | Status |
|---|---|---|---|
| aiti-devtools-vscode | `@aiti-ai/aiti-devtools-vscode` | VS Code / Cursor / Windsurf | 📋 |
| aiti-devtools-idea | `@aiti-ai/aiti-devtools-idea` | IntelliJ / PyCharm / WebStorm / GoLand / Android Studio | 📋 |

## 2. Three Core Responsibilities

### ① Complete Injection (Inject)
- Watch the project's dev server (Vite/Webpack/Next…) and inject aiti-devtools into responses via **proxy/port forwarding** (a prepend with the same semantics as `transformResponse`)
- When no dev server is detected: start a built-in proxy or prompt the user to start one
- When the page is already injected (the response already contains aiti-launcher.js, or the launcher marker `#__dbg_launcher` exists) → skip, avoiding double injection
- Cross-platform consistency: the injection script is the **same one** as the in-project plugins and the Chrome extension, with the bridge protocol unchanged

### ② Configure the Bridge (Bridge)
- One-click start/stop of `aiti-bridge` (local 8777, port configurable)
- Auto-register the current project's page → generate `pageId` → write into MCP config
- Auto-configure the MCP client of the IDE's built-in AI agent (VS Code writes `.vscode/mcp.json` or settings; JetBrains writes the MCP config XML)

### ③ Direct Connection to the AI Agent Window (Direct to IDE AI)
- Page events (`open_file` / `aiti_element_selected` / `user_*` answer cards) are pushed in real time via the bridge to **the IDE's AI agent window**
- The plugin injects an "aiti panel" into the AI window: current pageId, target URL, framework detection, connection status, dangerous-command confirmation queue
- Users answer `user_confirm` / `user_choose` / `user_input` directly in the IDE AI window; answers go back through the bridge → AI
- The `open_file` event uses IDE APIs to open the source file and jump to the line (same semantics as `code --goto file:line`, smoother inside the IDE)

## 3. User Journey (VS Code Example)

```
1. Open the project → command palette → "aiti: enable page debugging"
2. The plugin starts dev-server proxy injection + brings up aiti-bridge (auto-configures .vscode/mcp.json)
3. Ask directly in Copilot Chat (or Cursor):
   "clicking the home page button does nothing, help me investigate"
4. The AI calls page_exec to click the button → collects console errors → back to the IDE AI window
5. The AI calls user_confirm: "detected a null dereference in onClick — change it to optional chaining for you?"
   → the IDE AI window pops up a confirmation card → you click "approve" → the AI fixes the code automatically
6. When the AI calls user_pick_element, the page enters Inspector picking; the selected element locates straight to the source file and opens it in the IDE
```

## 4. Implementation Notes

| Aspect | Approach |
|---|---|
| Injection detection | skip when the first HTML chunk already contains aiti-launcher.js (runtime also dedupes via the launcher marker `#__dbg_launcher`) |
| Proxy | local reverse proxy in front of the dev server (Vite defaults to 5173); responses get prepend injection |
| Bridge lifecycle | the plugin manages the child process; the bridge stops gracefully when the IDE closes (TTL retains pageIds) |
| Config interoperability | `.vscode/mcp.json` / JetBrains `mcp.xml` two-way sync |
| AI window injection | VS Code Webview (Copilot Chat extension points) / JetBrains Tool Window embedding |
| Multiple windows | one instanceId per project; shared across multiple windows of the same project |

> Usage docs: [IDE plugins](/en/ide/); product pipeline: [Product Matrix](/en/products/README.md).
