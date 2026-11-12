---
title: 扩展服务与跨扩展调用规范
icon: 🔌
description: pi-web 扩展间通信的唯一正道：ctx.services 定位器——怎么提供、怎么消费、怎么降级；全局量红线
tags: [guide, ext, services, extension, dependency-injection]
---

# 扩展服务与跨扩展调用规范

> ❝ 扩展之间不握手全局变量——core 在注册时把一个服务定位器（`ctx.services`）递到你手上。 ❞

pi-web 扩展开发中，**跨扩展调用能力/数据**只有一条正道：core 注入的 `ctx.services`（服务端）/ `ctx.registerExtService` 族（客户端）。本指南说明怎么提供、怎么消费、怎么降级，以及哪些全局量是 core 保留口（不许新造）。


## 1. 服务端：提供能力

在你的扩展 `index.ts` 的 `server.startup(ctx)` 里注册：

```ts
export default {
  id: "aiti-git-trace",
  // ...
  server: {
    startup(ctx) {
      // key 强制 "<extId>.<name>" 前缀（core 校验，防止冒充别的扩展）
      ctx.services.provide("aiti-git-trace.trace", traceService(ctx.configDir));
    },
  },
  // 也可以挂在扩展出口上（惰性 getter，等价写法）：
  // get services() { return { get trace() { return traceService(configDir) } } }
};
```

**规范**：

- key = `"<extId>.<name>"`；core 自己提供的服务用 `core.*` 前缀（如 `core.sessions`、`core.registry`）。命名家族后缀约定见 §7。
- `provide` 返回 disposer；扩展 shutdown/reload 时 core 自动反卷——**先跑扩展 `server.shutdown` 钩子、再逐 key 广播 down**，所以服务对象本身不要求自带 disposer。provide 返回的 disposer 供提前下线用，且带竞态守卫（旧 disposer 不会误删后来者的注册）。
- `provide` 幂等：同 key 重复 provide 是**原地替换 impl、不重发 up**。
- **服务对象请用惰性 getter**（访问时现取），这样热重载/重装不会悬空——消费方每次拿到的都是活实例。
- **提供通用能力的服务请同步声明 `provides`**（§6）——能力索引只认声明，没声明的服务不进 extman 能力视图与依赖解析。
- 方法语义写进文档（提供方扩展文档 + 消费方方案文档），红线：**出口只读**；消费方不得直读提供方 configDir（数据分层：配置根级 / 不可再生数据 state/ / 可再生 cache/——见 [扩展数据与存储规范](/guide/ext-data.md)）。参考：`services.trace` 契约表。

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

**启动序不确定（为什么有 require）**：startup 只按 `startupPriority` 排序，依赖关系**不参与排序**——消费方的 startup 完全可能先于提供方执行，启动期 `get` 缺席是常态而非事故。启动期确要等就用 `require(key, timeoutMs)`（默认 5000ms；事件驱动零轮询；**waiter 不因 down 拒绝**——reload 窗口内的等待不会中途失败，只有超时才 reject）。

**onChange 语义**：只在服务**上/下线**时触发（新 key provide = up、注销/禁用 = down）；同 key 替换 impl 不重发 up；监听回调异常被吞，不影响其他监听者。

## 3. 客户端：跨扩展 UI 调用

client bundle 里的 ctx 有一套对称 API（页面内 Map 实现，**同页进程内直调，不走 HTTP**）：

```js
// 提供（如你的扩展要开放「打开设置面板」给别的扩展）
export function register(ctx) {
  const dispose = ctx.registerExtService?.("aiti-model-check.open", () => setOpen(true));
  return dispose; // disposer，卸载时反卷——见下，务必返回并接好
}

// 消费（判空降级，与旧 window 全局判空同习惯）
const open = ctx.getExtService?.("aiti-model-check.open");
if (typeof open === "function") open();
else { /* 提供方未加载/懒加载未就绪：降级 */ }

// 订阅客户端服务上/下线（提供方懒加载 materialize 完成时收到 up）
const off = ctx.onExtServiceChange?.((key, phase) => {
  if (key === "aiti-model-check.open" && phase === "up") rebind();
});
```

**客户端三件套**：`ctx.registerExtService(key, impl)`（提供）/ `ctx.getExtService(key)`（消费，判空降级）/ `ctx.onExtServiceChange(cb)`（订阅 up/down 重挂）。

