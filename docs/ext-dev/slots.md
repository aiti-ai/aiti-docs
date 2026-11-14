---
title: 插槽全表
icon: 🧩
description: pi-web 全部 UI 插槽分组速查——挂载位置、props 契约、声明式条目支持情况
tags: [ext-dev, slots, reference]
---

# 插槽全表

前端插槽由宿主 `components/ExtSlots.tsx` 的 `<ExtSlot name=.../>` 渲染。扩展在 client bundle 里
`ctx.registerItems(slot, items)` 注册实际组件；也可以在 entry `ui` 里声明静态条目（懒加载 v2，
宿主在 client 物化前渲染「零 bundle 入口」）。

唯一事实源：`lib/ext/types.ts`（`ExtSlotName` + `ExtSlotContractMap`）。插槽随宿主版本持续增加，
本表按宿主 2026-11 快照整理。

## 1. 使用方式

```js
// 运行时注册（client bundle 的 register(ctx) 内）
ctx.registerItems("toolbar", [{
  id: "open",
  // 声明式条目（仅 toolbar 支持）：宿主统一渲染标准按钮
  meta: { label: "Open", icon: { svg: '<path d="..."/>' }, onClick: (e) => {} },
}]);

// 带状态条目：render 负责本体（徽标/状态色）
ctx.registerItems("sessionTopbar", [{
  id: "tags",
  render: (props) => h("div", null, props.currentSession?.name ?? ""),
}]);
```

- 条目 = `{ id, render?, meta?, feature? }`；组合 id = `"extId:itemId"`。
- `render(props)` 收到 `currentSession` + 插槽 extra（`ExtSlotPropsWithBuiltIn`）。
- `ctx.disposeItems(slot, ids)` 精确摘除（HMR 语义）。
- **extra 只喂数据，回调一律走服务**（[宿主插槽红线](/guide/ext-services.md) §5.1）。

## 2. 插槽分组速查

### 工具条与全局入口

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `toolbar` | 顶部工具条（globe 旁） | 工具按钮；**唯一支持完全声明式条目**（宿主渲染 36×36 灰度按钮 + ⋯ 菜单） |
| `sidebar` | 侧栏头部（New/Refresh 旁） | 面板入口按钮 + 运行徽标 |
| `sidebarFooter` | 侧栏底部快捷操作行 | 与内置模型/技能/插件同排的快捷入口 |
| `banners` | 页面顶部告警区 | 告警条幅 |
| `pages` | AppShell tab 系统 | 全页视图 |
| `dialogs` | AppShell 弹窗区 | 弹窗 |

### 会话列表

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `sessionTopbar` | 聊天顶部栏 | 当前会话 tag 区（chips + ★ + 编辑） |
| `sessionRowActions` | 会话行 hover 操作区 | 行内 ★ / tag 按钮 |
| `sessionRowLeading` | 会话行前置位 | 行首装饰/状态 |
| `sessionRowMeta` | 会话行第二行 meta 尾部 | 行内元信息（如 plan 徽标 + tags） |
| `sidebarProjects` | 左栏「Projects」列表全接管 | SidebarClone（session-manager；props 全透传，契约即 SessionSidebarProps） |
| `sidebarContent` | 左侧栏整体接管（AppShell 层） | Header + DockStack 块栈 + 底行（统一 dock 方案；无条目回退原生侧栏） |
| `sidebarTasks` | 左栏「Tasks」区 | 子代理任务块（float 扩展；无条目不渲染） |

### 聊天面

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `chatInputTop` | 聊天输入框上方 | 输入辅助区（inspect 候选区等） |
| `chatOverlay` | 消息区上浮层 | 消息滚动导航等浮动工具条 |
| `composerTools` | 输入框下控制行 | 与压缩/停止/导入队列同排（git-trace 时间线入口等） |
| `composerAffix` | 输入框内右缘 affix 位 | 移动端 🎤 等（仅移动输入行渲染；与内置 × 天然互斥） |
| `userMessageActions` | user 消息底部 hover 区 | 消息级行为（📌 收藏 prompt 等） |
| `assistantMessageActions` | assistant 消息底部 hover 区 | 消息级行为（🔊 朗读等） |
| `assistantMessageFooter` | assistant 消息内容区末尾 | turn 级聚合信息（变更文件行等；契约 `AssistantMessageFooterSlotProps`） |
| `modelInfoLead` | 移动端 model-info 前导位 | 上下文比例条（契约 `ModelInfoLeadSlotProps`） |
| `compactLead` | 桌面压缩按钮左邻位 | 同上（桌面版，isMobile 恒缺省） |
| `sessionRequestCard` | 「请求-应答」浮层卡接管缝 | 交互原语/工具授权/验证码三类卡统一接管（契约 `SessionRequestCardSlotProps`；kind 路由，miss 回退宿主极简卡） |
| `queuePanel` | 队列面板 | 队列 UI 全接管（契约 `QueuePanelProps`；无接管回退 fallback banner） |
| `recoveryDialog` | 队列恢复对话框 | 恢复 UI 接管（live props 注入，渲染条件留在 core） |

