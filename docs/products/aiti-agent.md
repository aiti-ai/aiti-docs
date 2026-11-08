---
title: aiti-agent
icon: 🤖
description: 自托管个人 AI 开发工作台（基于 pi-web 构建），Web 主战场
tags: [product, aiti-agent, pi-web]
---

# aiti-agent — Web 主战场

> **一句话**：以 **pi** 为引擎、自托管的个人 AI 开发工作台 —— 浏览器为主操作面（与 pi 同源兼容：pi CLI / pi IDE 扩展操作同一批会话），`docker run` 一键起，`just get` 装工具。
> **来历**：构建于开源项目 pi-web 之上，越用越深、越改越多，最终按自己的方式发版（见[项目起源](/guide/origin.md)）。

## 1. 定位

| 维度 | 结论 |
|---|---|
| 干什么 | 自建 AI 开发工作台（不是"再做一个 pi-web"，是"用 pi 做自己的工具"） |
| 地基 | 构建于开源项目 agegr/pi-web（含全生态唯一的 service-tunnels / queue 恢复） |
| 引擎 | pi（earendil-works/pi，每日发版，mise 管理版本） |
| 差异化 | 共享 pi JSONL 会话 + 真实工作区 + 服务隧道 + 远程调试可视化（无人五层齐全） |
| 形态 | Docker 单容器（core/full）→ 浏览器 + 移动端 |
| 北极星 | 自己日常可用 → 外部 10+ 活跃用户 → 5+ 外部贡献者 |

## 2. 能力五层

```
UI 层：会话/服务/终端/桌面/调试 统一界面
调试可视化层：CDP(Chrome) · VNC(桌面) · ttyd(终端)   ← 规划
暴露层：service-tunnels（HTTP vhost + TCP 隧道 + TOTP）← 已有
执行层：pi agent（SDK 进程内）+ 真实工作区/Docker     ← 已有+规划
数据层：共享 pi JSONL + queue 持久化 + worktree       ← 已有
```

## 3. 核心能力清单

| 能力 | 状态 | 说明 |
|---|---|---|
| service-tunnels（隧道 + TOTP 认证） | ✅ 全生态唯一 | HTTP vhost + TCP 隧道，零改动暴露 30142/6080/7681/9222/5900 |
| queue 持久化 / 崩溃恢复 | ✅ 全生态唯一 | 任务队列重启不丢 |
| worktree 分组 / i18n 框架 | ✅ 领先 | 会话按工作区分组 |
| 内置终端（ttyd / node-pty） | 📋 M1 | 远程执行服务端 Terminal |
| Docker 一键（core/full） | 📋 M1 | `docker run aiti` |
| Chrome CDP 远程调试 | 📋 M2 | 9222 暴露 + DevTools + cdp 工具 |
| CLI 桥接（Claude Code / Codex / OpenCode） | 📋 M2.5 | 任意 AI CLI 会话桥接进 Web |
| noVNC 桌面可视化 | 📋 M3 | 任意 GUI 远程看/操作 |
| `just get` 工具市场 | 📋 M1 起步 | just + mise + apt 分层安装 |
| PWA / 移动端 / SSH 多机 | 📋 M4 | 远期 |

## 4. 与 pi / pi-web 的关系

- **pi = 引擎**：接受每日发版依赖，mise 管理版本；远期可抽象（M4 再议，omp 双引擎为备选）。
- **pi-web = 起点**：构建于其开源代码之上，产品身份独立（独立品牌 aiti、独立域名、独立 npm scope）。完整的来龙去脉见[项目起源](/guide/origin.md)。

## 5. 与生态关系

| 项目 | stars | 定位 | 我们 |
|---|---|---|---|
| agegr/pi-web（上游） | 3.7k | 原始版 | 我们构建于其上，按自己的方式演进 |
| jmfederico | 474 | 服务化重写 | 只能借鉴功能，不能合并代码（fork:false，栈不同） |
| PiClaw | 814 | Docker 全栈 | 拼定位不拼功能：共享 JSONL 会话 + 真实工作区 + 隧道 |
| omp（Oh My Pi） | 22.5k | Rust 核心 | 双引擎远期选项（M4 评估 SDK 兼容性） |

## 6. 使用入口

npm 包 **`@aiti-ai/pi-web`**（自带 60+ 内置扩展），三种安装方式详见 **[安装指南](/guide/install.md)**：

:::: tabs#install-short

@tab npm

```bash
npm install -g @aiti-ai/pi-web@latest && pi-web
```

@tab macOS / Linux

```bash
curl -fsSL https://aiti.pw/install.sh | sh
```

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

::::

```bash
# 浏览器打开（aiti.pw 是官网/文档站，工作台入口在本地端口）
open http://localhost:30141
```

Docker 一键（镜像标签仅 core / full，无 lite）：

```bash
docker run -d -p 30142:30142 -v aiti-data:/opt/aiti -v ~/workspace:/workspace aitiai/pi-web:core   # 已发布（Docker Hub；GUI/语音/隧道 → :full）
```

> 规划详见 [路线图 · aiti-agent](/roadmaps/aiti-agent.md) 与 [整体规划](/roadmaps/master-plan.md)。