- key 同服务端惯例 `"<extId>.<name>"`；**服务端与客户端是两套独立注册表**（Node 侧 `ExtServicesRegistry` vs 页面内 Map），同名 key 互不可见、语义各自独立。
- **客户端注册表没有 revokeExt 等价物**——卸载/HMR 反卷只靠注册时返回的 disposer，`register` 务必返回并接好；reload 重物化重注册同 key 由 impl 竞态守卫兜住，不会假 down。
- 提供方 client bundle 可能是懒加载（`clientImmediately: false`）——materialize 前服务缺席。取用范式：判空 → `ctx.ensureMaterialized?.("<extId>")` 拉起 → 重取 →（迁移期）旧通道兜底（完整范式见 aiti-agent-manager `openCmdTerminal`）。
- 典型迁移对象：`window.__aitiModelCheckOpen`、`window.__aitiHelperInvoke` 这类「A 扩展挂函数、B 扩展判空调用」的 window 全局（存量 ~60 处 dualtrack，迁移台账见 plan 文档 §5；`aiti-git-review.open` 已唯一全迁完）。
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

**core 保留全局口**（豁免清单，扩展不得新造同类）：`globalThis.__piWebExt`（registry 本体）、`__piPageEvents`、`__aitiTraceEmit`（pi 扩展生产者）、`__aitiInject`（middleware 跨 bundle）、`__piSessions` / `__aitiBridges`（core 内部单例）、`window.__piWebPendingComposer`。它们的共同点是**生产者或消费者在扩展 ctx 体系之外**（middleware 独立 bundle / pi 扩展装载器），ctx.services 触达不到——完整豁免理由见 plan 文档 §6。命名收敛：core 保留口统一 `__piWeb*` 前缀（检查脚本按前缀放行），存量 `__aiti*` 保留口不强制改名；客户端侧完整豁免名单以 `check-ext-globals.mjs` 灰名单为权威（另含 `__piPageEventsClient`、`__runningEventsBroker`、`__PIBASE` 等 core 侧量）。

**灰名单强制（check-ext-globals）**：红线不是靠自觉——`dev-repo/_shared/check-ext-globals.mjs` 静态扫描全仓扩展源码，查三类违规：byId 穿透、feature 直调、未登记全局量；**已接入统一测试入口 `scripts/test-web-ext.mjs`**（每次测试先跑门禁，撞线整轮 FAIL，`--list` 跳过）。灰名单分四类：`core-保留口`（上述豁免清单）/ `dualtrack`（双轨迁移期待退役的旧通道）/ `internal`（扩展内部便道，收敛为模块内单例另开批次）/ `framework`（框架级聚合豁免：aiti-configs / aiti-ai-schedule / aiti-helper 读全部扩展声明的机制）。**新增全局量不在名单即 FAIL**——确需新增的正当流程：先在 DI plan §6/本文档登记理由 → 更新脚本灰名单（带类别注）→ 再合码。手动跑 `--strict` 可把 dualtrack 旧通道也计为 FAIL（评估兜底退役进度用，默认不开）。

## 5. 已注册服务速查（持续更新）

**运行时事实源**：`GET /api/extensions/status` 的 `services` 字段（`ExtServicesRegistry.list()`，key + 提供方）；extman 面板逐扩展「服务出口」区自动渲染。下表是人读的语义速查——**上线新服务 = 提供方扩展文档写方法语义表 + 本表加一行**（extman 侧零登记自动可见）。

### 表 A · 服务端（`ctx.services.provide`）

