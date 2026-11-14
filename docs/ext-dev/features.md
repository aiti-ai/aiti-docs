---
title: feature 声明与消费
icon: 🎚️
description: ExtFeature 三类型、tool.* 工具级约定、server/client 两侧消费链与 manifest 透传
tags: [ext-dev, features, extman]
---

# feature 声明与消费

feature = 扩展暴露给用户**逐项启停/配置**的能力点。用户在扩展管理器（aiti-extman）里逐项开关；
状态持久化在 `<dataRoot>/features.json`，**只由 core 注册表读写**（扩展不碰文件）。

唯一事实源：`lib/ext/types.ts`（`ExtFeature`）。

## 1. 声明（entry 顶层 `features`）

```ts
export default {
  id: "my-ext",
  // ...
  features: [
    // boolean（缺省类型）：开关。default 缺省 true；false = 默认关，用户可开
    { id: "greeting.enabled", label: "问候功能", description: "启动时打招呼",
      group: "behavior", default: true },

    // string：文本设置，extman 渲染输入框
    { id: "asr.hotwords.count", label: "热词数上限", type: "string", value: "50",
      placeholder: "50" },

    // textlist：多行文本，一行一条（如环境变量列表），值语义同 string
    { id: "proxy.extra-args", label: "额外参数", type: "textlist" },

    // 工具级约定：id = "tool.<注入工具名>" → 宿主自动过滤被禁用的 agent 工具
    { id: "tool.aiti_page_exec", label: "页面执行工具", group: "page actions",
      description: "注入到 agent 会话的 aiti_page_exec 工具" },

    // category：app-center 分类标签（可选；内置 id：session/code/ai/auto/debug/ui/system/other，
    // 其它值原样作为自定义分类展示；缺省回落扩展级 category，再缺省 other）
    { id: "tool.export", label: "导出", category: "export" },
  ],
};
```

| 字段 | 语义 |
|---|---|
| `id` | 扩展内唯一；**工具级 = `"tool.<工具名>"`**（如页面注入扩展的 `aiti_page_exec` → `tool.aiti_page_exec`）；其它前缀（如 `behavior.xxx`）由扩展自己查询决定行为 |
| `label` / `description` | extman 展示 |
| `group` | 分组（extman 按 group 分组展示，如 "page actions" / "user interaction"） |
| `type` | `"boolean"`（缺省）/ `"string"` / `"textlist"` |
| `default` | boolean 默认态（缺省 true） |
| `value` | string 默认值（缺省 ""） |
| `placeholder` | 输入提示（string，可选） |
| `category` | app-center 分类标签（可选） |

## 2. 宿主对 `tool.*` 的特殊处理

- 注入侧：core 在 `collectAgentTools` 注入时**自动过滤**被禁用的工具级 feature（含已有会话）。
- 执行侧：禁用的工具在 execute 时**立即拒绝**（含已存在会话）。
- 非 `tool.*` 的 feature：宿主不做任何解释，由扩展在两端自行查询。

## 3. server 侧消费（`ctx.features`）

```ts
// server.startup(ctx) / api(req, ctx) 内
const on = ctx.features.get("greeting.enabled");            // boolean | string | undefined
const limit = ctx.features.get("asr.hotwords.count");       // string 值
const other = ctx.features.get("other-ext", "some.flag");   // 读别的扩展（跨扩展读）

const off = ctx.features.on(() => resubscribeIfNeeded());   // 变化订阅；返回退订函数
```

红线：**不要穿透注册表直调** `featureValue` / `setFeatureFlag`（老全局口，已由 `ctx.features`
取代——见[服务红线](/guide/ext-services.md) §4）。

## 4. client 侧消费

```js
export default function register(ctx) {
  const flags = ctx.getFeatures?.() ?? {};        // 同步读本扩展全部生效值（宿主一次拉全，零额外请求）
  const off = ctx.onFeatureChange?.(() => render());  // extman 编辑后触发
}
```

## 5. manifest 透传与跨扩展读

- feature 状态随 `/api/extensions/manifest` 一起下发（`features?: { id, type?, label?…, enabled, value? }[]`）——
  宿主 client 一次拉全，扩展读共享 store 不另发请求。
- 跨扩展读用 `ctx.features.get(extId, fid)`（server）/ 读 manifest（client）；
  feature 不是跨扩展**调用**通道——能力协作请走 [ctx.services](/guide/ext-services.md)。

## 6. 与静态条目门控的关系

懒加载 v2 里，entry `ui[slot]` 静态条目可带 `feature` 门控（关 → 宿主不渲染该入口）；
client 物化后由注册条目自身的 `feature` 接管门控。详见[懒加载契约](/guide/ext-lazy-loading.md)。
