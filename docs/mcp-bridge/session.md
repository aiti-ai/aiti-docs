---
title: 会话体系
icon: 🪪
description: pageId = instanceId/frameId、发现、复用、刷新不断线
tags: [mcp-bridge, session, pageId]
---

# 会话体系（pageId）

桥的会话模型：**AI 只用一个词 `pageId`，其余全部自动**。

## 1. ID 归属

| 旧 | 新 | 语义 | 示例 |
|---|---|---|---|
| `token` | **`instanceId`** | 连接身份（桥分配） | 带端口页面用端口号 `6513`；否则随机 `qx482` |
| `uid` | **`frameId`** | 目标 frame（CDP 术语） | `host` / `f0` / `f1` |
| — | **`pageId`** | 最终配置 ID = instanceId/frameId | `01234/f0` |

- 页面连桥：申请 `instanceId` → 登记各 `frameId` → 拼装 `pageId`，**页面侧掌控**并上报给桥
- 桥只做登记与路由（pageId → instanceId 找连接 + frameId 找目标 frame）
- AI 只是携带：boot 收到 pageId（默认目标 frame）原样回传；多个 frame → 每个 frame 一个 pageId

## 2. 生命周期（刷新不断线）

```
页面打开 → claim(instanceId + secret + pageKey)
  → localStorage 持久化 {instanceId, secret}（按 pageKey）
  → reload / SSE 断开（Page.reload 等）→ TTL（默认 10 分钟）内复用旧 instanceId
  → 仅当：旧 id 被其他活跃连接占用（冲突）或 TTL 过期 → 生成新 id + 更新 localStorage + 告知 AI
```

- **secret 防串台**：claim 复用旧 id 必须带 secret，桥校验 `idRegistry[instanceId].secret` 匹配才复用；不匹配 → 拒绝复用、生成新 id
- 效果：**只有原页面能复用自己的 pageId**，AI 持有的旧 pageId 持续有效，MCP 执行 reload 不断线

## 3. 发现（AI 侧）

```bash
curl http://localhost:8777/bridge/sessions
```

```json
[
  {
    "instanceId": "01234",
    "frameId": "host",
    "pageId": "01234/host",
    "url": "http://localhost:5173",
    "frameworks": ["vue"],
    "active": true,
    "lastSeen": 1780000000000
  },
  {
    "instanceId": "01234",
    "frameId": "f0",
    "pageId": "01234/f0",
    "url": "http://localhost:5173/iframe-page",
    "frameworks": ["react"],
    "active": true,
    "lastSeen": 1780000000000
  }
]
```

AI 引导建议：先 `bridge_status`（或 `GET /bridge/sessions`）→ 选择默认 pageId → 其余操作全部带 pageId。

## 4. 配置最小化

- inspect 只需传 AI 地址（`aiUrl`）——宿主把环境（pageId）构建好，AI 窗口打开即用
- IDE 插件自动配置：桥地址 + token + 当前工程 pageId 写入 MCP 配置，用户零手工

> 相关：[MCP Server](/mcp-bridge/server.md) · [改造 AI agent](/mcp-bridge/ai-agents.md)
