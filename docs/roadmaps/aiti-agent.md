---
title: aiti-agent 规划
icon: 🤖
description: Web 工作台（基于 pi-web）阶段计划 M0-M4
tags: [roadmap, aiti-agent]
---

# aiti-agent 规划（Web 主战场）

> 构建于开源项目 **pi-web**（agegr/pi-web）之上，产品身份独立（品牌 aiti、域名 aiti.pw、scope @aiti-ai）。来历见[项目起源](/guide/origin.md)。
> **现状基准**：产品已发布 —— npm [`@aiti-ai/pi-web`](https://www.npmjs.com/package/@aiti-ai/pi-web) 0.15.x · Docker `aitiai/pi-web`（core/full）· `aiti.pw/install.sh`；逐项状态以[产品矩阵](/products/README.md)为准。

## 阶段计划

| 阶段 | 目标 | 交付 | 状态 |
|---|---|---|---|
| **M0 · 地基** | 稳定核心 + 独立身份 | ① 命名/品牌 ✅ ② 上游跟进（原 rebase v0.8.7，已演进为常态化上游同步，现版 0.15.x） ③ CI 验证链 ✅ ④ service-tunnels 公开化 ✅（GitHub 独立仓） | ✅ |
| **M1 · 工作台起步** | 远程能干活 | Docker core/full 双镜像 ✅（超出 lite 规划，4 语 README + compose + systemd）；终端以 aiti-cmd PTY 面板交付 ✅（形态替代原 ttyd 规划）；WS 链路生产消解 ✅；`just get` 工具市场 📋 | 🚧 |
| **M2 · 浏览器调试** | 远程调 Chrome | CDP 通道已接入：chrome-devtools / msedge-cdp / remote-cdp MCP server；与 devtools `page_exec`（页面内轻量命令集）互补（远端完整 DevTools vs 页面内命令）；sessiond 评估 📋 | ✅ 主干 |
| **M2.5 · CLI 桥接**（支线） | 任意 AI CLI 会话进 Web | 12 家 CLI 适配扩展上线：Claude Code / Codex / OpenCode / Cursor / ZCode / Qoder / CodeBuddy / OMP / ACP（泛用）/ 自定义 Agent 注册中心等；接入文档见 [AI agent 接入](/guide/mcp/ai-agents.md) | ✅ 超额交付 |
| **M3 · 桌面可视化** | 远程看/操作 GUI | computer-use MCP + VNC 密码契约已有；noVNC 桌面（full 镜像）编排 / TOTP 编排 📋 | 🚧 |
| **M4 · 产品化** | 有人愿意用 | 编辑器套件（aiti-editor / onlyoffice / sheet-univer / word 预览）✅；PWA/移动端 📋；SSH 多机 📋；推广投放 📋 | 🚧 |
| **生态期** | 有社区 | 外部 PR、addons、引擎抽象（pi/omp 双引擎评估） | 📋 |

## 能力五层（现状）

```
UI 层：会话/服务/终端/桌面/调试 统一界面                        ← ✅（60+ 扩展生态）
调试可视化层：CDP(Chrome) · VNC(桌面) · PTY(终端)              ← ✅ 主干（MCP 通道 + aiti-cmd）
暴露层：service-tunnels（HTTP vhost + TCP 隧道 + TOTP）         ← ✅（已独立开源仓）
执行层：多 agent 后端（pi + 12 家 CLI + ACP）+ 真实工作区/Docker ← ✅
数据层：共享 pi JSONL + queue 持久化 + worktree                 ← ✅
```

## 与 devtools/桥的协同

- aiti-agent 会话内置 **aiti-bridge** 客户端：在 Web 工作台里直接操作任意注入页面
- service-tunnels `transformResponse`、vscode 扩展本地反代与 devtools 注入同语义 —— 暴露/代理的页面可复用同一套注入脚本
- M2 的 CDP 链路与 devtools 的 `page_exec`（Browser 域）能力互补：远端完整 DevTools vs 页面内轻量命令集

## 关键待验（更新于 2026-11）

- [x] WS 链路（Next middleware 不代理 WS）—— 生产消解：nginx + SSE 稳定运行，HMR websocket 走 nginx map
- [x] service-tunnels 公开化 —— [github.com/aiti-ai/service-tunnels](https://github.com/aiti-ai/service-tunnels)
- [x] CLI 桥接 P0 前置实测 —— 已完成并超额（12 家适配扩展上线）
- [ ] @oh-my-pi 双引擎深度评估（会话级适配已有：aiti-omp-agent；AgentSession/RPC 签名兼容留 M4）
- [ ] 移动端 / PWA / SSH 多机
- [ ] 推广投放首战

## 推广节奏（条件已具备，投放未启动）

- 前提自检（D7「先产品后推广」）：Docker ✅ 终端 ✅ CDP ✅ —— M1 门槛已过
- 渠道：GitHub topic（pi-coding-agent 1895 项目）→ pi.dev 包目录/Discord → Reddit/dev.to/掘金 → Docker Hub（`aitiai/pi-web` 已就绪）
- 素材：60 秒演示「docker run → 远程调试修 bug」
- 治理卖点：我们合并 PR；共享 JSONL 迁移零成本
