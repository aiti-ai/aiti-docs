---
title: aiti-agent 扩展点
icon: 🧩
description: aiti-agent 扩展框架——插槽、契约、生命周期，以及如何加新的扩展点
---

# aiti-agent 扩展点

> aiti-agent 的业务功能全部以**扩展**形式实现，与核心只通过**扩展点**交互。
> 想做自己的功能，或给 aiti 加东西，先读这一页。

> 📘 本页是框架总览；**完整的扩展开发手册**（从零教程 / 契约与 API 参考 / 插槽全表 /
> feature / AI 集成 / 部署发布）见 [扩展开发](/ext-dev/)。

## 1. 总体模型

```
浏览器（aiti-agent 前端）
  ├── <ExtSlot name="toolbar" />   ← 插槽：渲染扩展注册的 UI 项
  ├── <ExtSlot name="dialogs" />   ← 插槽
  └── ... 每个插槽由 ExtSlotsProvider 动态 import 扩展的 client bundle
          （预编译 ESM，React 由 host 注入，扩展不 import react）

aiti-agent server（Next.js）
  ├── instrumentation → extRegistry.loadAll() + startAll()
  │                       （jiti 加载 ~/.pi/web/extensions/*/index.ts）
  ├── /api/extensions/<id>/<path>  ← catch-all 壳 → 分发到扩展 server.api()
  ├── proxy.ts middleware         ← 扩展 server.middleware() 钩子（fail-closed）
  └── /api/extensions/manifest    ← 前端清单（ui 元数据 + clientUrl + i18n）
```

扩展 = 一个目录 + 一个入口文件（`default export` 扩展对象）。代码放
`~/.pi/web/extensions/<id>/`，运行时数据放 `~/.pi/web/data/<id>/`（代码/数据分离）。

## 2. 目录约定与来源分层

| 层 | 根目录 | 说明 |
|---|---|---|
| 用户 | `~/.pi/web/extensions/`（`PI_WEB_EXTENSIONS_DIR` 覆盖） | 正式安装位置 |
| extra | `PI_WEB_EXTRA_EXTENSIONS_DIRS`（逗号分隔） | 环境注入的中间层 |
| dev | `<aiti-agent 包目录>/dev-exts/` | 开发实例专用（如 dev 页面注入） |
| bundled | `<aiti-agent 包目录>/extensions/`（`PI_WEB_BUNDLED_EXTENSIONS_DIR` 覆盖） | 随包发布的基线 |

同名 id 优先级：**user > extra > dev > bundled**。

入口文件名：`index.ts` / `index.mjs` / `index.js` / `index.cjs`；目录内只有一个
脚本文件时也可单文件布局。加载用 jiti 转译 TS（`moduleCache: false`，热重载生效）。

## 3. 扩展对象契约

