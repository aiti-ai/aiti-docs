---
title: 服务端 ctx API
icon: 🖥️
description: startup/shutdown/api 钩子收到的 ExtServerContext 完整成员参考——三层目录、core 契约、services、features、会话后端、invokeAI
tags: [ext-dev, server, api, reference]
---

# 服务端 ctx API

`server.startup(ctx)` / `shutdown(ctx)` / `api(req, ctx)` / `rescanBackends(ctx)` 收到的上下文。
唯一事实源：`lib/ext/types.ts`（`ExtServerContext` / `ExtApiContext` / `ExtCoreApi`）。

## 1. ExtServerContext 成员总览

```ts
interface ExtServerContext {
  id: string;                 // 扩展 id（= 目录名）
  dir: string;                // 扩展代码目录（只读，供静态资源）
  configDir: string;          // 配置区 dataRoot/<id>/config/（可恢复：重新配置即可）
  stateDir: string;           // 持久数据区 dataRoot/<id>/state/（不可再生：删了就没了）
  cacheDir: string;           // 缓存区 dataRoot/<id>/cache/（随时可整体删，扩展须自愈重建）
  core: ExtCoreApi;           // 核心数据契约
  services: ExtServicesSlot;  // 跨扩展服务定位器
  features: ExtFeaturesSlot;  // feature 状态读写
  sessionProviders: ExtSessionProviderSlot;      // 会话后端注册
  sessionAnnotations: ExtSessionAnnotatorSlot;   // 会话列表注记
  invokeAI?(params): Promise<{ text, provider, model, usage? }>; // 通用 AI 调用
}
```

`api` 钩子收到的是扩展版 `ExtApiContext`：额外带 `method` / `path`（扩展 id 后的路径段数组）/
`searchParams`（URLSearchParams）。

⚠️ **`ctx.dataDir` 已移除（访问即抛）**——2026-09 起拆为三层；目录判定决策树与行为契约见
[扩展数据与存储规范](/guide/ext-data.md)。

## 2. `core`（ExtCoreApi）

核心数据契约——扩展**不要自己实现**会话读取/运行态/文件访问：

| 成员 | 语义 |
|---|---|
| `listSessions(options?)` | 会话列表（增量缓存）；`{ refresh: true }` 绕过 5s 列表扫描缓存（刚落盘、归档后等要求立即生效的场景） |
| `getRunningSessionIds()` | RPC 运行集 |
| `getAliveSessionIds()` | 存活（含 idle）rpc 会话 id——**磁盘写守卫必须包含** |
| `stopAliveSession?(id)` | 主动释放存活 idle 会话（归档/删除前的磁盘操作先调）；运行中返回 `"running"`，外部持有（如 TUI 桥）返回 `"missing"`。**可能缺席（老宿主）——先判存在** |
| `getHomeDir()` | 用户 home 目录 |
| `readSession(id)` | 完整会话上下文（消息 + entry ids）；缺失返回 null |
| `readModelsConfig()` | 读当前 models.json（`{providers:{...}}`）；扩展**禁手改文件**，统一走此 API（含缓存失效） |
| `writeModelsConfig(data)` | 写 models.json（归一化 + 失效模型缓存，立即生效） |
| `rebindSessionBackend?(oldId, newId)` | 重绑后端会话 id（进程自生成 id 的后端读到真 id 后挂别名；旧 key 保留使草稿行/既有引用不断）。重名或不可用返回 false（幂等安全）。可能缺席 |
| `fileAccess.allowRoot(root)` / `isAllowed(p)` | 绑定 pi-web allowed-roots 安全规则的文件访问（会话 cwd 等已预授权） |

## 3. `services`（ExtServicesSlot）

跨扩展服务定位器——**唯一正道**（禁止全局量穿透）。key 强制 `"<extId>.<name>"` 前缀（core 自己的服务用 `core.*`）：

