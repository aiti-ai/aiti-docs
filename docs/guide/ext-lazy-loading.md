---
title: 扩展客户端懒加载契约（v2 两段式）
icon: ⚡
description: clientImmediately:false 两段式条目 + 物化规则收窄——什么时候能标懒、怎么改、已知陷阱
tags: [guide, ext, lazy-loading, extension, performance]
---

# 扩展客户端懒加载契约（v2 两段式）

把扩展 client 标为 `ui.clientImmediately: false` 即懒扩展：**冷启动不加载你的 client bundle**，直到某条显式通道拉起。全仓 15+ 扩展已懒化（冷启动请求 42→28），M1-M3/D1/D3 已实施。

## 1. 物化规则（宿主机制）

懒扩展不再靠「常挂插槽首渲染」触发——常挂插槽（toolbar/sidebar/chatInputTop 等 20+）的**自动通道对懒扩展整体关闭**。只有三条显式通道拉起：

1. **静态条目点击**（两段式，见 §2）——manifest `ui[slot][]` 声明由宿主在物化前渲染成标准按钮，点击 → 宿主 `ensureMaterialized` 拉起 → 转发注册条目 `meta.onClick`/`meta.open`；
2. **交互时挂载插槽**（`INTERACTIVE_SLOTS`：sessionStats/fileViewer/pathPicker/terminalDock/settingsModels/settingsAgents/settingsAgentsFeature/rightFileDock）——插槽首渲染即拉起全部声明扩展；
3. **显式 API**：`ctx.ensureMaterialized(id)` / `ctx.ensureSlotMaterialized(slot)`（跨扩展拉起、接管跳板、extman「打开」按钮均已内置）。

## 2. 两段式条目 SOP（toolbar 按钮型标懒，~15 行）

- **manifest 侧** `ui.toolbar[]`：`{ id, label, title, icon, feature? }`
  - **id 必须与 client `registerItems("toolbar",[...])` 的 raw id 一致**——宿主静态呈现复合 id `extId:rawId`，注册条目按同键覆盖；错位 = 双按钮（宿主 dev 告警）。
  - **icon 必须给**（缺省渲染 label 首字符占位）；feature 门控写 `feature` 字段（关 → 宿主不渲染静态按钮）。
- **client 侧** entry：toolbar 条目**删除 `render`**，改 `meta: { label, title, icon, onClick }`（保留 `meta.open` 供 extman）——声明式条目宿主统一渲染标准 36×36 按钮。
- **冒烟**：冷启动 F12 无本扩展 client 请求 → 静态按钮可见 → 点击加载并打开 → 按钮零闪变 → ⋯ 菜单行同可用。

可运行样板：[demo-lazy](/extensions/demo-lazy.html)（两段式最小实现）。

## 3. 已知陷阱（实测踩过）

| 陷阱 | 说明 |
|---|---|
| ui 声明与 client 注册 id 历史错位 | 双按钮；aiti-channels/ui-env/aiti-helper 三处已在批量转换中修正 |
| `clientImmediately` 写错位置 | 必须写在 `ui.*` 下——写扩展顶层是从未生效的死配置（aiti-editor 曾中招） |
| 错放插槽 | toolbar 里声明 pages/dialogs 条目会变幻影静态按钮（helper 曾中招） |
| deploy 清单漏文件 | 扩展 deploy 脚本按清单拷文件——新增共享模块（如 backend-queue.ts）必须同步加清单 |
| bundle 代码分块 | 动态 import/React.lazy 产生分块时，deploy 必须改用 `_shared/copy-client-bundle.mjs` 的 `copyClientBuild(root, extDir, "主bundle.mjs")`，否则分块 404。存量 33 个 deploy 均为单文件拷贝，**加动态 import 前必改** |
| 唯一入口不得标懒 | 常挂接管/动态状态型入口、新会话页等「唯一入口」保持即时或走拆包——标懒后入口消失（aiti-acp-agent 曾被回滚） |

## 4. 拆包（路线 B）

不想整体懒、但 bundle 太重：入口薄壳即时 + 重 UI 按需 `import()` 分块。样板：aiti-folder（folder-actions 开放点抽薄模块 + FolderBrowserLazy 包装）、D1 model-wizard（薄壳 entry 11.5K + 重 chunk 524K 按需）。deploy 脚本需拷全部 hash 分块（`copyClientBuild`）。

## 5. 决策树（标懒前过一遍）

- 有 toolbar/sidebar 常挂按钮 → 两段式（§2）可标懒
- 只在交互时挂载插槽出现 → 天然可懒（无需改造）
- 被其他扩展拉起/接管别人 → 对方经 `ensureMaterialized` 拉起，可懒，但 client 服务注册会迟到——消费方判空降级是必须项（见 [ext-services](/guide/ext-services.html) §3）
- 唯一入口 / 接管 core 内置（modelSelector 等） → 不标懒，重了走拆包
