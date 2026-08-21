---
title: aiti-msg-anchor
icon: 📍
ext:
  id: aiti-msg-anchor
  name: 消息锚点横幅
  description: 消息区顶部常驻横幅 —— 展示「生成当前屏幕上内容的那条用户输入」，滚动跟随回合段；可切换为第一条输入 / 最近输入 / 会话标题
  soul: 谁的内容在眼前，就显示谁的输入。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-msg-anchor/ 后 reload
  license: MIT
  tags: [message, anchor, banner, scroll, input]
---

# aiti-msg-anchor

> ❝ **谁的内容在眼前，就显示谁的输入。** ❞

消息窗顶部常驻一条**锚点横幅**：每个用户输入与其后的 AI 回复构成一个「回合段」，滚动时横幅跟随当前视口中心所在的回合段——**当前屏幕上看到的是哪个输入生成的内容，横幅就显示哪个输入**（含 序号/总数，点击横幅平滑跳转到该输入）。

- **纯前端扩展**：与 aiti-msg-nav 同源的两条 DOM 契约工作（`[data-chat-scroll]` / `[data-chat-msg-role]`），零服务端 API；滚动帧零布局读取（位置缓存 + 二分），懒加载/流式变化经 MutationObserver 节流重建。
- **会话标题模式**：`display.mode = title` 时显示会话标题（name → cwd 目录名兜底），经 chatOverlay 插槽的 `currentSession` 透传。

## 功能管理（extman）

| feature | 类型 | 默认 | 说明 |
|---|---|---|---|
| `show.banner` | boolean | on | 总开关 |
| `display.mode` | string | `current` | `current`=当前视口所属用户输入（滚动跟随）；`first`=会话第一条输入；`latest`=最近一条输入；`title`=会话标题 |
| `text.maxLen` | string | `140` | 横幅文本截断长度（字符） |
