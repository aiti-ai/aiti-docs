---
title: 队列管家（aiti-queue-keeper）
icon: 📋
ext:
  id: aiti-queue-keeper
  name: Queue Keeper
  description: 队列面板接管 —— 完整队列 UI（横幅/行操作/拖拽排序/回收站/撤销条/导入导出），core 回到上游同形兜底
  soul: 排队不可怕，可怕的是排完队忘了自己要说什么。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    cd dev-repo/aiti-queue-keeper && npm install && node tools/deploy.mjs
  license: MIT
  tags: [queue, panel, drag-sort, trash, import-export, defork]
---

# aiti-queue-keeper

> ❝ **排队不可怕，可怕的是排完队忘了自己要说什么。** ❞

pi-web 去 fork 化 P3 的产物（`docs/pi-web-queue-cluster-ext-plan.md`）：把 ChatInput 内
~900–1000 行队列增强 UI 外迁为独立扩展；core 回到「上游同形机制 + 薄接入」——
实测 ChatInput fork 行 +2556 → +1617（净减 939），队列关键词行 112 ≤ 150 退出标准。

## 功能（接管态）

- **队列横幅**：折叠/展开、计数、Recall all（全部取回编辑）
- **行操作**：↑↓ 移动、拖拽排序（桌面 HTML5 / 移动触摸双实现）、steer-send 插队、
  转 follow-up、单条取回、删除
- **回收站**：软删条目可恢复/彻底删除（单条/全部，确认文案）
- **撤销条**：删除后 8s 窗口一键撤销
- **导入导出**：JSON 导出下载；导入经暂存弹出恢复对话框逐条决定
- **通知条**：导入/删除/回收站反馈（空队列也可见）

## 架构（数据零迁移）

- **core 保机制**：rpc-manager 队列镜像 / sidecar 持久化 / 12 个 RPC / trash 全部留核；
  ChatInput 只留 ExtSlot 单行接入 + edit-intent 检查 + bottomMode 三态 + 上游同形兜底 banner
- **扩展保策略**：全部 UI 状态在本扩展 `client/src/QueuePanel.tsx`；操作统一经
  **actions 原语**（`QueuePanelProps.actions`）调 core RPC，**扩展零自有存储**——
  关停扩展只是回到兜底 banner，任何状态下数据无损
- **契约**：core `lib/composer/queue-api.ts`（类型 + controller bus）↔ 扩展
  `client/src/types.ts`（结构镜像）；下载导出/导入解析经
  `actions.downloadExport/parseImport` 透传 core 纯函数（单实现，扩展零逻辑）

## 控制流

- **core → ext**：ChatInput 组装 `QueuePanelProps`（live 投影 + trash + actions + isMobile）经插槽传入
- **ext → core**：`ctx.registerQueuePanelController({expand, notice})`——core 恢复流
  （恢复对话框处理完 / continue queue 后）调用 `getQueuePanelController()?.expand()`
  强制展开面板；无接管时 no-op（兜底 banner 无折叠态）
- **接管判定**：ChatInput 按 queuePanel 插槽实际项判定（feature 关闭 / 卸载 / 异步
  加载未完成 → 回落兜底 banner）

## feature

- `queuePanel.enabled`（extman 逐项启停）：关闭即回落 core 兜底，**实时生效**无需刷新页面

## 与 aiti-draft-keeper 的协同

两个 keeper 不直接对话，全部经 core 契约层交汇：草稿恢复项与队列恢复项在 core
QueueRecoveryDialog 合流；草稿「Re-queue」经 core queueFollowUp 入队（本扩展渲染）；
恢复解析后 core 调 controller.expand() 展开本扩展面板；行内取回经 core edit-intent
写框（草稿 keeper 经 onChange 观察到同一值）。

## 构建 / 部署

```bash
npm install            # 首次（vite）
npm run build:client   # vite lib mode → client/aiti-queue-keeper.mjs
node tools/deploy.mjs  # 构建 + 拷贝到 ~/.pi/web{,-dev}/extensions/
```

生效：`POST /api/extensions/reload`；client 刷新页面即新（内容哈希 rev）。