### 模型与设置面

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `modelSelector` | 聊天输入模型按钮接管 | 注册即替换原生 ModelSelector（契约 `ModelSelectorSlotProps`；未注册回退原生） |
| `modelSelectorFooter` | 模型下拉底部操作区 | 管理模型入口（契约 `ModelSelectorFooterSlotProps`） |
| `sessionStats` | 会话统计下拉内 | 报告入口行（usage-report 等） |
| `settingsModels` | 设置「模型」页全接管 | 注册即替换原生 ModelsConfig（契约 `SettingsModelsSlotProps`） |
| `settingsAgentsFeature` | 设置 Agents 页顶部 feature 块 | 引擎 banner + 入口（契约 `SettingsAgentsFeatureSlotProps`） |
| `settingsAgents` | 设置「子代理」页全接管 | 注册即替换原生 AgentsConfig（契约 `SettingsAgentsSlotProps`） |

### 新建会话面

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `newSessionSelectors` | 新会话页 Workspace×Backend 之间的选择器行 | 分支/worktree 选择器等（extra 只带 `{ cwd, isMobile }`；副作用统一走 `newSessionPreparers`） |
| `newSessionPreparers` | （注册面，无渲染） | 首条消息发送前的准备管线：`meta.prepare({cwd}) => { cwd? } / { abort }` |
| `newSessionBackendOptions` | 新会话页 Backend 下拉内扩展条目 | 每条目一个 `<option>`，选中跑 `meta.onClick` |
| `newSessionContextTrailing` | Workspace×Backend 盒子之后的尾随按钮 | 上传工作区捷径等（契约 `NewSessionContextTrailingProps`；移动 composer 走 `pi-web.newSession` 服务） |
| `newSessionWidgets` | 新会话欢迎页上/下组件区 | 注册面双渲染点（meta 声明 areas/网格尺寸，契约 `NewSessionWidgetSlotProps` + `NewSessionWidgetMeta`） |
| `noWorkspaceGuide` | 无工作区占位全替换 | 全新首屏引导（契约 `NoWorkspaceGuideSlotProps`；动作走 `pi-web.newSession.setCwd` 等服务） |

### 文件与工作区

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `fileViewer` | 文件查看/编辑接管 | 文本编辑/文件夹浏览等（跳板渲染，需 match 谓词；未注册回退原生 viewer） |
| `pathPicker` | 目录选择能力 | 顶栏「打开文件夹」等消费（条目带 `render({path,onSelect})`） |
| `workspacePickerActions` | cwd 选择下拉底部操作区 | 工作区列表管理（契约 `WorkspacePickerActionsProps`） |
| `terminalDock` | 右侧文件区终端 tab 内容接管 | 真 PTY 终端视图（契约 `TerminalDockSlotProps`；tab⇄dialog 单例切换） |

### Dock 族（浮动停靠）

| 插槽 | 挂载位置 | 承载 |
|---|---|---|
| `sidebarExplorerDock` | 侧栏文件区下方竖向 dock | 折叠头 + 条目竖排（无条目整块不渲染） |
| `rightFileDock` | 右栏 dock | 每条目派生 TabBar tab（`dock:<extId>:<itemId>`；与文件/终端 tab 互斥切换） |

## 3. 类型契约（ExtSlotContractMap）

已声明 props 类型的插槽在 `ExtSlotContractMap` 里带契约（上表「契约」列）；未声明的插槽
props 退化为宽松 `Record<string, unknown>`（向后兼容）。扩展（TS 编写的 client）可用
augmentation 补充/覆盖自己用到的插槽契约：

```ts
declare module "dev-repo/ext" {
  interface ExtSlotContractMap {
    chatInputTop: { props: { inputValue: string } };
  }
}
```

宿主已声明的契约（如 `queuePanel`）直接并入；扩展按结构契约消费。**类型级文档，无运行时效果**。

## 4. 声明式条目约束

- 完全声明式（无 render）**仅 `toolbar` 插槽**支持；`sessionTopbar` 等交互 widget 槽必须提供 render。
- 带 render 的条目若同时提供 `meta.icon` + `meta.onClick`，⋯ 菜单里的图标槽与点击归宿主，render 的 menu 分支不再被使用。
- 消费方（宿主内部）统一用 `hasExtRender()` 收窄（ExtSlot/pathPicker/FileViewer 已内置过滤）。
- `ui[slot]` 静态条目的 `feature` 门控与 client 注册条目的 `feature` 接管关系见[懒加载契约](/guide/ext-lazy-loading.md)。
