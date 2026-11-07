---
title: "ACP Session Backend (aiti-acp-agent)"
icon: 🔗
description: A universal ACP driver — one adapter connects all Agent Client Protocol agents (10 built-in with auto-detection + custom backend panel + permission cards/queue/model catalog)
---

# aiti-acp-agent

> ❝ **Once the protocol is unified, the adapter only needs to be written once.** ❞

A universal Agent Client Protocol (ACP) driver: one adapter connects every agent that speaks ACP, serving as the generic session backend for the multi-agent front end. CLIs with dedicated binaries (qoder, etc.) with deeper customization needs go through their own dedicated extensions.

## Mechanism

- ACP is the Zed-led JSON-RPC stdio standard for agent↔editor communication — with the protocol unified, the adapter only needs to be written once
- **Installed-means-connected principle**: PATH is probed at startup; a backend is registered only if its CLI is installed
- **Built-in backend auto-detection (10)**: **`claude-agent-acp`** (agentKey `claude`; the package was renamed from @zed-industries/claude-code-acp to **@agentclientprotocol/claude-agent-acp**, with the bin renamed in sync; 0.16→0.100.0 full-handshake retest confirmed the protocol surface v1 unchanged; resolve prefers the new bin with the old bin as fallback), `gemini --experimental-acp`, `opencode acp`, `cbc --acp` (codebuddy, npx fallback), copilot (`--acp`) / qwen / iflow / kimi / goose / cline
- **Custom backends**: the "ACP Agents" management panel + `acp-agents.json` — any ACP-speaking CLI connects with one line
- **Capability surface**: core four-piece set + followUp/queueManage/setModel/respondPermission (session/request_permission permission cards) /getUsage (usage_update frames) /listModels/fileAttachments (collapsed per-instance by promptCapabilities.image) /contextUsage/getMessages; steer ❌
- **Model catalog (D15)**: cache tier + real fetch in the background at startup, last-used pinned to top; the claude-code backend keeps order:10 so it stays first in the dropdown
- **features**: `acp.permissionPolicy` (allow by default / ask → front-end permission card) + `acp.permissionTimeoutSec` (default 300s timeout auto-allows) + `behavior.showAcpManager` + the spawn trio (env/command/argsPrefix)
- session/load take over + cwd restored via session-manager; cancel force-wraps up after 6s as a fallback; AI self-management skills (acp-agent-add / diagnose)

## Related

- Multi-agent front end and All Sessions: [session-manager](session-manager.md)
- Dedicated deeply customized backends: [aiti-pi-agent](aiti-pi-agent.md) / [aiti-qoder-agent](aiti-qoder-agent.md)