```ts
export default {
  id: "my-ext",               // 必须与目录名一致
  name: "My Extension",
  // ⚠️ version 不要手写：唯一事实源是 package.json（发布流程维护），
  //    仅当 package.json 无版本号时才回退读这里的值；新扩展禁止声明
  icon: "🧰",                 // 可选，UI 中标注扩展身份
  category: "debug",          // 可选，app-center 分类标签
  description: "一句话描述",   // 可选，缺省回退 package.json description
  client: "client/bundle.mjs",// 可选，前端 bundle 相对路径（预编译 ESM）

  server: {
    async startup(ctx) {},        // 启动钩子：建连接/起定时器/初始化
    async shutdown(ctx) {},       // 关闭钩子：清理/落盘（热重载/退出时调用）
    async api(req, ctx) {},       // API 分发：/api/extensions/<id>/<path...>
    async middleware(req) {},     // 可选：全局 middleware 钩子（fail-closed）
    async rescanBackends(ctx) {}, // 可选：POST /api/session-backends/rescan 重扫（后端型扩展）
    agent: {                      // 可选：per-agent-session 扩展点
      agentTools(info) {},        //   注入自定义工具到每个 agent 会话
      onAgentSession(info) {},    //   会话创建（⚠️ idle GC/热重载会重复调用，实现必须幂等）
      onAgentSessionEnd(info) {}, //   wrapper 销毁（reason: shutdown/fork/idle，≠ 会话文件被删）
      onAgentSettled(info) {},    //   一个 turn 结束
    },
  },

  ui: {                          // 插槽元数据（实际 UI 由 client bundle 渲染）
    toolbar: [{ id, label }],
    sidebar: [{ id, label, badge }],
    sessionTopbar: [{ id }],
    sessionRowActions: [{ id }],
    dialogs: [{ id, label }],
    banners: [{ id }],
    pages: [{ id }],
    chatInputTop: [{ id }],
    i18n: { en: {...}, "zh-CN": {...} }, // 客户端 ctx.t(key) 查表
    clientImmediately: true,     // 缺省 true；false = 懒加载（首次渲染到槽才物化 bundle）
    clientDependsOn: [],         // 客户端 bundle 依赖的其它扩展（预取提示，非正确性依赖）
    provides: [],                // 接管宿主内置能力（EXT_PROVIDES，如 "session-delete"）
  },

  features: [                    // 可选：feature 管理（extman 逐项启停，状态存 features.json）
    { id: "tool.my_tool", label: "注入工具", type: "boolean", default: true },
    // type: "boolean"(默认) | "string"(文本设置) | "textlist"(多行文本)
    // 约定：工具级 feature id = "tool.<注入工具名>"，宿主自动过滤禁用的工具
  ],
  conflicts: ["pi-subagents"],   // 可选：冲突扩展声明（平台按 npm 包名整体移除对方）
  dependsOn: ["aiti-float"],     // 可选：硬依赖（扩展 id 或 cap.* 能力名；声明式警告，不阻断加载）
  optionalDependsOn: [],         // 可选：软依赖（有则增强，缺失不警告）
  provides: ["cap.viewer"],      // 可选：提供能力（多家可同声明，平台仲裁有效提供方：用户钉选 > 接管声明者 > 新 semver > id 字典序）
  takeover: ["cap.viewer"],      // 可选：独占接管声明（同能力多家 = 冲突面板提示，仲裁单家生效）
  startupPriority: 0,            // 可选：服务端启动优先级（大者先启动、关停反序；基础设施扩展如 event-bus 用高值）
  publicApi: ["assets/x.js"],    // 可选：允许跨域 GET 的 API 路径白名单（精确匹配，服务端注入任意页面用）
};
```

> 完整字段语义以宿主权威源 `lib/ext/types.ts`（`PiWebExtension`）为准。

## 4. 插槽总览

前端插槽由 `components/ExtSlots.tsx` 的 `<ExtSlot name=.../>` 渲染。扩展在
client bundle 里 `ctx.registerItems(slot, items)` 注册实际组件。

| 插槽 | 挂载位置 | 承载 | 现有使用者 |
|---|---|---|---|
| `toolbar` | 顶部工具条（globe 旁） | 工具按钮（带图标/文案）；支持声明式条目（见下） | aiti-devtools（🧰 入口）、aiti-cmd、aiti-testagent（声明式） |
| `sidebar` | 侧栏头部（New/Refresh 旁） | 面板入口按钮 + 运行中数量徽标 | session-manager |
| `sidebarFooter` | 侧栏底部快捷操作行（模型/技能/插件同一排） | 快捷入口按钮（与内置同风格） | aiti-extman（🧩 扩展管理） |
| `sessionTopbar` | 聊天顶部栏 | 当前会话 tag 区（chips + ★ + 编辑） | session-manager |
| `sessionRowActions` | 侧栏会话行 hover 操作区 | 行内 ★ / tag 按钮 | session-manager |
| `dialogs` | AppShell 弹窗区 | 弹窗 | aiti-devtools、aiti-cmd（终端） |
| `banners` | 页面顶部告警区 | 告警条幅 | service-tunnels（自暴露告警） |
| `pages` | AppShell tab 系统 | 全页视图 | session-manager（看板） |
| `chatInputTop` | 聊天输入框上方 | 输入辅助区 | aiti-devtools（inspect 候选区）、demo-lazy（字数统计） |
| `userMessageActions` | user 消息底部 hover 操作区 | 消息级行为按钮 | aiti-prompts（收藏 prompt）、demo（📌） |
上表为**常用子集**——宿主插槽全表（**29+ 个**：上表 10 个之外还有 dock 族 `sidebarContent`/`sidebarProjects`/`rightFileDock`/`sidebarExplorerDock`/`terminalDock`/`compactLead`/`modelInfoLead`，聊天面 `chatOverlay`/`composerTools`/`assistantMessageActions`/`sessionRowMeta`/`userMessageActions`，模型/设置面 `modelSelector`/`sessionStats`/`settingsModels`/`settingsAgentsFeature`，新建会话面 `newSessionWidgets`/`newSessionSelectors`/`newSessionPreparers`/`newSessionBackendOptions`/`workspacePickerActions`/`queuePanel`/`fileViewer`/`pathPicker` 等）随宿主版本持续扩展。


