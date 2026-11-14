---
title: 客户端 ctx API
icon: 🎛️
description: client bundle 的 register(ctx) 完整成员参考——React 全家桶、i18n、插槽、行为级扩展点、宿主能力、feature 与懒加载
tags: [ext-dev, client, api, reference]
---

# 客户端 ctx API

client bundle `default export function register(ctx)` 收到的上下文。
唯一事实源：`components/ExtSlots.tsx`（`ExtClientContext`）。

## 0. 基本约定

- **不 import react**：`h` 与全部 hooks 由宿主传入（React 单实例，host shim 委托）。
- 组件 = `(props) => ReactNode`；props 含 `currentSession`（`{ id, cwd, name?, firstMessage? } | null`）与插槽 extra。
- **Rules of Hooks**：hooks 必须在条件返回之前调用（对宿主注入的 hooks 同样生效）。
- 标注 `?` 的成员在**老宿主可能缺席**——消费前判存在。

## 1. React 全家桶

| 成员 | 说明 |
|---|---|
| `h` | createElement |
| hooks | `useState` / `useEffect` / `useLayoutEffect` / `useRef` / `useCallback` / `useMemo`（必选）；`useContext` / `useReducer` / `useSyncExternalStore` / `useImperativeHandle` / `useId`（?老宿主可能缺席） |
| `createContext`? / `forwardRef`? / `memo`? | 组件原语（?老宿主可能缺席） |
| `createPortal(children, container)` | Portal 到任意 DOM 节点（渲染进 transformed 祖先内的 fixed 定位元素需要它逃逸） |
| `renderSlot(name, props?)`? | 在扩展自己树内嵌宿主插槽（返回宿主 ExtSlot 元素；props 支持 `only: "extId:itemId"` 单条目渲染——DockStack 分格用） |
| `useSlotItems(slot)`? | 响应式读插槽条目（hook，须在组件渲染体内调；含懒加载 boot 副作用与 store/locale 订阅；返回 `"extId:itemId"` 组合 id 列表） |

## 2. i18n / 网络

| 成员 | 说明 |
|---|---|
| `t(key, params?)` | 用本扩展 `ui.i18n` 表翻译；声明 `LocaleNamespaceMap` 后 key 获得类型检查 |
| `apiUrl(path)` | 拼扩展/宿主 API 路径 |
| `getLocale()`? | 当前 UI locale（Intl 格式化用；跟随宿主语言设置） |

## 3. 插槽

| 成员 | 说明 |
|---|---|
| `registerItems(slot, items)` | 注册条目：`{ id, render?, meta?, feature? }` |
| `disposeItems(slot, ids)` | 精确摘除（DSH effect 语义；HMR 失效用） |
| `getExtProvides()`? | 读所有扩展 `ui.provides` 声明集合（静态 manifest，非 hook） |
| `ensureSlotMaterialized(slot)`? | 确保声明该槽的所有懒扩展物化（跳板/交互时槽用） |

插槽全表 → [插槽参考](/ext-dev/slots.md)。

## 4. 行为级扩展点

| 成员 | 说明 |
|---|---|
| `registerChatHook({ preSend? })` | 聊天发送钩子：`preSend(text) => { text?, elements? } | null`——发送前改写文本/收集候选元素（devtools 的 `[元素N]` 替换） |
| `sendChatMessage(text, mode, images?)` | 程序化发送（与用户输入同路径：preSend hooks 生效；idle 直发，streaming 按 mode steer/followUp）；不清输入框 |
| `queueFollowUp(text, images?)` | 仅入队不触发（idle 也只入队；「重新排队」语义） |
| `registerParagraphClick(handler)` | 消息段落点击接管：宿主广播段落纯文本+上下文+锚点 rect；handler 可带 `hint`（悬停提示）与 `tags`（可点标签，默认 p/li/tr 可扩 h1-h6）；info 提供 `setInline(node)` / `close()` |
| `registerSessionForkGate(gate)` | 分叉/编辑重发前置门禁：按注册序 await，false/抛异常取消（返回 disposer，HMR 精准摘除） |
| `registerComposerEnhancement(enh)` | composer 增强链：值观察 / 会话键切换 / 发送前钩子 |
| `registerRecoveryItemsProvider(provider)`? | 恢复对话框条目提供方（遗留输入合并进恢复对话框） |
| `registerDraftApi(api)`? | 注册草稿存储 API（草稿功能全归实现方——draft-keeper 契约） |
| `registerQueuePanelController(ctrl)`? / `getQueuePanelController()?` | 队列面板控制器（ext → core 反向通道；无接管时 core 回退 banner 且 expand 为 no-op） |

