---
title: 扩展对象契约
icon: 📜
description: PiWebExtension 全字段参考——entry 声明的每一个字段、类型与语义
tags: [ext-dev, contract, reference]
---

# 扩展对象契约

扩展入口（`index.ts` 等）`default export` 一个对象，宿主按结构契约读取。
唯一事实源：宿主源码 `lib/ext/types.ts`（`PiWebExtension`）。

## 1. 顶层字段

| 字段 | 类型 | 必填 | 语义 |
|---|---|---|---|
| `id` | `string` | ✅ | 唯一 id，**必须与目录名一致**；注册表主键、API 路由、服务 key 前缀都基于它 |
| `name` | `string` | ✅ | 展示名 |
| `version` | `string` | ⚠️ | **不要手写**——唯一事实源是 `package.json`（发布流程维护）；entry 值仅在 package.json 无版本号时兜底（老扩展兼容），新扩展禁止声明 |
| `icon` | `string` | — | 短图标：emoji（如 `"🧰"`）或扩展内图标文件相对路径（如 `"icon.svg"`，lucide 线条风格） |
| `category` | `string` | — | app-center 分类标签；值为 app-center 内部分类 id（session/code/ai/auto/debug/ui/system/other）时显示本地化文案，其它值原样显示 |
| `description` | `string` | — | 一句话描述；缺省回退 `package.json` 的 `description`；随 manifest 透传给 app-center |
| `client` | `string` | — | 前端 bundle 相对路径（预编译 ESM 单文件，如 `"client/bundle.mjs"` / `"dist/xxx.mjs"`） |
| `server` | `ExtServerHooks & { agent? }` | — | 服务端钩子（见 §2） |
| `ui` | `ExtUiDefinition` | — | 插槽元数据与 client 行为声明（见 §3） |
| `features` | `ExtFeature[]` | — | feature 管理（逐项启停）→ 详见[feature 指南](/ext-dev/features.md) |
| `conflicts` | `string[]` | — | 冲突扩展声明：标识符为 npm 包名（scoped 写全），平台组装 SDK 加载结果时按包名/路径匹配**整体移除**对方（不初始化） |
| `dependsOn` | `string[]` | — | 硬依赖：元素为**扩展 id 或能力名**（`cap.*` 前缀约定；id 精确匹配优先）。依赖被禁用/卸载时 extman 显示警告，缺失标「依赖未满足」；**声明式，不阻断加载**，运行时兜底靠扩展自查 manifest |
| `optionalDependsOn` | `string[]` | — | 软依赖（npm optionalDependencies 语义）：有则可增强，缺失/禁用无任何影响、不警告，仅在 extman 详情展示 |
| `provides` | `string[]` | — | 提供的能力（多家可同时声明同一能力）；消费方 `dependsOn` 可指向能力名，平台仲裁有效提供方：**用户钉选 > takeover 声明者 > 最新 semver > id 字典序**。约定能力名带 `cap.` 前缀（不强制） |
| `takeover` | `string[]` | — | 独占接管声明：同能力多家声明 = 冲突，仲裁单家生效（不阻断加载，冲突进 extman 面板）。注意与 `ui.provides`（EXT_PROVIDES 内置能力接管，历史特例）区分 |
| `startupPriority` | `number` | — | 服务端启动优先级：大者先启动（默认 0，同优先级按扫描序稳定排序），关停对称反序。用途：基础设施扩展（如 event-bus = 100）先于消费方就绪。只影响启停顺序，不碰 dependsOn 语义 |
| `publicApi` | `string[]` | — | 允许跨域 GET 的 API 路径白名单：元素为 `/api/extensions/<id>/` 后的路径（`"/"` 连接，如 `"cpu-meter.js"`），精确匹配。用途：服务端注入任意页面的只读资产（跨站 `<script src>` 默认被请求安全门禁 + ORB 双拦）。安全边界：仅 GET + 精确路径，写操作与未声明路径仍走默认门禁 |

## 2. `server` 钩子