| key | 提供方 | 用途 | 消费方 |
|---|---|---|---|
| `core.sessions` | core（registry 预置） | 会话 wrapper 只读视图 `{ ids(), has(id), get(id) }`（rpc-manager 单例惰性现取） | 暂无（替代 `__piSessions` 直读的目标口，aiti-cmd 等仍双轨） |
| `core.registry` | core（registry 预置） | registry 只读投影 `{ ids(), get(id) → 元数据, ui(id), status() }`（不外发 ext entry 本体） | aiti-extman（插槽详情） |
| `aiti-git-trace.trace` | aiti-git-trace | 台账 readOps/sessionStores/watchPaths/listMd + onOp 事件 | aiti-plan-first、aiti-doc-center、aiti-msg-smart |
| `session-manager.sessions` | session-manager | `parseSession(compositeId)` 各 agent 历史解析 + `archivedIds()`（只读） | aiti-doc-center + 各 agent 扩展（codebuddy/claude-code/opencode/qoder/acp…冷恢复 cwd） |
| `session-manager.tags` | session-manager | `snapshot()` TagData 全量（乐观锁 version） | aiti-doc-center |
| `session-manager.hotwords` | session-manager | ASR 热词提取 `get(params)` | aiti-ai-input |
| `aiti-doc-center.docs` | aiti-doc-center | md 检索 tagsAll/search/query/docsOfSession | aiti-plan-first、aiti-folder、session-manager |
| `aiti-plan-first.plans` | aiti-plan-first | `planDocs()` 会话→方案文档绑定映射（只读） | aiti-doc-center、aiti-git-trace（REST 反向消费） |
| `service-tunnels.api` | service-tunnels | 隧道管理面库单例（enroll/注入注册） | 注入链经 `__stInjectRegistry` 聚合层；middleware 仍走 `__piServiceTunnels`（提供方自有单例，非 core 保留口） |
| `aiti-devtools.bridges` | aiti-devtools | 桥表 `get(key)`（与 `__aitiBridges` 同源单例） | 暂无（aiti-attach-agent 迁移中，现走 `__aitiBridges` 双轨） |
| `aiti-event-bus.publish` | aiti-event-bus | 页面事件总线发布 `{ publish(type, data) }`（唯一新 SSE `/events`） | plan-first / model-check / editor / git-review(gr:task) / ai-schedule(sched:*) / session-manager |
| `aiti-event-bus.publish-local` | aiti-event-bus | 本地直连发布（不喂 core 转发） | 同 publish 族 |
| `aiti-cmd.runner` | aiti-cmd | 跨扩展后端建会话统一出口 | session-manager、aiti-ai-input、aiti-codebuddy-agent |
| `aiti-git-ops.api` | aiti-git-ops | git 操作 API（与 REST 同面） | 消费方现走 `_shared/git-ops-client` REST；ctx 出口预留 |
| `aiti-git-review.aiReview` | aiti-git-review | AI 分组评审（onAgentSettled 驱动 + 180s deadline） | aiti-folder（git-plan 精修） |
| `aiti-model-wizard.saveBatch` | aiti-model-wizard | 批量保存模型 | aiti-models-import |
| `<extId>.launch` ×9 | claude-code / codex / zcode / cursor / qoder / acp / codebuddy / pi + omp（第 9 家，未纳管驱动表） | agent 启动委托（P2 协议驱动） | aiti-custom-agent（8 协议驱动；omp 暂无消费方） |
| `<extId>.agent` ×7 | codebuddy / claude-code / opencode / qoder / cursor / codex / zcode | agent 描述符自报家门 | aiti-agent-manager（agents-registry） |

### 表 B · 客户端（扩展提供，`ctx.registerExtService`）

| key | 提供方 | 用途 | 消费方 |
|---|---|---|---|
| `aiti-float.dockstack` | aiti-float | 统一左栏区块栈（DockStack 渲染/折叠/排序） | session-manager（SidebarContentDock） |
| `aiti-float.dock-header` | aiti-float | 区块头行 | 暂无（预留） |
| `aiti-model-recent.recentOptions` | aiti-model-recent | 最近使用模型取数（同步） | 暂无（宿主 ModelSelector 仍直读 localStorage——迁移接缝） |
| `aiti-event-bus.subscribe` | aiti-event-bus | client 帧订阅 `subscribePageFrames(handler)`（总线缺席回退 `window.__piPageEventsClient`） | 各需实时推送的 client |
| `aiti-event-bus.subscribe-topics` | aiti-event-bus | 主题订阅（topics 白名单/通配；SSE 唯一收敛口，禁自建） | git-review / model-wizard / editor / ai-schedule / plan-first / folder / model-check / helper / session-manager / aiti-cmd 等 10+ |
| `aiti-git-review.open` / `.work` | aiti-git-review | 打开评审工作区 / 带变更工作 | aiti-git-trace（panels）、aiti-folder（folder-browser） |
| `aiti-model-wizard.open` / `.openTab` / `.viewParams` / `.cleanupEdit` | aiti-model-wizard | 打开向导 / 新开页 / 带参查看 / 清理编辑态 | aiti-model-check |
| `aiti-model-check.open` / `.app` | aiti-model-check | 打开可用性面板 / 取 app 实例 | aiti-model-wizard |
| `aiti-ai-schedule.open` | aiti-ai-schedule | 打开调度面板 | aiti-prompts |
| `aiti-helper.invoke` / `.suggestFallback` | aiti-helper | AI 帮助点入口 / 建议兜底 | aiti-model-wizard、aiti-ai-input、aiti-extman、_shared/soffice-panel |
| `aiti-cmd.open-session` / `.open-shell` | aiti-cmd | 跨扩展打开会话 / 终端 | aiti-agent-manager（open-session；open-shell 暂无） |
| `session-manager.mention` | session-manager | 会话提及 | _shared/new-session-cwd |

