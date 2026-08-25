---
title: 什么是 aiti
icon: ✨
description: aiti 的定位、品牌、三条产品主线
tags: [guide, concept]
---

# 什么是 aiti

**aiti**（阿嚏 ——「AI 开发像打喷嚏一样简单自然」）是一个以 **pi** 为引擎的 **AI 开发工具生态**，由三条产品主线组成：

## 品牌与身份

| 项 | 值 |
|---|---|
| 品牌 | aiti（2026-08-08 定稿） |
| 域名 | `https://aiti.pw` |
| GitHub 组织 | `aiti-ai` |
| npm scope | `@aiti-ai`（裸名 3-4 字母被 npm 防抢注风控拒绝） |
| 一句话 | AI 开发像打喷嚏一样简单自然 |

## 三条主线

### 主线 A：aiti-agent — Web 主战场

以 **pi** 为引擎、自托管的个人 AI 开发工作台。构建于开源项目 **pi-web** 之上，产品身份独立（来历见[项目起源](/guide/origin.md)）。

- 浏览器是唯一操作面，`docker run` 一键起
- 全生态唯一的 service-tunnels（HTTP vhost + TCP 隧道 + TOTP）与 queue 崩溃恢复
- 规划：内置终端 → Chrome CDP 远程调试 → CLI 桥接 → noVNC 桌面 → 工具市场

### 主线 B：aiti-devtools — 本地注入生态

把 AI 请到页面开发现场。**嵌入各个主流开发工具**（Vite / Vue / Next / React / Svelte），**本地 inject**：

- 注入 `aiti-devtools` 迷你 client + Inspector 悬浮 UI + 8 域 42 命令类 CDP 命令集
- 框架源码定位：React/Next/Vue/Svelte dev 构建 → `{framework, file, line}`
- 三种形态：主动适配（script 引入）/ Chrome 扩展 / IDE 插件

### 主线 C：aiti-mcp-bridge — AI agent 改造

桥接层产品，核心三件事：

1. **配置 aiti-devtools 使用**：桥地址/token/pageId，配置最小化
2. **改造 AI agent**：让 Claude Code / Cursor / IDE 内置 AI 拥有操作页面、询问用户的能力
3. **直达 IDE AI 窗口**：支持 aiti-devtools、aiti-devtools-vscode/idea 等插件完成注入，**通过 mcp-bridge 直接把消息发到 IDE 里的 AI agent 窗口**

## 与 pi / pi-web 的关系

| 关系 | 说明 |
|---|---|
| pi = 引擎 | earendil-works/pi 是执行内核（每日发版，mise 管理）；aiti 接受这个依赖 |
| pi-web = 起点 | agegr/pi-web 是开源的 Web 壳，我们构建于其上（含全生态唯一的 service-tunnels / queue 恢复）；产品身份独立，来龙去脉见[项目起源](/guide/origin.md) |
| 竞品 fork | jmfederico（栈不同不可合并）、PiClaw（拼定位不拼功能）、omp（远期双引擎选项） |

## 生态全景

```
         aiti.pw（官网/文档/端点）
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
aiti-agent   aiti-devtools  aiti-mcp-bridge
(Web 工作台)  (本地注入生态)  (AI agent 改造)
   │            │            │
   └───── pi 引擎（earendil-works/pi）─────┘
```

> 下一步：[架构](/guide/architecture.md) 或直接看 [产品矩阵](/products/README.md)。
