---
title: IM Channels (aiti-channels)
icon: 📮
description: IM channel integration + a full frontend shell for cc-connect — hosts the cc-connect process, overview/projects/channels/sessions panels, and a socket API for outbound messaging
---

# aiti-channels

> ❝ **AI shouldn't be locked inside a web page — DingTalk/Feishu/WeChat are all its windows.** ❞

IM channel integration extension: hosts the cc-connect process (no systemd dependency) and gives cc-connect a full frontend shell. Platform schemas cover 14 kinds: dingtalk / feishu / wechat / telegram / discord / slack / line / qq / qqbot / wecom / matrix / webex / yuanbao / googlechat.

- **Process hosting**: cc-connect is spawned/managed by the extension, no systemd config needed
- **Panels**: overview / projects / channels / sessions / config + the console embedding cc-connect's native Web UI
- **Outbound API**: send messages (text/files) over the socket API, for the agent toolchain to call (e.g. `aiti-im-send`)
- **client**: JSX + vite build (template templates/ext-jsx-client)

## Capability overview

- **Multi-instance**: wizard-driven addition (id/ports auto-assigned: mgmt 9821-9849, bridge 9811-9839); each instance has its own config/dataDir/socket; the default instance is protected and cannot be deleted
- **Config generation**: forms render dynamically per platform schema → generates config.toml (an automatic .bak backup is written before each write) — no hand editing
- **QR-code authorization**: Feishu/WeChat go through cc-connect's official wizard (this extension only proxies the requests; credentials are filled back into the form, never stored on its behalf)
- **ACP agent backend**: a resident ACP server in pi-web (one Unix socket per instance); the cc-connect connector is only a few KB — IM messages are handled by real pi-web sessions, including session/request_permission human-gate approval cards
- **Agent tools**: `aiti-im-list` / `aiti-im-send` — send without session_key automatically picks the project's first active session; filePath sends files; off by default (enable `agentTools.enabled` in extman)
- **Install/update**: one-click install/update from the panel (via justget, github+gitee dual sources)
- **Ops endpoints**: log (tail) / msg-log (outbound records) / reload-cc / restart-cc
