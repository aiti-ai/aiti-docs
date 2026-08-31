---
title: 方案先行（aiti-plan-first）
icon: 📋
ext:
  id: aiti-plan-first
  name: 方案先行
  description: AI 开发先方案后动手 —— 结合 aiti-git-trace 事件感知（推-听架构零扫描）：md 变更弹绑定向导（可浏览全部 md）、大改动方案未跟弹提醒、一键插入「更新方案文档：@file」；每轮至多一弹、10s 自动收起、可静音至用户点工具条按钮
  soul: 不强制不打断，只在 md 变了和大改跑偏时轻轻提一句：先有方案，再动手。
  type: dev-repo
  category: 开发工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 依赖：aiti-git-trace ≥0.2.0（services.trace v2 事件出口；缺席自动休眠，手动绑定仍可用）
    # 部署：node dev-repo/aiti-plan-first/tools/deploy.mjs 后 POST /api/extensions/reload
  license: MIT
  tags: [plan-first, git-trace, reminder, sse, workflow]
---

# aiti-plan-first · 方案先行

> ❝ AI 开发，先方案后动手 ❞

## 是什么

工具条「📋 方案先行」按钮 + 一个很短的非模态下拉。**推-听架构**（零轮询、常态零扫描）：

1. **绑定向导**：未绑定方案时，本轮变更出现 md 文件 → 自动弹下拉问「这是本 session 的方案吗？」（可浏览全部 md 选择；同一文件不重复问，拒后 30min 冷却）
2. **失联提醒**：已绑定方案后，单轮改动量超阈值（文件数≥8 / op 数≥12 可配）且方案未更新 → 弹下拉，一键往输入框插入「更新方案文档：@file」
3. **手动入口**：点工具条按钮 = 主动查看（自动解除静音）；每轮至多弹一次、10s 自动收起、可点「不再提醒」持久静音

## 事件链（推-听，对 git-trace 零侵入）

```
pi 扩展 appendRow 台账行 → globalThis.__aitiTraceEmit?（松耦合可选链）
  → aiti-git-trace sink → traceBus
     ├─ services.trace.onOp   ← 本扩展进程内监听（主通道）
     ├─ GET /events（SSE）    ← 浏览器
     └─ readOps               ← 跳号补洞 + 降级，非常态
```

设计全文：`dev-repo/docs/aiti-plan-first-plan.md`（含冷启动种子、跳号补洞、三档降级、buffer 容量等边界）。

## 门控

| feature | 缺省 | 说明 |
|---|---|---|
| plan.toolbar | 开 | 工具条按钮 |
| plan.suggestMd | 开 | md 变更绑定向导 |
| plan.staleRemind | 开 | 大改未跟提醒 |
| plan.bigFiles / plan.bigOps | 8 / 12 | 「改动很多」阈值 |
| plan.mdIgnores | 空 | 追加 md 忽略（glob） |
