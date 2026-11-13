---
home: true
title: 自托管 AI 开发工作台 · pi-web 增强发行版
description: 基于开源 pi-web 打造的自托管 AI 开发工作台：pi / Claude Code / Codex / Qoder 多 agent 一个面板全看管，60+ 内置扩展开箱即用，模型多 key 轮转与聚合，终端/VNC/RDP 远程无忧，IM 里遥控 AI——一条命令安装，浏览器即用。
heroImage: /logo.svg
heroText: 自托管 AI 开发工作台
tagline: "aiti（发音 /aiti/）—— 基于 pi-web 增强：多 agent 同堂 · 60+ 内置扩展 · 一条命令安装、浏览器即用"
keywords: 自托管, AI 工作台, aiti-agent, pi-web, pi web ui, 多 agent, 模型聚合, 多 key 轮转, IM 遥控, 终端, VNC, RDP, AI 调试, 页面注入, MCP 桥, Claude Code, AI agent
actions:
  - text: 快速安装
    link: /guide/install.md
    type: primary
  - text: 产品矩阵
    link: /products/
    type: secondary

features:
  - title: aiti-agent · Web 工作台
    details: 自托管（基于 pi-web 构建），一条命令安装、浏览器即用；60+ 内置扩展开箱即用，兼容 pi CLI / IDE 扩展操作同一批会话
    link: /products/aiti-agent.md
  - title: 多 agent 同堂
    icon: 🤖🤖
    details: pi / Claude Code / Codex / Qoder / 任意 ACP agent 一个面板全看管——历史会话不是化石，点一下就复活
    link: /extensions/session-manager.md
  - title: 模型管理一条龙
    icon: 🧙
    details: 添加向导（目录搜索 / 贴地址反向匹配）+ 多 key 粘性轮转 + 模型聚合 + 可用性探测——告别模型管理焦虑
    link: /extensions/aiti-model-wizard.md
  - title: 扩展注册表
    icon: 🧩
    details: 76 个扩展按分类浏览，aiti-agent 自动发现；每个功能都长着「AI 帮助点」——一句话生成配置、AI 回填表单、审核后落地
    link: /extensions/
  - title: 终端 · VNC · RDP
    icon: 🖥️
    details: 真 PTY 命令终端；无头服务器虚拟屏 + 浏览器 VNC；浏览器直连 RDP 远程桌面——没有显示器，也有舞台
    link: /extensions/aiti-cmd.md
  - title: IM 里遥控 AI
    icon: 💬
    details: 钉钉/飞书/微信接入工作台——人不在电脑前，群里发句话 AI 照样干活交差
    link: /extensions/aiti-channels.md
  - title: 页面调试 · aiti-devtools
    icon: 🛠️
    details: 把 AI 请到页面开发现场（Vite / webpack / Nuxt / Astro 插件 + MCP 桥 + 跨宿主适配 DSH / OpenClaw / OpenCode）
    link: /devtools/
  - title: 开放生态
    icon: 🌍
    details: npm scope @aiti-ai · GitHub 组织 aiti-ai · 官网 aiti.pw

copyright: false
footer: MIT Licensed | Copyright © 2026 aiti-ai
---

<div style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 8px">
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img style="display:inline-block" alt="npm version" src="https://img.shields.io/npm/v/@aiti-ai/pi-web?label=%40aiti-ai%2Fpi-web"></a>
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img style="display:inline-block" alt="npm downloads" src="https://img.shields.io/npm/dm/@aiti-ai/pi-web"></a>
  <a href="https://github.com/aiti-ai/aiti-ai"><img style="display:inline-block" alt="GitHub stars" src="https://img.shields.io/github/stars/aiti-ai/aiti-ai?style=flat&logo=github"></a>
  <a href="https://www.npmjs.com/package/@aiti-ai/pi-web"><img style="display:inline-block" alt="license" src="https://img.shields.io/npm/l/@aiti-ai/pi-web"></a>
</div>


