---
title: aiti-agent 规划
icon: 🤖
description: Web 工作台（基于 pi-web）阶段计划 M0-M4
tags: [roadmap, aiti-agent]
---

# aiti-agent 规划（Web 主战场）

> 构建于开源项目 **pi-web** 之上，产品身份独立（品牌 aiti、域名 aiti.pw、scope @aiti-ai）。来历见[项目起源](/guide/origin.md)。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **M0 · 地基** | 稳定核心 + 独立身份 | ① 命名/品牌 ✅（aiti）② rebase v0.8.7（含 pi 0.84）③ 验证链 ④ service-tunnels 公开化 | 📋 |
| **M1 · 工作台起步** | 远程能干活 | Docker（lite）+ `just get` v1 + ttyd 终端 + **WS 链路实测** | 📋 |
| **M2 · 浏览器调试** | 远程调 Chrome | CDP 9222 暴露 + DevTools + cdp 工具移植 + sessiond 评估 | 📋 |
| **M2.5 · CLI 桥接**（支线） | 任意 AI CLI 会话进 Web | lib/cli/ 适配层 + Claude Code 适配器（live）+ Codex/OpenCode（turn-based） | 📋 |
| **M3 · 桌面可视化** | 远程看/操作 GUI | noVNC 桌面（full 镜像）+ 任意 GUI + TOTP 编排 | 📋 |
| **M4 · 产品化** | 有人愿意用 | 编辑器、PWA/移动端、SSH 多机、推广投放 | 📋 |

## 能力五层（目标态）

```
UI 层：会话/服务/终端/桌面/调试 统一界面
调试可视化层：CDP(Chrome) · VNC(桌面) · ttyd(终端)   ← M1-M3
暴露层：service-tunnels（HTTP vhost + TCP 隧道 + TOTP）← 已有
执行层：pi agent（SDK 进程内）+ 真实工作区/Docker     ← 已有+规划
数据层：共享 pi JSONL + queue 持久化 + worktree       ← 已有
```

## 与 devtools/桥的协同

- aiti-agent 会话内置 **aiti-bridge** 客户端：在 Web 工作台里直接操作任意注入页面
- service-tunnels `transformResponse` 与 devtools 注入同语义 —— 隧道暴露的页面可复用同一套注入脚本
- M2 的 CDP 链路与 devtools 的 `page_exec`（Browser 域）能力互补：远端完整 DevTools vs 页面内轻量命令集

## 关键待验

- [ ] WS 链路（Next middleware 不代理 WS）——实测 Next 16 proxy rewrite / 或走 TCP 隧道
- [ ] service-tunnels 公开化方案（仓库位置/发布名）
- [ ] @oh-my-pi SDK 兼容性（AgentSession/RPC 签名，双引擎前提）
- [ ] CLI 桥接 P0 前置实测（CC control_request、Codex exec resume、OpenCode run --session、Gemini -p --resume-id）

## 推广节奏（M1 后）

- 渠道：GitHub topic（pi-coding-agent 705 项目）→ pi.dev 包目录/Discord → Reddit/dev.to/掘金 → Docker Hub
- 素材：60 秒演示「docker run → just get chrome → 远程调试」
- 治理卖点：我们合并 PR；共享 JSONL 迁移零成本
