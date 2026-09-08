---
title: 扩展服务与跨扩展调用规范
icon: 🔌
description: pi-web 扩展间通信的唯一正道：ctx.services 定位器——怎么提供、怎么消费、怎么降级；全局量红线
tags: [guide, ext, services, extension, dependency-injection]
---

# 扩展服务与跨扩展调用规范

> ❝ 扩展之间不握手全局变量——core 在注册时把一个服务定位器（`ctx.services`）递到你手上。 ❞

pi-web 扩展开发中，**跨扩展调用能力/数据**只有一条正道：core 注入的 `ctx.services`。本指南说明怎么提供、怎么消费、怎么降级，以及哪些全局量是 core 保留口（不许新造）。

设计依据与完整背景：`dev-repo/docs/dev-repo-dependency-injection-plan.md`（2026-09 评审拍板）。

## 1. 服务端：提供能力

在你的扩展 `index.ts` 的 `server.startup(ctx)` 里注册：

```ts
export default {
  id: "aiti-git-trace",
  // ...
  server: {
    startup(ctx) {
      // key 强制 "<extId>.<name>" 前缀（core 校验，防止冒充别的扩展）
      ctx.services.provide("aiti-git-trace.trace", traceService(ctx.dataDir));
    },
  },
  // 也可以挂在扩展出口上（惰性 getter，等价写法）：
  // get services() { return { get trace() { return traceService(dataDir) } } }
};
```

**规范**：

- key = `"<extId>.<name>"`；core 自己提供的服务用 `core.*` 前缀（如 `core.sessions`、`core.registry`）。
- `provide` 返回 disposer，扩展 shutdown/reload 时 core 自动反卷。
- **服务对象请用惰性 getter**（访问时现取），这样热重载/重装不会悬空——消费方每次拿到的都是活实例。
- 方法语义写进文档（提供方扩展文档 + 消费方方案文档），红线：**出口只读**；消费方不得直读提供方 dataDir。参考：`services.trace` 契约表（`docs/aiti-git-trace-plan.md` §16.3）。

## 2. 服务端：消费能力

```ts
server: {
  startup(ctx) {
    // 软依赖：缺席返回 undefined，自己降级（推荐——扩展随时可能被用户禁用）
    const trace = ctx.services.get("aiti-git-trace.trace");
    if (!trace) { /* 功能降级：隐藏入口 / 休眠，绝不裸崩 */ }

    // 硬等待：启动期确实要等服务就绪时用（事件驱动，非轮询）
    const docs = await ctx.services.require("aiti-doc-center.docs", 5000)
      .catch(() => null); // 超时仍要降级

    // 订阅服务上/下线（提供方 reload / 被禁用时收到通知，替代手写自愈重订）
    const off = ctx.services.onChange((key, phase) => {
      if (key === "aiti-git-trace.trace" && phase === "down") resubscribe();
    });
  },
}
```

**三条纪律**：

1. **交互时刻现取**：不要在 startup 把服务对象长持为闭包/全局——用 `ctx.services.get(...)` 在每次使用时现取，或订阅 `onChange` 重订。
2. **缺席降级**：消费方必须定义「服务不在」的行为（功能降级/隐藏入口），缺席是常态不是错误（用户可随时禁用任何扩展）。
3. **feature 读写走 `ctx.features`**：`ctx.features.get("aiti-ai-input", "asr.hotwords.count")`——不要穿透注册表直调。

## 3. 客户端：跨扩展 UI 调用

client bundle 里的 ctx 有一套对称 API（基于主题注册表实现，**同页进程内直调，不走 HTTP**）：

```js
// 提供（如你的扩展要开放「打开设置面板」给别的扩展）
export function register(ctx) {
  const dispose = ctx.registerExtService?.("aiti-model-check.open", () => setOpen(true));
  return dispose; // disposer，卸载时 core 反卷
}

// 消费（判空降级，与旧 window 全局判空同习惯）
const open = ctx.getExtService?.("aiti-model-check.open");
if (typeof open === "function") open();
else { /* 提供方未加载/懒加载未就绪：降级 */ }
```