### 插槽上下文（render props）

插槽组件收到 `currentSession` 与插槽 extra（如 `onSelectSession` / `activeCwd` /
`newSessionCwd`），感知当前选中的会话。

### toolbar 声明式条目（2026-08 契约）

工具条条目的外观（按钮/图标/分隔线）由**宿主统一渲染**，扩展不再各自手绘按钮 ——
杜绝逐扩展复制的样式常量漂移（历史上方案先行绿色图标/Plan 采认 📥/Java 圆角三家不一致）。

```js
// 完全声明式（无 render）：宿主渲染标准 36×36 灰度按钮（右分隔线+hover），⋯ 菜单里同款图标槽+文字
ctx.registerItems("toolbar", [{
  id: "java",
  meta: {
    label: "Java",                         // ⋯ 菜单文字 + 兑底 title
    title: t("at.title"),                  // 悬停提示（可选）
    icon: { svg: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>' },
    onClick: () => panel.open(),           // 点击回调（参数为点击事件）
  },
}]);

// 带状态条目（有 render）：render 只负责工具条本体（徽标/状态色）；
// meta.icon + meta.onClick 提供后，⋯ 菜单里的图标槽与点击归宿主，render 的 menu 分支不再被使用
ctx.registerItems("toolbar", [{
  id: "plan-review-open",
  render: ToolbarButton,                   // 含 pending 徽标/高亮
  meta: { label: "Plan 采认", icon: { svg: "..." }, onClick: () => setPanelOpen(true) },
}]);
```

`meta.icon` 三种形态（`ExtUiItemIcon`）：

- `{ svg: "..." }` —— 24×24 viewBox 的 SVG 内部标记字符串（lucide 线条风格，stroke=currentColor）
- emoji 字符串（如 `"📥"`）
- 扩展内 `.svg` 文件相对路径（如 `"icon.svg"`；CSS-mask 渲染，颜色随 currentColor）

约束：声明式条目仅 `toolbar` 插槽支持；`sessionTopbar` 等交互 widget 槽仍必须提供 render。
消费方统一用 `hasExtRender()` 收窄（ExtSlot/pathPicker/FileViewer 已内置过滤）。

### 插槽外扩展点

除了插槽，客户端 `register(ctx)` 还提供一批行为级扩展点：

- **`ctx.registerChatHook({ preSend })`** — 聊天发送钩子：发送前改写文本 /
  收集候选元素（aiti-devtools 的 `[元素N]` 替换即用此实现）。
- **`ctx.registerParagraphClick(handler)`** — 消息段落点击接管（取代旧
  `registerPopoverAction`，点按识别弹层全在扩展实现）：用户点击段落 → 宿主把段落纯文本 +
  上下文 + 锚点 rect 广播给每个 handler（可多个）→ 扩展自定识别/弹层/动作。handler 可带
  `hint`（悬停提示文案）与 `tags`（声明需要点击的语义块标签，默认 p/li/tr，可扩到 h1-h6），
  info 提供 `setInline(node)`（段后内联挂载点）与 `close()`。aiti-cmd 命令识别、aiti-msg-smart
  引用回复即用此。
- **`ctx.registerSessionForkGate(gate)`** — 分叉/编辑重发前置门禁：fork 前按注册序 await，
  返回 false 或抛异常取消（如 git-trace 的三选一回滚门）。返回 disposer（HMR 精准摘除）。
- **`ctx.registerComposerEnhancement(enh)`** — composer 增强链：值观察 / 会话键切换 / 发送前钩子。
- **三条去核化接管面**：`registerRecoveryItemsProvider`（恢复对话框条目）、`registerDraftApi`
  （草稿存储全权）、`registerQueuePanelController`（队列面板控制器，ext → core 反向通道）。
- **`ctx.registerTopicItem(topic, item)`** — 话题条目（扩展间间接耦合：发布到抽象主题，消费方
  交互时 `getTopicItems(topic)` 拉取；主题 id 与载荷结构由消费方定义，core 不解释内容）。