| 成员 | 语义 |
|---|---|
| `provide(key, impl)` | 提供服务；返回 disposer（扩展 shutdown/reload 时 core 自动反卷）。幂等：同 key 重复 provide = 原地替换、不重发 up |
| `get(key)` | 软依赖：缺席返回 `undefined`，消费方自行降级（推荐默认） |
| `require(key, timeoutMs?)` | 硬依赖：事件驱动等待 provide（非轮询），超时 reject |
| `onChange(cb)` | 订阅服务 up/down（替代手写自愈重订）；返回退订函数 |

完整规范（客户端服务、命名惯例、依赖能力模型、测试门禁）→
[扩展服务与跨扩展调用规范](/guide/ext-services.md)。

## 4. `features`（ExtFeaturesSlot）

| 成员 | 语义 |
|---|---|
| `get(extIdOrFeatureId?, featureId?)` | 读生效值：`get(fid)` 读本扩展；`get(extId, fid)` 读指定扩展。boolean 返回开关、string 返回值；未显式设置返回声明默认值 |
| `on(cb)` | 订阅 feature 变化（任意扩展；extman 编辑后触发）；返回退订函数，随扩展 ctx 失效 |

声明侧（`features: ExtFeature[]`）与客户端消费（`getFeatures` / `onFeatureChange`）→
[feature 声明与消费](/ext-dev/features.md)。

## 5. `sessionProviders`（会话后端注册）

把自定义 agent 后端接入宿主多 agent 前端。key 自动加扩展 id 前缀（`"<extId>/<type>"`），不可能冒充内置或他人；
扩展 shutdown/reload 时自动反注册。

```ts
ctx.sessionProviders.register({
  type: "my-backend",              // 短名（不含 "/"）
  label: "My Backend",             // 新会话后端选择器展示名
  maxCapabilities: { ... },        // 能力上限声明（fail-loud；不支持的能力声明 false，方法内抛 UnsupportedCapabilityError）
  listModels?,                     // 静态模型目录（无会话即可取；喂新会话页选择器）可选
  refreshModels?,                  // 手动刷新模型目录（有才显示「刷新模型列表」按钮）可选
  async createSession(options) {   // 创建会话 → SessionHandle（lib/session/types.ts）
    // options: { sessionFile?, cwd?, socketPath?, env?, ...自由透传 key }
    // 」自由透传：扩展可自行加字段，宿主不解释；缺 sessionFile 时由后端自建
    return { /* ... */ };
  },
  async shutdown() {},             // 可选
}); // → 返回完整注册 key "<extId>/<type>"
```

配套成员：`remove(type)` 热移除、`canOpen(agentKey)` 能否驱动外部历史会话、
`open(compositeId, options?)` 从历史记录附加为活会话（attach-from-history）。
真实样例：aiti-echo-agent（零 LLM 假后端）、aiti-attach-agent。

## 6. `sessionAnnotations`（会话列表注记）

给会话列表行附加扩展自有字段（如占用标记）。数据所有权在扩展，core 不解释格式：

```ts
ctx.sessionAnnotations.register({
  async annotate(rows) {           // rows = 当前列表行轻投影 { id, path?, cwd? }
    return { [rowKey]: { busy: true } };  // key 匹配行的 id 或 path；core 合并进响应
  },
});
```

## 7. `invokeAI`（通用 AI 调用）

core 最低层的模型能力：任意 system+messages → `{ text, usage }`。**core 零业务逻辑零统计**——
prompt 组装/上下文/项目状态/token 记账全部是调用扩展的责任：

```ts
const { text, usage } = await ctx.invokeAI({
  provider?, modelId?,  // 缺省 = 全局最便宜的非 reasoning 模型（非「当前会话模型」）
  system?,
  messages: [{ role: "user", content: "..." }],
  maxTokens?, temperature?, reasoning?,   // reasoning 如 "off"，仅 provider 支持时生效
  caller: "myext-input/complete",         // 记账维度（缺省 ext.id；建议按场景细分）
});
```

更多 AI 集成面（per-session 工具注入、生命周期回调、ai-helper 技能）→ [AI 集成](/ext-dev/ai.md)。
