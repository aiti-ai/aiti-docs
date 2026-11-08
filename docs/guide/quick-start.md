---
title: 快速开始（aiti-agent 工作台）
icon: 🚀
description: 安装 aiti-agent → 启动 → 首启配置 → 日常入口，5 分钟上手 Web 工作台
tags: [guide, quick-start, pi-web, workbench]
---

# 快速开始（aiti-agent 工作台）

5 分钟装好 **aiti-agent**（自托管 Web 工作台，npm 包 `@aiti-ai/pi-web`）并开聊。

> 想要的是「AI 操作网页」的**调试工具链**（aiti-devtools：注入 → 起桥 → 接 AI）？那是另一条主线：[devtools 快速开始](/devtools/quick-start.md)。安装方式的完整说明（三种方式 / 系统要求 / 常用命令 / 脚本透明性）见 [安装](/guide/install.md)。

## 1. 安装（选一种）

:::: tabs#install

@tab npm

```bash
# Node.js ≥ 22.19
npm install -g @aiti-ai/pi-web@latest
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

@tab Docker

```bash
docker run -d -p 30142:30142 \
  -v aiti-data:/opt/aiti -v ~/workspace:/workspace \
  aitiai/pi-web:core        # GUI/语音/隧道全家桶 → :full
```

::::

## 2. 启动

```bash
pi-web
```

CLI 在服务就绪后自动打开浏览器（默认 [http://127.0.0.1:30141](http://127.0.0.1:30141)；Docker 为 30142）。未打开则手动访问。

## 3. 首启配置

- **模型**：左侧 **Models** 面板登录订阅或填 API key；也可以在 🧙 向导里用「从其他 agent 导入」（自动扫描 codex / zcode / opencode 的现有配置）
- **会话引擎**：[pi coding agent](https://github.com/earendil-works/pi) CLI 安装脚本会自动检测（缺失时提示 `npm install -g @earendil-works/pi-coding-agent`）

## 4. 开箱即用（60+ 内置扩展）

无需逐个安装，常用的入口一眼可见：

| 入口 | 干什么 |
|---|---|
| 🧩 扩展 | 扩展管理器：启停 / 在线安装 / 功能开关 |
| 📋 会话面板 | 多 agent 会话统一看管（All Sessions） |
| ⚡ 命令 | 真 PTY 终端 + 常用命令收藏 |
| 🧙 模型 | 模型向导 / 可用性检查 / 余额面板 |
| 🔀 服务隧道 | 端口暴露给外网（TOTP） |
| 📡 模型检查 | 可用性探测 / 限流提醒 |

全部清单与文档见 [扩展注册表](/extensions/)。

## 5. 接入更多 agent（可选）

装了对应 CLI 的 agent（Claude Code / Codex / Cursor / ZCode / Qoder / 任意 ACP…）会**自动出现**在新建会话的后端列表里；受控登录统一在 [Agent 管理](/extensions/aiti-agent-manager.md) 面板发起。IM（钉钉/飞书/微信）经 [aiti-channels](/extensions/aiti-channels.md) 接入后群里也能派活。

## 下一步

- [aiti-agent · 产品总览](/products/aiti-agent.md) —— 能力全景与定位
- [扩展注册表](/extensions/) —— 76 个扩展按分类浏览
- [开发血缘](/guide/lineage.md) —— AI 改动的全链路溯源
- [devtools 快速开始](/devtools/quick-start.md) —— 「AI 操作网页」调试工具链（另一条主线）