### 表 C · 客户端（宿主提供，`registerExtClientService("pi-web", …)`）

| key | 提供方 | 用途 | 消费方 |
|---|---|---|---|
| `pi-web.session` | AppShell | 当前会话句柄/切换 | aiti-editor、aiti-plan-first、aiti-git-trace、aiti-ai-speek（`onExtServiceChange` 重挂范式） |
| `pi-web.home` | AppShell | 回首页/导航 | session-manager（store、sidebar-content） |
| `pi-web.toast` | AppShell | 全局 toast | session-manager（toast.tsx） |
| `pi-web.overlayBack` | AppShell | 浮层返回注册 | 14+ 处（`_shared/overlay-back-client` 统一封装 + aiti-float / aiti-editor / service-tunnels / aiti-folder / session-manager） |
| `pi-web.ui` | **宿主 AppShell**（客户端） | 宿主导航/提及回调与组件工厂按名取：`get(name)`/`names()`——与 sidebarContent extra 同集 + `onLineMention`（见下 5.1） | aiti-folder（resolveHostFace 范式）、aiti-editor、aiti-cmd |
| `pi-web.composer` | **宿主 ChatInput**（客户端） | composer 回调/ref 按名取：`setInputValue`/`focusComposer`/`textareaRef`/`openSessionInfo`/`queueActions`（见下 5.1） | aiti-ctx-meter、aiti-ai-input、aiti-queue-keeper |

**状态注**：表 A/B 服务 2026-09-07 起陆续上线 dev，生产 pi-web core 已同步（2026-09-08）；表 C 前四项早于本指南即存在，`pi-web.ui`/`pi-web.composer` 为 2026-09-16 新增（生产同步状态见 §5.1）。

**双轨注**：旧 window 全局兜底仍在（客户端 ~60 处 dualtrack + 服务端 byId 兜底注释行），退役条件 = 生产扩展全量同步；进度台账见 plan 文档 §5。

### 5.1 宿主能力服务（slot extra 回调解耦，2026-09-16）

**背景**：宿主曾逐插槽渲染点手拼 extra 回调，新渲染点/新字段漏拼 = 功能静默消失
（右栏文件夹面板 @ 断链复盘）。拍板：**宿主插槽 extra 只喂数据；回调/ref/工厂一律
注册为客户端服务**，扩展自带兜底。

| 服务 | 提供方 | 字段契约 |
|---|---|---|
| `pi-web.ui` | AppShell（`hostUiRef` 委托最新渲染闭包） | sidebarContent extra 同集（回调+工厂）+ `onLineMention` + `closeTopPanels`（收回全部顶栏下拉面板；顶栏面板内的扩展条目调起别的全屏表面前调用，2026-09-19 增）；宿主源码 `lib/ext/host-ui-contract.ts` |
| `pi-web.composer` | ChatInput（`composerUiRef`） | `setInputValue` / `focusComposer` / `textareaRef` / `openSessionInfo`（含先收小屏 InfoSheet）/ `queueActions`（与 queuePanel extra.actions 同集） |

**红线**：服务只放**引用稳定**成员（useCallback 回调 / ref / 组件工厂）。随渲染变化的
数据（sessionId/cwd/isStreaming/inputValue/context…）必须走插槽 extra props——服务
`get` 是命令式快照，数据走服务会「冻结值」。

**消费方范式**（rp 优先 → 服务兜底；参考 aiti-folder `resolveHostFace`）：

