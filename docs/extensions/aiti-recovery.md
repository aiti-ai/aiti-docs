---
title: aiti-recovery
icon: 🔄
ext:
  id: aiti-recovery
  name: aiti-recovery
  description: 恢复 UI 扩展——队列恢复对话框（会话中断排队消息逐条决议）+ 重启恢复向导（中断会话两步处理），红线语义保留：绝不自动投递，续跑只发「继续」
  soul: 中断不可怕，可怕的是找不到回去的路。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-recovery/ 后 reload（需宿主 ≥ recoveryDialog 插槽版本，defork B3）
  license: MIT
  tags: [recovery, queue, restart, wizard, defork]
---

# aiti-recovery

> ❝ **中断不可怕，可怕的是找不到回去的路。** ❞

恢复 UI 扩展（pi-web 去 fork 化 B3 外迁产物）：把 crash 后残留的排队消息与中断会话的处理 UI 从 core 迁出，机制（running-journal 扫描 / sidecar 持久化 / recovery RPC 原语）留在 core。

## 能力

- **recoveryDialog 注入式插槽**：会话有未决议的排队残留时渲染对话框（items/onResolve/onExport/onImport/onDismiss/mode 活 props 由宿主下发，queuePanel 同款）；逐条勾选 → 丢弃 / 重新排队 / 重新排队并继续；支持导出 JSON/MD、导入回灌
- **重启恢复向导**：mount 时查 `/api/agent/recovery/interrupted`，有中断会话才显示；两步流（选会话 → 处理该会话排队），「忽略会话/全部忽略」持久化 dismissed
- **红线语义**：绝不自动投递任何内容——续跑 prompt 只在用户点击「取回并继续」时发出，且只发「继续」不重放原 prompt（原 prompt 可能是危险命令）
- **feature 开关**：`recovery.enabled` 关停即不弹（sole-owner，数据在 sidecar 不丢；可用急救路径处理）
- **小屏**：`data-ext-float` 契约（aiti-float 承接系统返回关闭/拖拽）

## 依赖

宿主 pi-web 需含 `recoveryDialog` ExtSlot（defork B3 分支）；数据面 API（`/api/agent/recovery/*`、`/api/sessions/[id]/queue-recovery`）为 core 既有。

## 来源

自 pi-web fork `components/QueueRecoveryDialog.tsx`（559 行）+ `RestartRecoveryWizard.tsx`（504 行）外迁（`pi-web-defork-batch-2026-09-plan.md` §4）。
