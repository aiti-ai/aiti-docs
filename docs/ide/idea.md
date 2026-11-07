---
title: aiti-devtools-idea
icon: 🟨
description: JetBrains 插件 — 注入 + 桥 + AI Assistant 集成
tags: [ide, idea, jetbrains]
---

# aiti-devtools-idea

> 状态：📋 规划中。支持 IntelliJ IDEA / PyCharm / WebStorm / GoLand / Android Studio（JetBrains 平台）。

## 功能

| 功能 | 说明 |
|---|---|
| 一键注入 | 代理 dev server 注入 aiti-devtools（与 VS Code 版同构） |
| 自动起桥 | 启动/停止 `aiti-bridge`，端口可配 |
| 自动配置 MCP | 写 JetBrains MCP 配置（`mcp.xml`），让 **AI Assistant** 具备页面工具 |
| AI 窗口 aiti 面板 | Tool Window 嵌入：pageId、sessions、作答卡、事件日志 |
| 作答卡直达 | `user_*` 交互直接在 AI Assistant 窗口作答 |
| 源码直达 | `open_file` 用 IDE API 打开文件并定位行（`code --goto` 同语义） |

## 菜单

```
Tools → aiti
  ├─ Enable Page Debugging   # 注入 + 起桥 + 配置 MCP
  ├─ Stop Debugging
  ├─ Bridge Panel            # pageId / sessions / 事件
  └─ Re-inject               # 修复双注入
```

## 平台差异注意

| 差异 | 处理 |
|---|---|
| AI Assistant 版本差异 | 老版本无 MCP 支持 → 回退「打开 cockpit」+ 手动复制 pageId |
| 多语言 IDE | 面板文案走 IDE 本地化；桥协议与语言无关 |
| Android Studio | 注入目标是 Web 页面（dev 构建），真机调试走 Chrome CDP |

## 用户旅程

```
1. 打开工程 → Tools → aiti → Enable Page Debugging
2. dev server 自动代理注入；AI Assistant 自动获得 aiti MCP 工具
3. 「帮我调一下这个表单校验」→ AI：page_exec 触发校验 → 发现 email 正则写错
4. AI：user_choose「方案 A 修复正则 / 方案 B 换校验库」→ AI 窗口弹出选择卡
5. 选择方案 A → AI 改代码 → 页面自动验证
```

> 相关：[IDE 插件产品页](/products/aiti-ide-plugins.md) · [改造 AI agent](/guide/mcp/ai-agents.md)