## 5. 服务端钩子

| 钩子 | 时机 | 用途 |
|---|---|---|
| `startup(ctx)` | 服务启动（instrumentation `startAll`） | 建连接、起定时器、初始化状态 |
| `shutdown(ctx)` | 热重载/退出 | 清理、落盘 |
| `api(req, ctx)` | `/api/extensions/<id>/<path...>` 命中 | 扩展自己的 API（返回 `null` = 404） |
| `middleware(req)` | 每个请求，DNS-rebinding 门禁之前 | vhost 分支、门禁等（**抛异常 = fail-closed 403**） |
| `rescanBackends(ctx)` | POST `/api/session-backends/rescan` | 后端型扩展重跑探测+注册（幂等；startup 只扫一次，装完 CLI 后靠它补扫） |
| `agent.agentTools(info)` / `agent.onAgentSession(info)` / `agent.onAgentSessionEnd(info)` / `agent.onAgentSettled(info)` | 每个 agent 会话（方案 M，进程内零配置注入） | 注入自定义工具 / 会话生命周期回调（⚠️ idle GC 与热重载会重复触发 onAgentSession，实现必须幂等；宿主派发前回收上一轮 subscribeEvent 订阅） |

`ctx`（服务端）：`{ id, dir, configDir, stateDir, cacheDir, core, services, features, sessionProviders, sessionAnnotations, invokeAI? }`，其中：

- `dir`：扩展代码目录（只读，供静态资源）；
- `configDir` / `stateDir` / `cacheDir`：**三层数据目录**（2026-09 起，`~/.pi/web/data/<id>/` 下的
  `config/` / `state/` / `cache/` = 配置 / 不可再生数据 / 可再生缓存）；**`ctx.dataDir` 已移除（访问即抛）**，
  判定决策树见 [扩展数据与存储规范](/guide/ext-data.md)；
- `services`：跨扩展服务定位器（provide/get/require/onChange）——唯一正道，规范见
  [扩展服务与跨扩展调用规范](/guide/ext-services.md)；
- `features`：feature 状态读写（get/on，extman 管理的逐项启停）；
- `sessionProviders` / `sessionAnnotations`：会话后端注册槽 / 会话列表注记槽（多 agent 前端）；
- `invokeAI?`：通用 AI 调用（system+messages → `{ text, usage }`；core 零业务逻辑零统计，组装/记账全是调用方责任）；
- `core`：核心数据契约，扩展**不要自己实现**会话读取/运行态/文件访问：

```ts
interface ExtCoreApi {
  listSessions(options?);         // 会话列表（增量缓存；{ refresh: true } 绕过 5s 扫描缓存）
  getRunningSessionIds();         // RPC 运行集
  getAliveSessionIds();           // 存活（含 idle）rpc 会话——磁盘写守卫必须包含
  stopAliveSession?(id);          // 释放存活 idle 会话（老宿主可能没有——先判存在）
  getHomeDir();
  readSession(id);                // 完整会话上下文（消息 + entry ids）
  readModelsConfig();             // 读 models.json（统一走此 API，含缓存失效）
  writeModelsConfig(data);        // 写 models.json（归一化 + 立即生效）
  fileAccess: { allowRoot(root); isAllowed(p); }  // 复用 aiti-agent 的文件安全规则
}
```

## 6. 客户端 bundle 协议

- `ui.client` 指向**单个预编译 ESM 文件**（可 esbuild 打包，也可直接手写 `.mjs`；需要 JSX/npm 依赖用
  [ext-jsx-client 模板](/extensions/ext-jsx-client.md)）。