## 5. 跨扩展（客户端服务与话题）

| 成员 | 说明 |
|---|---|
| `registerExtService(key, impl)`? | 注册客户端服务（key 强制 `"<extId>."` 前缀；同页进程内直调，无 HTTP）；返回 disposer |
| `getExtService(key)`? | 同步读服务（缺席 undefined——提供方懒加载未就绪时消费方必须降级） |
| `onExtServiceChange(cb)`? | 订阅服务 up/down（提供方物化/卸载） |
| `registerTopicItem(topic, item)` | 发布话题条目（扩展间间接耦合；主题 id 与载荷由消费方定义，core 不解释）；返回 disposer |
| `getTopicItems(topic)` | 同步读某话题全部条目（消费方交互时调） |

服务规范与宿主能力服务（`pi-web.ui` / `pi-web.composer` / `pi-web.newSession`…）→
[扩展服务与跨扩展调用规范](/guide/ext-services.md)。

## 6. 宿主能力（文件 / 标签页 / composer）

| 成员 | 说明 |
|---|---|
| `openFile(path, fileName?, options?)`? | 打开文件 tab（fileName 缺省取路径尾段；OpenFileOptions 透传宿主） |
| `openFolder(path, folderName?, options?)`? | 打开文件夹 tab（右栏 FolderViewer；仅展示不改 cwd） |
| `revealDir(absPath)`? | 在侧栏文件树中揭示目录 |
| `getFileTabs()`? | 读当前打开 tabs（数组序 = 打开序；`{ id, filePath, kind?: file|folder|dock|agent, pinned? }`）——批量关闭/容量控制原语 |
| `closeFileTabs(ids)`? | 关闭给定 tabs（仅状态移除 + 活动页重索引；脏确认/钉住保护是扩展责任） |
| `appendText(text)`? | 追加文本到输入框不发送（引用回复预填用） |
| `writeComposerValue(text)`? | 程序化写值（受控路径：state → DOM 同步 effect；未挂载返回 false） |
| `restoreComposerDraft(draft)`? | 完整恢复草稿（文本+图片；raw 不过 hooks；未挂载返回 false——调用方不得消费草稿） |
| `getComposerTrashWriter()`? | 读清空入回收站执行器（onClearToTrash 实现方用） |

## 7. feature / 生命周期 / 懒加载

| 成员 | 说明 |
|---|---|
| `getFeatures()`? | 同步读本扩展全部 feature 生效值（`Record<string, boolean | string>`；宿主一次拉全，零额外请求） |
| `onFeatureChange(cb)`? | 订阅本扩展 feature 变化（extman 编辑后触发）；返回退订函数 |
| `reloadExtensions(opts?)`? | 触发宿主侧扩展重载（fresh manifest + 图谱调和 + 失效物化）；`opts.resyncOnly` 跳过 POST /reload（调用方已自行服务端 reload）只重拉 manifest；老宿主忽略该标记降级全量 |
| `extLoaderState()`? | 当前 loader 状态（`{ materialized, prefetched }`）——扩展管理 UI 展示用 |
| `ensureMaterialized(id)`? | 确保某扩展 client 物化（幂等；静态入口点击转发 / extman 空开 / 跨扩展交互时引导用）；返回是否本次完成注册 |

feature 声明侧 → [feature 声明与消费](/ext-dev/features.md)；懒加载机制 → [懒加载契约](/guide/ext-lazy-loading.md)。