| 钩子 | 时机 | 语义 |
|---|---|---|
| `startup(ctx)` | 服务启动（instrumentation `startAll`） | 建连接、起定时器、注册服务/会话后端；ctx 见[服务端 ctx API](/ext-dev/server-api.md) |
| `shutdown(ctx)` | 热重载 / 退出 | 清理、落盘；core 之后自动反卷本扩展提供的服务 |
| `api(req, ctx)` | `/api/extensions/<id>/<path...>` 命中 | 返回 `Response`；返回 `null`/`undefined` = 404；ctx 为 `ExtApiContext`（含 `method`/`path[]`/`searchParams`） |
| `middleware(req)` | 每个请求、core DNS-rebinding 门禁之前 | 返回 `{ handled: true, response }` 短路，或 `{ handled: false }` 放行；**抛异常 = fail-closed 403** |
| `rescanBackends(ctx)` | POST `/api/session-backends/rescan` | 后端型扩展重跑探测+注册（幂等，重注册覆盖可用性快照）；返回 `{ registered?, unavailable? }` 聚合进响应。startup 只扫一次，宿主启动后才装的 CLI 靠这里补扫 |
| `agent.*` | 每个 agent 会话 | per-session 扩展点：`agentTools` / `onAgentSession` / `onAgentSessionEnd` / `onAgentSettled` → 详见[AI 集成](/ext-dev/ai.md) |

## 3. `ui` 字段（ExtUiDefinition）

| 字段 | 语义 |
|---|---|
| `toolbar` / `sidebar` / `dialogs` / `banners` / `pages` / `chatInputTop` / … | 各插槽的静态条目声明（`ExtUiItem[]`）——宿主在 client 物化前即可渲染的「零 bundle 入口」；插槽全表见[插槽参考](/ext-dev/slots.md) |
| `provides` | 接管宿主内置能力（`EXT_PROVIDES`）：现值 `"session-delete"`（侧栏隐藏内置删除按钮）/ `"session-agent-source"`（自动发现会话源）/ `"queue-panel"`（隐藏队列 fallback banner）。 evolution 路径见 ext 依赖能力模型方案 §7 |
| `clientImmediately` | 缺省 `true`；`false` = 懒加载（bundle 在首次渲染到本扩展声明的槽时才物化）→ [懒加载契约](/guide/ext-lazy-loading.md) |
| `clientDependsOn` | 本扩展 client 依赖的其它扩展 id 列表：启动图注入边（并行预取/加载顺序提示）——**非正确性依赖**（加载正确性不靠它），只影响预取调度与 HMR diff 展示 |
| `clientLazyVia` | `"service"`：无 ui[slot] 静态条目、渲染面经客户端服务交付给消费方的懒加载扩展的凭据（豁免「懒标记失效」静态诊断） |
| `i18n` | `Record<locale, Record<key, message>>`；client `ctx.t(key, params)` 查表 → [i18n 与安全](/ext-dev/i18n-security.md) |

## 4. 静态条目（ExtUiItem）

| 字段 | 语义 |
|---|---|
| `id` | 条目 id（组合 id = `"extId:itemId"`） |
| `label` / `title` | 菜单文字 / 悬停提示 |
| `icon` | 声明式图标：`{ svg }`（24×24 viewBox 内部标记，lucide 线条风格，stroke=currentColor）/ emoji / 扩展内 `.svg` 相对路径（CSS-mask 渲染）——宿主统一灰度线风格渲染，杜绝逐扩展样式漂移 |
| `badge` | 插槽特定提示（如侧栏徽标） |
| `noMenuLabel` | 菜单已带完整内容（如搜索输入框）时，宿主不加文字 label |
| `feature` | 懒加载 v2：门控此静态条目的 boolean feature id；关 → 宿主不渲染；物化后由 client 注册条目自身的 feature 接管 |

## 5. 加载与目录

- 入口文件名：`index.ts` / `index.mjs` / `index.js` / `index.cjs`；目录内只有一个脚本文件时也可单文件布局。
- 加载用 jiti 转译 TS（`moduleCache: false`，热重载生效）；无 package.json 也无入口脚本的目录跳过。
- 目录分层与同名优先级（user > extra > dev > bundled）→ [部署与热重载](/ext-dev/deploy.md)。

## 6. TypeScript 类型增强（可选）

宿主侧 TS 文件可通过 module augmentation 获得插槽 props / i18n key 的类型检查：

```ts
declare module "dev-repo/ext" {
  interface ExtSlotContractMap {
    chatInputTop: { props: { inputValue: string } };
  }
  interface LocaleNamespaceMap {
    "my-extension": { "inspect.start": string };
  }
}
```

注意：这套类型只在**宿主仓内开发**（dev-exts 等）时可用；外部扩展 entry 是裸对象（jiti 直接加载，
无类型检查环节）。契约本质是「类型级文档」，无运行时效果。