- key 同服务端惯例 `"<extId>.<name>"`。
- 提供方 client bundle 可能是懒加载（`clientImmediately: false`）——**getExtService 判空降级是必须项**。
- 典型迁移对象：`window.__aitiModelCheckOpen`、`window.__aitiHelperInvoke` 这类「A 扩展挂函数、B 扩展判空调用」的 window 全局（存量 ~60 处，迁移台账见 plan 文档 §5）。
- 纯 UI 主题条目（消息气泡按钮等）继续用 `ctx.registerTopicItem(topic, item)`，它是本机制的同源前身。

## 4. 禁止事项（红线）

| 禁止 | 替代 |
|---|---|
| `globalThis.__piWebExt.byId("...").ext.services.*` 穿透别的扩展 | `ctx.services.get("...")` |
| 新增任何 `globalThis.__<extId>*` 服务单例 | `ctx.services.provide(...)` |
| 新增 `window.__<extId>*` 客户端全局（跨扩展调用） | `ctx.registerExtService / getExtService`（同扩展内部便道也优先模块内单例） |
| 穿透注册表直调 `featureValue` / `setFeatureFlag` | `ctx.features.get / on` |
| 服务缺席时裸崩 / 假设永在 | 判空 + 显式降级路径 |
| 用 setInterval 轮询等某个服务出现 | `ctx.services.require(key, timeout)`（事件驱动） |

**core 保留全局口**（豁免清单，扩展不得新造同类）：`globalThis.__piWebExt`（registry 本体）、`__piPageEvents`、`__aitiTraceEmit`（pi 扩展生产者）、`__aitiInject`（middleware 跨 bundle）、`__piSessions` / `__aitiBridges`（core 内部单例）、`window.__piWebPendingComposer`。它们的共同点是**生产者或消费者在扩展 ctx 体系之外**（middleware 独立 bundle / pi 扩展装载器），ctx.services 触达不到——完整豁免理由见 plan 文档 §6。

**灰名单强制（check-ext-globals）**：红线不是靠自觉——`dev-repo/_shared/check-ext-globals.mjs` 静态扫描全仓扩展源码，查三类违规：byId 穿透、feature 直调、未登记全局量。灰名单分三类（`core-保留口` / `dualtrack`（双轨迁移期待退役的旧通道）/ `internal`（扩展内部便道）），**新增全局量不在名单即 FAIL**，`--strict` 可进一步收紧。你的新代码撞线会直接被卡，别绕。

## 5. 已注册服务速查（持续更新）

| key | 提供方 | 用途 | 消费方 |
|---|---|---|---|
| `core.sessions` | core（registry 预置） | 会话 wrapper 只读视图 `{ ids(), has(id), get(id) }`（rpc-manager 单例惰性现取；wrapper 本体是运行面句柄，「只读」指不得增删改会话表） | （P1 起替代 `__piSessions` 直读） |
| `core.registry` | core（registry 预置） | registry 只读投影 `{ ids(), get(id) → 元数据, ui(id), status() }`（不外发 ext entry 本体） | aiti-extman（插槽详情） |
| `aiti-git-trace.trace` | aiti-git-trace | 台账 readOps/sessionStores/watchPaths/listMd + onOp 事件 | aiti-plan-first、aiti-doc-center、aiti-msg-smart |
| `session-manager.sessions` | session-manager | `parseSession(compositeId)` 各 agent 历史解析 + `archivedIds()`（只读） | aiti-zcode/qoder/codex-agent、aiti-doc-center |
| `session-manager.tags` | session-manager | `snapshot()` TagData 全量（乐观锁 version） | aiti-doc-center |
| `session-manager.hotwords` | session-manager | ASR 热词提取 `get(params)` | aiti-ai-input |
| `aiti-doc-center.docs` | aiti-doc-center | md 检索 tagsAll/search/query/docsOfSession | aiti-plan-first、aiti-folder、session-manager |
| `aiti-plan-first.plans` | aiti-plan-first | `planDocs()` 会话→方案文档绑定映射（只读） | aiti-doc-center |
| `service-tunnels.api` | service-tunnels | 库单例（enroll/注入注册等；middleware 仍走 `__piServiceTunnels` 保留口） | aiti-devtools |
| `aiti-devtools.bridges` | aiti-devtools | 桥表 `get(key)`（单例复用语义） | （aiti-attach-agent 迁移中） |
| `aiti-event-bus.publish` | aiti-event-bus | 页面事件总线发布 `{ publish(type, data) }`（唯一新 SSE `/events`；全局口 `__piPageEvents` 访问器接管并行） | plan-first / model-check / editor / git-review(gr:task) / ai-schedule(sched:*) |
| `aiti-event-bus.subscribe` | aiti-event-bus | client 帧订阅 `subscribePageFrames(handler)`（缺席回退 `window.__piPageEventsClient`） | 各需实时推送的 client |

