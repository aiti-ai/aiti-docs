---
title: aiti-msg-nav
icon: 🧭
ext:
  id: aiti-msg-nav
  name: 消息滚动导航
  description: 消息区右侧的滚动导航条 —— 到最早 / 到最新 / 上一个 / 下一个用户输入，一键直达；长按「到最新」保持屏幕常亮
  soul: 千楼万楼的聊天记录，电梯比楼梯好用。
  type: dev-repo
  category: 聊天增强
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-msg-nav/ 后 reload
  license: MIT
  tags: [message, nav, scroll, toolbar, wake-lock]
---

# aiti-msg-nav

> ❝ **千楼万楼的聊天记录，电梯比楼梯好用。** ❞

消息区右侧一条垂直**滚动导航条**，四个按钮：

- ⏫ **到最早**：滚到消息容器顶端（触发 core 懒分页 → 自动加载更早消息并保持视口）
- ▲ **上一个用户输入**：从视口顶部边界向上找上一条 `user` 消息，平滑滚动到其上缘（-24px 留白）
- ▼ **下一个用户输入**：同上，向下找下一条
- ⏬ **到最新**：滚到容器底部；**长按**可让屏幕保持常亮（Screen Wake Lock API，`agentRunning` 期间生效，不支持时自动降级）

- **纯前端扩展**：原为 pi-web 内置的 `ScrollToolbar`，整体抽离为扩展——core 只留一个 `chatOverlay` 插槽挂载点，全部交互/定位/滚动逻辑在 client bundle 里，靠两条 DOM 契约工作（`[data-chat-scroll]` 滚动容器 / `[data-chat-msg-role]` 消息节点），**零服务端 API**。
- **依赖核心懒分页**：滚到顶部触发 sentinel → core 自动加载更早消息并保持视口；到最早已加载到底时在容器顶端延时重试。
- **用户消息定位**：`getBoundingClientRect` 相对容器顶 + `scrollTop`，二分找锚点（`scrollTop + 8` 为视口顶部判定边界）。

## 功能管理（extman）

| feature | 类型 | 默认 | 说明 |
|---|---|---|---|
| `show.toolbar` | boolean | on | 总开关（关闭 = 不渲染导航条） |
| `behavior.keepAwake` | boolean | on | 长按「到最新」保持屏幕常亮（Screen Wake Lock API，不支持时自动降级） |

## 相关扩展

- **aiti-msg-anchor**（消息锚点横幅）：同一 `chatOverlay` 插槽、同一套 DOM 契约——anchor 是顶部横幅、nav 是右侧按钮列，布局互补；两者同开时注意顶部右缘的潜在重叠（均 absolute 定位到消息列右缘）。
