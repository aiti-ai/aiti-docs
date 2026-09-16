---
title: aiti-model-recent
icon: 🕐
ext:
  id: aiti-model-recent
  name: aiti-model-recent
  description: 模型选择器「最近使用」数据提供方——纯 service 扩展（零 UI），面板最近段同步取数 + pick 事件入库 LRU；localStorage key 与原实现一致零迁移
  soul: 常用的模型，应当在指尖。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-model-recent/ 后 reload（需宿主 ≥ service 接缝版本，defork P4）
  license: MIT
  tags: [model-selector, recent, lru, service, defork]
---

# aiti-model-recent

> ❝ **常用的模型，应当在指尖。** ❞

模型选择器「最近使用」数据提供方扩展（pi-web 去 fork 化 P4 外迁产物）：**纯数据服务、零 UI**——core ModelSelector 面板渲染最近使用段时经 client service 同步取数，UI 归宿主、数据归扩（最小接缝形态）。

## 契约

- **client service** `aiti-model-recent.recentOptions`：`getRecent({ open, filter, sortedOptions })` → 面板分组条目（仅面板打开且非搜索态；按记录时间倒序；已下架模型自动消失；去重；上限 8）
- **pick 事件**：监听 window `pi-web:model-picked`（detail `{provider, modelId}`）→ LRU 入库（置顶/去重/截断）
- **存储**：localStorage `pi-web:recent-models`——与原 core 实现一致，**零数据迁移**
- **即时物化**：`clientImmediately: true`，service 须在首次打开面板前注册

## feature 开关

`modelRecent.enabled` 关停 → service 注销 → core 面板无「最近使用」段（优雅降级，数据保留）。

## 来源

自 pi-web fork `components/ModelSelector.tsx` 的 recent 内联实现（~110 行）外迁（`pi-web-model-selector-ext-plan.md`，2026-09-16 口径重测后执行）；LRU/pick 单测 9 条随逻辑迁入本扩展。
