---
title: 页面事件总线（aiti-event-bus）
icon: 📡
ext:
  id: aiti-event-bus
  name: 页面事件总线
  description: 页面事件总线归口——链式接管 __piPageEvents，全帧 SSE + publish/subscribe 服务出口，core 零改动
  soul: 一条总线，全部帧。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-event-bus/tools/deploy.mjs   # 部署到 ~/.pi/web{,-dev}/extensions/ 后 reload
  license: MIT
  tags: [event-bus, sse, page-events, services, infrastructure]
---

# aiti-event-bus

> ❝ **一条总线，全部帧。** ❞

页面事件总线归口扩展——依赖注入改造 **P0.5** 批次的落地（方案与拍板：`dev-repo/docs/dev-repo-dependency-injection-plan.md` §4-E，2026-09-06）。

总线实现归本扩展持有；core `lib/agent-page-events.ts` 不删不改，退为兜底宿主 + core 自用通道（SessionSidebar running 帧）。

## 机制：访问器属性接管

页面事件的**全部发布**（core `running`、plan-first `pf:remind`、model-check `mc:avail`、editor `ed-watch`…）都走 `globalThis.__piPageEvents.publish` 全局口。本扩展 startup 时把 `__piPageEvents` 属性**接管为访问器**：读恒得稳定 wrapper（双喂 core 前任 + 本总线，**core 零改动**）；写（模块再求值/他人重装的重赋值）被 setter 吸收为「前任更新」——turbopack dev 下 instrumentation 与路由各自惰性求值 `agent-page-events`、无条件重赋全局，换函数式接管会被冲掉，访问器方案免役且与求值顺序无关。

热重载安全：

- shutdown **守卫恢复**：仅当访问器仍是自己装的才卸下并还原前任槽（防多实例堆叠）
- reload 时主动断开全部 SSE 连接，客户端 EventSource 自动重连到新总线实例，帧不断流

## 接入面

| 面 | 契约 |
|---|---|
| SSE | `GET /api/extensions/aiti-event-bus/events` —— 全帧。message JSON 帧 `{type,...}` 与 core route 帧契约一致；named `heartbeat`（30s）不进帧分发，供判活/过代理保活 |
| 服务端服务出口 | `ctx.services.provide("aiti-event-bus.publish", { publish(type, data) })` —— 生产方发布页帧的标准通道（core P0 services 落地后生效；缺席静默，过渡期全局口并行） |
| 客户端服务出口 | `ctx.registerExtService("aiti-event-bus.subscribe", subscribePageFrames)` —— 消费方帧订阅（core P0 客户端服务面落地后生效，缺席 no-op） |
| client broker | 页面级单例 SSE（连接池保护）+ 引用计数，末位退订才关闭；帧分发/退订契约与 core `window.__piPageEventsClient` 一致 |

## 消费方接入（P2 迁移范式，缺席降级规范同款）

```js
const sub = ctx.getExtService?.("aiti-event-bus.subscribe");
const off = sub ? sub(handler)                                        // 本总线
          : window.__piPageEventsClient.subscribePageFrames(handler); // core 旧 route 兜底
```

## 生产方接入

```ts
ctx.services?.get("aiti-event-bus.publish")?.publish("my:evt", { ... });
// 过渡期等价：(globalThis as any).__piPageEvents?.publish("my:evt", { ... })
```

稳态拓扑：**2 条 SSE**——core route（SessionSidebar 自用 running）+ 本扩展 `/events`（其余全部页面消费）；消费方全部迁 ctx 后 core route 仅剩 SessionSidebar 自用。

## 结构

```
index.ts                       # server：装配 + 访问器接管 + SSE api + services 出口（防御式）
bus-core.ts                    # 纯内核（createEventBus 广播器 + installPageEventSlot 访问器接管），零宿主依赖
bus-core.test.mjs              # node --test：fan-out / 坏 sink 剔除 / 双喂 / clobber 免疫 / 守卫恢复 / 热重载堆叠
client-url.test.mjs            # node --test：兜底 basePath（//dev 主机误拼回归锚点，5 例）
client/aiti-event-bus-client.mjs  # 页面单例 broker + subscribe 服务注册（防御式）
tools/deploy.mjs               # 部署
```