```js
const svc = ctx.getExtService?.("pi-web.composer");
const openSessionInfo = rp.openSessionInfo ?? svc?.get?.("openSessionInfo");
```

宿主新插槽渲染点**只需喂数据**；回调缺席时扩展按「按钮不渲染」降级，与旧宿主
rp 缺失行为一致（不劣化）。

## 6. 声明式依赖与能力模型（dependsOn / optionalDependsOn / provides / takeover）

`ctx.services` 是**运行时**软依赖（判空降级）；扩展注册还支持一层**声明式**依赖与能力语言，由平台解析、extman 展示与裁决。两者互补：声明管「依赖谁/提供什么」的静态事实与 UI 提示，services 管运行时实际取用（P0/P1/P2 已实施上线；P3 未实施另行评审——硬依赖预取联动、ui.provides 收编、dev 优先开关初值）。

entry 顶层（与 `conflicts`/`features` 同层）四个可选字段，旧扩展零改动：

| 字段 | 强度 | 语义 |
|---|---|---|
| `dependsOn: string[]` | 硬 | 功能级依赖；元素 = 扩展 id 或能力名。**纯声明，不阻断加载**——被依赖者禁用/卸载时 extman 弹警告；解析失败标 missing |
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

**pin 操作**：extman「能力」视图详情里对提供者下拉 pin（持久化 `<dataRoot>/ext-pins.json`，`source:<id>`/`capability:<cap>` 双 key）；pin 失效（被禁用/卸载）软校验回自动裁决；变更后需 reload 生效。

**conflicts 字段**：声明互斥（按 npm source 包名或路径 scoped 包名精确命中），命中者在会话创建路径被整个移除——注意它比依赖警告重，是直接下线对方。

**运行时探测**：manifest 透传四声明字段，扩展可运行时查「某能力谁提供」（optional 依赖的运行时兑现路径）。⚠ `ui.provides`（EXT_PROVIDES 内置接管）是 legacy 机制，与本节 caps `provides` 是两回事，勿混用。

**声明落差提示**：能力索引只认 `provides/takeover` 声明——现状多数服务（runner/api/launch/agent 族等）尚未声明，不进 extman 能力视图与依赖解析。**提供通用服务的扩展应同步声明 `provides`**（存量补声明为跟进项）。

**extman 呈现**：详情「依赖」区按边类型展示（硬/可选 `·optional`/能力边带解析链）；「能力」「冲突」两个视图按能力名分组看提供者/消费方/pin。警告只吃硬边——被可选依赖的操作不弹窗。详见 [aiti-extman](/extensions/aiti-extman.html)。

## 7. 服务命名惯例（2026-09-18 收编）

key 强制 `<extId>.` 前缀（core 用字面 `core.*`，宿主客户端用 `pi-web.*`）。家族后缀已是事实约定，新服务照此取名，避免发散：

| 后缀 | 语义 | 例 |
|---|---|---|
| `.api` | 服务端管理面出口（与 REST 同面） | `service-tunnels.api`、`aiti-git-ops.api` |
| `.open` | 客户端打开面板/入口 | `aiti-model-check.open`、`aiti-ai-schedule.open` |
| `.launch` | agent 启动委托（P2 协议驱动） | `aiti-zcode-agent.launch` |
| `.agent` | agent 描述符自报家门 | `aiti-qoder-agent.agent` |
| `publish` / `publish-local` / `subscribe` / `subscribe-topics` | 事件总线四出口 | `aiti-event-bus.*` |

能力名 `cap.` 前缀仅为约定不强制（解析时扩展 id 命中优先，见 §6）。

## 8. 测试与门禁

- **宿主单测范式**：pi-web `lib/ext/services.test.mjs`——覆盖 up/down、同 key 重 provide 不重发 up、down 后 reload 重新上线、require 启动等待、disposer 竞态守卫。给服务行为改动补断言照它抄。
- **全局量门禁**：`scripts/test-web-ext.mjs` 每次测试前先跑 `check-ext-globals.mjs`（含 `--only` 过滤跑；`--list` 跳过），撞线整轮 FAIL——见 §4 灰名单段。
- **退役评估**：手动 `node dev-repo/_shared/check-ext-globals.mjs --strict` 把 dualtrack 旧通道也计 FAIL，数一数还剩几处即兜底退役进度。
