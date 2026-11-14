---
title: 扩展开发手册
icon: 🔧
description: pi-web（aiti-agent）扩展开发完整手册——从零写一个扩展到上架的全流程参考
keywords: 扩展开发, pi-web 扩展, aiti 扩展, extension development, ExtSlot, ctx API, feature 管理
---

# 扩展开发手册

> aiti-agent（pi-web）的业务功能全部以**扩展**实现，核心只保留挂载点与契约。
> 本手册是面向扩展作者的完整开发参考：从零写一个扩展 → 调试 → 发布 → 登记的全流程。

## 学习路径

| 阶段 | 读什么 | 目标 |
|---|---|---|
| ① 框架总览 | [aiti-agent 扩展点](/devtools/extension-points.md) | 15 分钟看懂模型：目录约定、加载链路、扩展对象形状 |
| ② 动手 | [快速开始：从零写一个扩展](/ext-dev/quick-start.md) | 跟着教程做出第一个可跑的扩展（server API + toolbar 按钮） |
| ③ 契约参考 | [扩展对象契约](/ext-dev/contract.md) · [插槽全表](/ext-dev/slots.md) | 写的时候随手查：entry 全字段、40+ 插槽与 props 契约 |
| ④ API 参考 | [服务端 ctx API](/ext-dev/server-api.md) · [客户端 ctx API](/ext-dev/client-api.md) | `startup(ctx)` / `register(ctx)` 两份上下文的完整成员清单 |
| ⑤ 专题 | 下方「专题指南」 | 跨扩展调用、数据存储、feature、AI 集成等垂直主题 |
| ⑥ 发布 | [部署与热重载](/ext-dev/deploy.md) · [ext 元数据规范](/extensions/spec.md) | 装到实例上跑起来、版本化、登记进文档站注册表 |

## 手册章节

| 章节 | 内容 | 状态 |
|---|---|---|
| [快速开始](/ext-dev/quick-start.md) | 从零写一个扩展：目录 → index.ts → 热重载 → client bundle → 发布 | ✅ |
| [扩展对象契约](/ext-dev/contract.md) | `PiWebExtension` 全字段参考（含 features/dependsOn/provides/publicApi 等新字段） | ✅ |
| [插槽全表](/ext-dev/slots.md) | 40+ 插槽分组速查 + 类型契约（ExtSlotContractMap）+ 声明式条目 | ✅ |
| [服务端 ctx API](/ext-dev/server-api.md) | `ExtServerContext` / `ExtCoreApi` / services / features / sessionProviders / invokeAI / agent 钩子 | ✅ |
| [客户端 ctx API](/ext-dev/client-api.md) | `ExtClientContext` 全成员（React 全家桶 / i18n / 插槽 / 行为级扩展点 / 宿主能力） | ✅ |
| [feature 声明与消费](/ext-dev/features.md) | ExtFeature 三类型、`tool.*` 约定、`ctx.features` / `getFeatures` 消费链 | ✅ |
| [AI 集成](/ext-dev/ai.md) | `invokeAI` 通用调用 / `server.agent` per-session 扩展点 / ai-helper 技能自管理 | ✅ |
| [部署与热重载](/ext-dev/deploy.md) | 目录分层、dev/prod 隔离、reload API、extman 安装、版本化 | ✅ |
| [i18n 与安全](/ext-dev/i18n-security.md) | `ui.i18n` 表 + 类型契约；fail-closed 门禁 / fileAccess / publicApi 白名单 | ✅ |

## 专题指南（既有文档，本手册直接引用）

| 文档 | 内容 |
|---|---|
| [扩展服务与跨扩展调用规范](/guide/ext-services.md) | 🔌 `ctx.services` 定位器：提供/消费/降级；依赖与能力模型（dependsOn/provides/takeover 详解）；全局量红线（**写扩展必读**） |
| [扩展数据与存储规范](/guide/ext-data.md) | 💾 config/state/cache 三层判定决策树、行为契约、迁移铁律（**写扩展必读**） |
| [懒加载契约](/guide/ext-lazy-loading.md) | 两段式：薄 entry 常驻 + 重 UI 按需物化（clientImmediately:false） |
| [参考实现：demo](/extensions/demo.md) | 全插槽演示扩展——框架先有例子，人才有样子 |
| [构建模板：ext-jsx-client](/extensions/ext-jsx-client.md) | client 想用 JSX + TypeScript + npm 依赖时的共享模板（vite lib mode + host-shim） |

## 权威源声明

宿主契约的唯一事实源是 **aiti-agent 源码**（文档可能滞后于代码）：

| 契约 | 源文件 |
|---|---|
| 扩展对象 / 插槽名 / feature / 依赖能力模型 | `lib/ext/types.ts`（`PiWebExtension` / `ExtSlotName` / `ExtFeature`） |
| 客户端 ctx 全成员 | `components/ExtSlots.tsx`（`ExtClientContext`） |
| 目录与数据分层实现 | `lib/ext/data-dir.ts` |
| 加载器 / 入口文件名 | `lib/ext/loader.ts` |

发现文档与源码不一致时，以源码为准，并欢迎 PR 修文档。

## 红线速览（踩过坑的浓缩，展开见对应章节）

1. **跨扩展调用只走 `ctx.services` / `registerExtService`**——禁新增 `window.__<extId>*` 全局穿透（[规范](/guide/ext-services.md)）。
2. **数据只写三层目录**（configDir/stateDir/cacheDir）——**`ctx.dataDir` 已移除，访问即抛**（[规范](/guide/ext-data.md)）。
3. **插槽 extra 只喂数据，回调一律走服务**——随渲染变的值留 props，写操作走 `pi-web.*` 客户端服务。
4. **`onAgentSession` 必须幂等**——idle GC 与热重载会重复触发（[AI 集成](/ext-dev/ai.md)）。
5. **client 不 import react**——`h` 与 hooks 由宿主传入；Rules of Hooks：hooks 必须在条件返回之前调用。
6. **version 不手写**——唯一事实源是 `package.json`，entry 里的值只是老扩展兜底。
7. **懒加载扩展**：无 ui[slot] 静态条目的服务触发型扩展，标 `clientLazyVia: "service"` 豁免静态诊断（[懒加载](/guide/ext-lazy-loading.md)）。
