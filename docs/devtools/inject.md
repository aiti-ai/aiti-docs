---
title: 注入原理
icon: 💉
description: 本地 inject 细节、三种形态、宿主/iframe 路由
tags: [devtools, inject, architecture]
---

# 注入原理（本地 inject）

## 1. 三种注入形态

| 形态 | 载体 | 适用 |
|---|---|---|
| ① 主动适配 | `<script src="aiti-devtools/inject.js">` | 任意工程，开发者愿意加一行 |
| ② Chrome 扩展 / 平台内置 | 扩展注入 content script | 任意站点，免改代码 |
| ③ IDE 插件 | vscode/idea 代理 dev server 注入 | 开发期，零依赖 |

三种形态注入的是**同一份脚本**（`inject.js` 打包的 launcher），桥协议一致，可互相替换/叠加。

## 2. 注入时序

```
HTML 响应（prepend，最早执行）
  → createAitiLauncher(aiUrl, {bridgeBase, bridgeToken})
  → 初始化 aiti-devtools 迷你 client（DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser 8 域）
  → Inspector UI 挂载（右下角 💬/🎯）
  → 宿主自身 client 注入（__AITI_POST__ 回调，source='self'）
  → 同源 iframe 批量注入（injectAllIframes + MutationObserver 兜底动态 iframe）
  → (可选) 连 MCP 桥 SSE（mcpConnect 注册，EventSource 长连）
  → 页面把 instanceId 持久化 localStorage（刷新复用，不断线）
```

> prepend 语义与 service-tunnels `transformResponse` 一致——同一套注入脚本可被 Web 工作台隧道复用。

## 3. 宿主 ⇄ iframe / 宿主 ⇄ self 路由

### 消息信封

```js
{
  __aiti: 1,            // 协议标记
  type: 'aiti_exec',    // aiti_* 命名空间
  payload: {...},      // 类型负载
  requestId: 'req_1',  // 异步命令关联
  _f: 'f0' | undefined // 下行定向：目标 iframe frameId；缺省 = host
}
```

| 方向 | 说明 |
|---|---|
| host → iframe | `postMessage({__aiti:1, _f:frameId, type, payload}, '*')` |
| host → self | `__AITI_POST__` 回调本地派发（不走 postMessage） |
| iframe → host | `parent.postMessage`，宿主按 `e.source` 识别来源（回程不依赖 `_f`） |

### 异步命令往返

```
execInPage(cmd, args, frameId)
  → requestId 入 pendingCommands
  → postToFrame(frameId, {type:'aiti_exec'})
  → 目标 client 执行 CDP 命令
  → post({type:'aiti_exec_result', payload:{requestId, ok, result}})
  → 宿主按 requestId resolve（以 requestId 关联，不依赖 _f）
```

## 4. frameId 与 pageId

- 目标实体 = **当前活动选区所在的 document**；`frameId` 缺省/为空 = 宿主自身（`'host'`）
- 同源 iframe 用参照 `frameId`（`'f0','f1'...` = `listFrames()` 索引）定向
- `inject` 不建自建预览 iframe——目标就是宿主页自身 + 宿主内真实 iframe（上线形态）
- 完整配置 ID：`pageId = instanceId/frameId`（如 `01234/f0`），AI 只告诉这一个值

## 5. 安全边界

- 跨源 iframe 自动跳过注入（try/catch），仅可枚举、不可定向执行
- eval 会话内默认放行（面板审计可见）
- 危险命令确认卡 + 确认队列；浏览器受限操作走手势桥（用户真实点击）
- 桥 token 认证；右键/中键放行

> 相关：[CDP 命令集](/devtools/cdp-commands.md) · [MCP 桥 · 会话](/guide/mcp/session.md)
