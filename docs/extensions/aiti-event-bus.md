---
title: 页面事件总线（aiti-event-bus）
icon: 📡
ext:
  id: aiti-event-bus
  name: 页面事件总线
  description: 页面事件总线归口——链式接管 __piPageEvents，v0.2 主题订阅（按 type 白名单过滤转发）+ publish-local 高频直连 + subscribe-topics 客户端出口，core 零改动；topics 唯一、禁止任何兜底
  soul: 一条总线，全部帧。
  type: dev-repo
  category: 系统工具
  version: "0.1.7"
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

页面事件总线归口扩展——依赖注入改造 **P0.5** 批次的落地（2026-09-06 拍板）。

总线实现归本扩展持有；core `lib/agent-page-events.ts` 不删不改，退为兜底宿主 + core 自用通道（SessionSidebar running 帧）。

## 机制：访问器属性接管

页面事件的**全部发布**（core `running`、plan-first `pf:remind`、model-check `mc:avail`、editor `ed-watch`…）都走 `globalThis.__piPageEvents.publish` 全局口。本扩展 startup 时把 `__piPageEvents` 属性**接管为访问器**：读恒得稳定 wrapper（双喂 core 前任 + 本总线，**core 零改动**）；写（模块再求值/他人重装的重赋值）被 setter 吸收为「前任更新」——turbopack dev 下 instrumentation 与路由各自惰性求值 `agent-page-events`、无条件重赋全局，换函数式接管会被冲掉，访问器方案免役且与求值顺序无关。

热重载安全：

- shutdown **守卫恢复**：仅当访问器仍是自己装的才卸下并还原前任槽（防多实例堆叠）
- reload 时主动断开全部 SSE 连接，客户端 EventSource 自动重连到新总线实例，帧不断流

## 接入面

| 面 | 契约 |
|---|---|
| SSE | `GET /api/extensions/aiti-event-bus/events` —— message JSON 帧 `{type,...}` 与 core route 帧契约一致；named `hello`（建连先推，`{conn, busId}`）与 named `heartbeat`（30s）不进帧分发，供判活/过代理保活 |
| 主题订阅（v0.2） | `POST /subscribe {conn, types:[...]|null}` —— 声明该连接 type 白名单（整体覆盖；null=恢复全帧，v0.1 兼容）；转发按白名单过滤，**不匹配的帧不出 SSE**（尾部 `*` 前缀通配如 `sched:*`）；高频流扩展（aiti-cmd 终端 `cmd-<id>`）靠它避免无关帧到达订阅方 |
| 连接保活 | `POST /heartbeat {conn}` —— client broker 每 90s；服务端扫描：发过心跳且 6min 未刷新判半开 → cleanup（v0.1 旧客户端不受管） |
| 服务端服务出口 | `ctx.services.provide("aiti-event-bus.publish", …)` —— 生产方发布页帧的标准通道（双喂 core route）；**`aiti-event-bus.publish-local`** —— 直连总线不喂 core route，高频大帧专用 |
| 客户端服务出口 | `ctx.registerExtService("aiti-event-bus.subscribe", subscribePageFrames)` 全帧订阅；**`aiti-event-bus.subscribe-topics`** —— `topics(handler, ["cmd-x", "sched:*"], onStatus)` 主题订阅（`h.ready` 后白名单在服务端生效，此后再拉初始快照无缝衔接）；宿主标准槽 `window.__piEventBus` + `piwe-event-bus-ready` 事件 |
| client broker | 页面级单例 SSE（连接池保护）+ 引用计数，末位退订才关闭 |

## 加载优先级 + 排队不回退（v2，2026-09-11）

- **服务端单开先行**：宿主 `instrumentation` 在 loadAll 后、startAll 前单开 `startupById("aiti-event-bus")` 先行就绪（`startupPriority: 100` 管扩展批量内排序，startAll 降序启动/shutdown 对称逆序）
- **前端 materialize 最高优先**：总线最先单独物化，其余立即项 `Promise.allSettled` 并行
- **排队不回退**：总线可用性 = manifest 部署事实定案；`getEventBus` 已部署未 ready → 订阅**排队挂起**（CONNECTING→ready 接上收帧），不返回 null、不超时；**唯一回退条件 = manifest 定案未部署**（同步 null）
- **STALE_CONN 静默重建**：`/subscribe`/`/heartbeat` 404 带 `code:"STALE_CONN"`（与路由缺失区分），客户端静默重建连接不抛 uncaught；另有 hello/heartbeat 帧携带 `busId`，变化 = 服务端 reload → 主动换连

## 消费方接入（2026-09-09 拍板：topics 唯一，禁止任何兜底）

```js
const topics = ctx.getExtService?.("aiti-event-bus.subscribe-topics");
if (!topics) return; // 总线未启用 → 功能降级，不兜底
const h = topics(handler, ["cmd-s_ab12", "sched:*"], onStatus);
await h.ready; // 白名单在服务端生效后再拉初始快照，无缝衔接
```

> 不得再写全帧订阅 / core `__piPageEventsClient` / 自建 EventSource 兜底——**历史兜底已全部删除**（STALE_CONN 语义下旧兜底会放大重连风暴）。高频流发布方走 `aiti-event-bus.publish-local`，大消息 REST 快照 + seq 去重（范式见扩展 README）。

## 生产方接入

```ts
ctx.services?.get("aiti-event-bus.publish")?.publish("my:evt", { ... });   // 低频状态帧（双喂 core route）
ctx.services?.get("aiti-event-bus.publish-local")?.publish("cmd-x", { ... }); // 高频大帧（直连总线）
```

稳态拓扑：**2 条 SSE**——core route（SessionSidebar 自用 running）+ 本扩展 `/events`（其余全部页面消费）。

## 结构

```
index.ts                       # server：装配 + 访问器接管 + SSE api + /subscribe /heartbeat + services 出口
bus-core.ts                    # 纯内核（createEventBus 广播器 + installPageEventSlot 访问器接管），零宿主依赖
bus-core.test.mjs              # node --test：fan-out / 坏 sink 剔除 / 双喂 / clobber 免疫 / 守卫恢复 / 热重载堆叠
client-url.test.mjs            # node --test：兜底 basePath（//dev 主机误拼回归锚点，5 例）
stale-rebuild.test.mjs / topic-match.test.mjs / bus-id.test.mjs   # STALE_CONN 重建 / 白名单匹配 / busId 换连
client/src/aiti-event-bus-client.mjs  # 页面单例 broker + subscribe/subscribe-topics 服务注册
tools/deploy.mjs               # 部署
```