### 一条命令，浏览器即用

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest && pi-web
```

首启后在 **Models** 面板登录或填 API key 即可开聊——60+ 内置扩展已就位，无需逐个安装。三种安装方式（npm / curl / PowerShell）见 **[安装指南](/guide/install.md)**。

## 为什么选 aiti？

> [pi-web](https://github.com/agegr/pi-web) 是出色的 pi Web UI。aiti 在**同源兼容**的基础上（pi CLI / IDE 扩展操作同一批会话），把它扩展成一个开箱即用的完整工作台：

| 能力 | 原版 pi-web | aiti |
| --- | :---: | :---: |
| Web UI · 会话 / 项目 / worktree 管理 | ✅ | ✅ 同源兼容 |
| **多 agent 同堂**（一个面板全看管） | — | ✅ pi / Claude Code / Codex / Qoder / 任意 ACP agent |
| **60+ 内置扩展** | 插件机制 | ✅ 开箱即用：终端 / VNC / RDP / IM 接入 / 隧道…… |
| **模型管理一条龙** | — | ✅ 添加向导 + 多 key 粘性轮转 + 聚合 + 可用性探测 |
| **页面调试注入**（AI 进驻网页） | — | ✅ aiti-devtools：Vite / webpack / Nuxt / Astro 插件 |
| **配置安全网** | — | ✅ diff 查看 / 一键回滚 / 崩溃 watchdog 自恢复 |

## ✨ 系统特色

> 每一条特色背后都是开箱即用的扩展——点进去看实现。页面调试工具链（aiti-devtools）的特色见 [/devtools/](/devtools/)。

| 特色 | 一句话说明 | 对应扩展 |
| --- | --- | --- |
| 🤖🤖 **多 agent 同堂** | pi / Claude Code / Codex / Qoder / 任意 ACP agent 一个面板全看管——历史会话不是化石，点一下就复活 | [session-manager](/extensions/session-manager.md) · [claude-code](/extensions/aiti-claude-code-agent.md) · [codex](/extensions/aiti-codex-agent.md) · [qoder](/extensions/aiti-qoder-agent.md) |
| 🧙 **模型管理一条龙** | 模型添加向导（目录搜索 / 贴地址反向匹配 / 自动探测）+ 多 key 粘性轮转 + 模型聚合（组合模型，成员可配**承接类别**：图形/文本专用分工路由）+ 可用性探测（429 限流识别与恢复预测）——告别模型管理焦虑 | [aiti-model-wizard](/extensions/aiti-model-wizard.md) · [aiti-model-check](/extensions/aiti-model-check.md) |
| 👥 **子代理舰队** | 一句话派活：scout 侦察 / worker 干活 / reviewer 审核 / oracle 顾问，并行或流水线，Fleet 面板盯进度 | [aiti-subagents](/extensions/aiti-subagents.md) |
| 🖥️ **终端 · VNC · RDP，远程无忧** | 真 PTY 命令终端；无头服务器虚拟屏 + 浏览器 VNC；浏览器直连 RDP 远程桌面——没有显示器，也有舞台 | [aiti-cmd](/extensions/aiti-cmd.md) · [aiti-ui-env](/extensions/aiti-ui-env.md) |
| 💬 **IM 里遥控 AI** | 钉钉/飞书/微信接入工作台——人不在电脑前，群里发句话 AI 照样干活交差 | [aiti-channels](/extensions/aiti-channels.md) |
| 🌐 **端口映射 · 外部访问** | 服务端口自动发现，一键暴露 http/https/tcp 隧道（TOTP 认证）；远程调试器一键注入 | [service-tunnels](/extensions/service-tunnels.md) · [aiti-debug-inject](/extensions/aiti-debug-inject.md) |
| 📱 **全功能小屏适配** | 弹窗拖拽/缩放/持久化，小屏自动全屏；聊天与面板全面小屏优化——手机上开发从此不是梦；语音输入又快又顺，就是费电，记得配充电宝 🔋 | [aiti-float](/extensions/aiti-float.md) · [aiti-ai-input](/extensions/aiti-ai-input.md) |
| 🤖 **全程 AI Helper** | 每个扩展、每个功能都长着「AI 帮助点」：一句话生成配置、AI 回填表单、审核后落地——哪个功能都能 AI 辅助完成 | [aiti-helper](/extensions/aiti-helper.md) |
| 🕹️ **Java 后端直接调** | 给 AI 用的 Arthas++：JVM 内任意修改、Mock/SQL 拦截模拟、热更新 controller、诊断采样、Tunnel 桥多端点纳管，57 工具全可逆——Spring Boot / Solon 调试不必重启 | [aiti-testagent](/extensions/aiti-testagent.md) |
| 🧬 **开发血缘** | git 记录改动的内容，血缘记录改动的因果：每行代码可归因到会话、prompt、方案与操作——可评审、可回滚、可检索 | [📖 理念](/guide/lineage.md) · [评审](/extensions/aiti-git-review.md) · [方案先行](/extensions/aiti-plan-first.md) |
| 🛡️ **配置安全网** | AI/人改坏配置：有 diff 可看、一键回滚；系统崩了，命令行 watchdog 不依赖出问题的系统本身兜底恢复 | [aiti-configs](/extensions/aiti-configs.md) |
| 🧩 **还有更多** | 消息导航、Token 用量看板、编辑器当场改码、草稿保护、prompt 收藏…… 76 个扩展一次看全 | [扩展注册表](/extensions/) |
| 🛠️ **页面调试工具链（aiti-devtools）** | AI 进驻网页，面对面调试——看得见、点得着、改得了；已适配 DSH / OpenClaw / OpenCode 跨宿主 | [aiti-devtools 总览 →](/devtools/) |

## 什么是 aiti？

**aiti**（发音 `/aiti/`，谐音「阿嚏」——「AI 开发像打喷嚏一样简单自然」）是一个以 **pi** 为引擎的 **AI 开发工具生态**：

- **主产品 · Web 工作台**：`aiti-agent` 是自托管的个人 AI 开发工作台（npm 包 [`@aiti-ai/pi-web`](/guide/install.md)，基于开源项目 pi-web 构建，来历见[项目起源](/guide/origin.md)）——
  浏览器为主操作面，**60+ 内置扩展**开箱即用：多 agent 会话管理、模型管理、IM 接入、终端/虚拟屏/远程桌面、服务隧道、开发血缘、配置安全网……
  与 pi 同源兼容，pi CLI 与 pi IDE 扩展可操作同一批会话；一条命令安装，Docker 一键启动。
- **页面调试工具链**：`aiti-devtools` 注入到 Vite / Vue / Next / Svelte 等主流开发工具，`aiti-bridge` 作为 MCP 桥改造任意 AI agent——
  把 AI 请到页面开发现场，页面就是可调试、可交互、可回答 AI 问题的对象。详见 **[/devtools/](/devtools/)**。

### 安装方式（npm / 脚本 / Docker）

> 三种方式任选，详见 **[安装指南](/guide/install.md)**（系统要求 / 常用命令 / 脚本透明性）。

:::: tabs#install

@tab npm

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest
pi-web          # 启动服务并打开浏览器（默认 http://127.0.0.1:30141）
```