- bundle `default export function register(ctx)`，ctx 主要成员分组（完整清单见宿主
  `components/ExtSlots.tsx` 的 `ExtClientContext`）：

  - **React 全家桶**：`h` + 全部 hooks（useState/useEffect/useLayoutEffect/useRef/useCallback/useMemo/
    useContext/useId/createContext/forwardRef/memo…）+ `createPortal`（fixed 定位逃逸 transformed 祖先用）；
  - **i18n / 网络**：`t(key, params)`（查扩展自己的 `ui.i18n` 表）、`apiUrl(path)`、`getLocale()`；
  - **插槽**：`registerItems(slot, items)` / `disposeItems(slot, ids)` / `useSlotItems(slot)` /
    `renderSlot(name, props)`（扩展在自己树内嵌宿主插槽）；
  - **行为级扩展点**：`registerChatHook`（发送前改写）、`registerParagraphClick`（段落点击广播）、
    `registerSessionForkGate`（分叉前门禁）、`registerComposerEnhancement`（composer 增强）、
    `registerRecoveryItemsProvider` / `registerDraftApi` / `registerQueuePanelController`（三条去核化接管面）；
  - **跨扩展**：`registerExtService` / `getExtService` / `onExtServiceChange`（客户端服务）、
    `registerTopicItem` / `getTopicItems`（话题条目）；
  - **宿主能力**：`openFile` / `openFolder` / `revealDir` / `getFileTabs` / `closeFileTabs` /
    `appendText` / `writeComposerValue` / `restoreComposerDraft` / `sendChatMessage` / `queueFollowUp`；
  - **feature / 生命周期**：`getFeatures()` / `onFeatureChange(cb)` / `reloadExtensions()` /
    `ensureMaterialized(id)` / `ensureSlotMaterialized(slot)`。
- **不 import react**：`h` 与 hooks 由 host 传入（React 单实例，host shim 委托）。
- 组件 = `(props) => ReactNode`（props 含 `currentSession` 与插槽 extra；**extra 只喂数据，回调一律走服务**）。
- **Rules of Hooks**：hooks 必须在条件返回之前调用。

## 7. 生命周期

```bash
# 服务端代码改动 → 热重载（jiti moduleCache:false，代码生效）
curl -X POST http://127.0.0.1:<端口>/api/extensions/reload   # dev 实例

# 前端 bundle 改动 → reload 后刷新浏览器（ESM module map 缓存）
curl http://127.0.0.1:<端口>/api/extensions/status           # 加载状态/版本/错误
```

热重载：逐个 `shutdown()` → 清缓存 → `loadAll()` → `startAll()`，成功后原子
swap `globalThis.__piWebExt`；单个扩展加载失败不阻塞其它扩展（错误进 status）。

## 8. 安全与约束

- 扩展 = **完全服务器权限代码**，只从受信目录加载（`~/.pi/web/extensions/`）。
- `middleware` 钩子异常 → fail-closed 403（aiti-agent core 兜底）。
- 新业务功能**不得写进 aiti-agent 仓库**；需要 core 新能力 → 扩展 `ctx.core` 契约
  或插槽入参（先改契约/插槽，业务仍在扩展实现）。

## 9. 现有扩展

| 扩展 | 位置 | 说明 |
|---|---|---|
| session-manager | `~/.pi/web/extensions/session-manager/` | 跨项目会话面板：tag 树+颜色 / 收藏 / 搜索（FTS5）/ 归档（.pwarc）/ 看板 |
| service-tunnels | `~/.pi/web/extensions/service-tunnels/` | 服务端口发现 + 隧道 + 自暴露（middleware 钩子使用者） |
| aiti-devtools | 主仓库源码 → 部署产物 | 页面内 AI 调试助手：MCP 桥 + 注入 + AI 窗口（toolbar/dialogs/chatInputTop + ChatHook） |
| aiti-cmd | `~/.pi/web/extensions/aiti-cmd/` | 命令管理器：真 PTY 终端 + 常用命令 + 消息识别命令（PopoverAction 使用者） |
| demo | `~/.pi/web/extensions/demo/` | 全插槽演示（框架验证用，可删除） |
| dev-exts/aiti-inject | 主仓库 `dev-exts/` | dev 实例专用：注入生产 launcher（FAB）到 dev 页面 |

## 10. 需要新的扩展点？

现有插槽/钩子不够用时：

1. 在 **aiti-agent 仓库**开 PR 加扩展点：
   - `lib/ext/types.ts`：`ExtSlotName` 加插槽名、或加新契约字段；
   - `components/ExtSlots.tsx`：加 `<ExtSlot name="..." />` 挂载位置、
     扩展 `ExtClientContext`（如新 hook）；
   - 服务端同理：`lib/ext/types.ts` 的 `ExtServerHooks` / `ExtCoreApi` 加能力。
2. **业务代码仍在扩展里写**，核心只留挂载点和契约。

这样扩展生态可以独立演进，核心保持小而稳。
