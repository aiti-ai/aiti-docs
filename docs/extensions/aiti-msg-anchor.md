---
title: 消息锚点横幅（aiti-msg-anchor）
icon: 📍
ext:
  id: aiti-msg-anchor
  name: 消息锚点横幅
  description: 消息区顶部常驻横幅 —— 展示「生成当前屏幕上内容的那条用户输入」，滚动跟随回合段；可切换为第一条输入 / 最近输入 / 会话标题
  soul: 回错了人的话，比叫错名字还尴尬。
  type: aiti-ext
  category: 聊天增强
  version: "0.1.7"
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

> ❝ **回错了人的话，比叫错名字还尴尬。** ❞

消息窗顶部常驻一条**锚点横幅**：每个用户输入与其后的 AI 回复构成一个「回合段」，滚动时横幅跟随当前视口**顶部边界**所在的回合段——**当前屏幕顶部看到的是哪个输入生成的内容，横幅就显示哪个输入**（含 序号/总数，点击横幅平滑跳转到该输入）。

- **参考用途**：顶部有大段输出、看不到它属于哪条输入时，横幅显示对应输入作参考（右对齐到消息列尾，暂时代替看不见的用户输入）；**锚点输入已显示在屏幕内时横幅自动隐藏**（输入都看见了，还显示啥）。
- **滚动时显示，停止滚动 6s 后淡出**（初始可见 6s，之后靠滚动唤醒）。
- **纯前端扩展**：与 aiti-msg-nav 同源的两条 DOM 契约工作（`[data-chat-scroll]` / `[data-chat-msg-role]`），零服务端 API；滚动帧零布局读取（位置缓存 + 二分），懒加载/流式变化经 MutationObserver 节流重建。
- **会话标题模式**：`display.mode = title` 时显示会话标题（name，无则取会话第一条输入——与左侧会话列表标题同源），经 chatOverlay 插槽的 `currentSession` 透传。
- **已知限制**：序号/总数基于当前 DOM 里渲染出的用户消息（虚拟列表只渲染视口窗口）——大会话里 total 是「已渲染」而非全量；点击跳转也只在已渲染范围内有效。纯前端契约下的取舍。

## 功能管理（extman）

| feature | 类型 | 默认 | 说明 |
|---|---|---|---|
| `show.banner` | boolean | on | 总开关 |
| `display.mode` | string | `current` | `current`=当前视口所属用户输入（滚动跟随）；`first`=会话第一条输入；`latest`=最近一条输入；`title`=会话标题 |
| `text.maxLen` | string | `140` | 横幅文本截断长度（字符） |
| `display.title` | boolean | on | 横幅第一行显示会话标题行 |
| `display.input` | boolean | on | 第二行显示锚点输入行 |
| `display.opacity` | string | `85` | 横幅不透明度（0-100） |