@tab macOS / Linux

```bash
# 无需 npm：GitHub Releases 预构建产物 + sha256 校验，装到用户目录
curl -fsSL https://aiti.pw/install.sh | sh
```

@tab Windows

```powershell
# PowerShell 5.1+（Windows 10/11 自带）
irm https://aiti.pw/install.ps1 | iex
```

::::

## 产品矩阵速览

| 层 | 产品 | 包名 / 形态 | 定位 |
|---|---|---|---|
| 入口层 | aiti-agent | `@aiti-ai/pi-web` · Web + Docker | 自托管 AI 开发工作台（基于 pi-web），60+ 内置扩展 |
| 注入层 | aiti-devtools 系列 | `@aiti-ai/aiti-devtools-*` · 插件/SDK | 嵌入主流开发工具，本地注入 |
| 桥接层 | aiti-bridge | `@aiti-ai/aiti-bridge` · 本地服务 | 配置 devtools、改造 AI agent |
| Agent 层 | 任意 AI agent | Claude Code / Cursor / IDE AI | 经 MCP 操作页面、直达 IDE 窗口 |

> 完整矩阵见 [产品矩阵](/products/)，整体规划见 [路线图](/roadmaps/master-plan.md)，页面调试工具链详见 [/devtools/](/devtools/)。

### 致谢

构建于 [pi](https://pi.dev) 与 [pi-web](https://github.com/agegr/pi-web) 之上。