> 以上服务均已上线（2026-09-07 dev；**生产 pi-web core 已同步，2026-09-08**）。消费方扩展均按「双轨」落地——`ctx.services` 优先 + 旧全局通道兜底；兜底在生产扩展全量同步后退役。

> 上线新服务 = 在提供方扩展文档写方法语义表 + 本表加一行。

## 6. 声明式依赖与能力模型（dependsOn / optionalDependsOn / provides / takeover）

`ctx.services` 是**运行时**软依赖（判空降级）；扩展注册还支持一层**声明式**依赖与能力语言，由平台解析、extman 展示与裁决。两者互补：声明管「依赖谁/提供什么」的静态事实与 UI 提示，services 管运行时实际取用。权威设计 + 实施记录：`dev-repo/docs/aiti-ext-deps-capabilities-plan.md`（P0/P1/P2 已实施上线，2026-09-08 复核，含生产 core 同步）。

entry 顶层（与 `conflicts`/`features` 同层）四个可选字段，旧扩展零改动：

| 字段 | 强度 | 语义 |
|---|---|---|
| `dependsOn: string[]` | 硬 | 功能级依赖；元素 = 扩展 id 或能力名。被依赖者禁用/卸载时 extman 弹警告；解析失败标 missing |
| `optionalDependsOn: string[]` | 软 | 可选依赖（npm `optionalDependencies` 语义）：存在→消费方可启用附加功能；缺席→完全不影响。**纯声明，不触发任何警告** |
| `provides: string[]` | 多实现 | 声明提供的能力（capability）；同能力可多扩展同时提供 |
| `takeover: string[]` | 独占 | 声明独占接管的特性；同特性多声明者按裁决取唯一生效者 |

```ts
export default {
  id: "aiti-msg-smart",
  optionalDependsOn: ["aiti-git-trace"],  // 有它展示变更追踪，没有也不影响
  // dependsOn: ["cap.git-trace"],        // 能力名约定带 cap. 前缀（解析时 id 命中优先）
  // provides: ["cap.msg-intelligence"],
  // takeover: [],
} as PiWebExtension;
```

**能力解析**：依赖元素先按扩展 id 精确命中；否则查提供者集合（`provides ∪ takeover`）——空集=missing（硬依赖标红、可选静默），多个提供者按 **用户 pin > takeover 声明者 > semver 最新 > id 字典序** 取生效提供者。同 id 多来源（user/dev/bundled 多根）裁决同序，dev 调试优先开关可切。

**extman 呈现**：详情「依赖」区按边类型展示（硬/可选 `·optional`/能力边带解析链）；「能力」「冲突」两个视图按能力名分组看提供者/消费方/pin。警告只吃硬边——被可选依赖的操作不弹窗。详见 [aiti-extman](/extensions/aiti-extman.html)。
