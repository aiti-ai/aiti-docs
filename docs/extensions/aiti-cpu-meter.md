---
title: aiti-cpu-meter
icon: 📊
ext:
  id: aiti-cpu-meter
  name: 流畅度检测器
  description: 主线程流畅度检测——读秒 + 0-100 分 + 颜色分层 + 最小化 + AI 卡顿调试（aiti-helper 帮助点）；可注入任意站点（内部版/外部版双产物）
  soul: 卡不卡，让数字说话；元凶是谁，让 AI 说话。
  type: dev-repo
  category: 系统工具
  version: 0.3.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  license: MIT
  tags: [performance, monitoring, devtools]
---

# aiti-cpu-meter

主线程流畅度检测器：实时读秒 + 0-100 流畅度分 + 颜色分层显示，FAB 可最小化。

- **双产物**：内部版（pi-web 页面）+ 外部版（经 service-tunnels 注入任意站点）——排查 launcher 注入页卡顿时把同一把尺子带过去。
- **事件驱动**：rAF 采样，无定时轮询。
- **问 AI（v0.3）**：面板 ✨ 按钮 → 现场报告（`report()`：评分/长任务/**LoAF 脚本归因**/卡顿快照/页面源码路径与主要区域）交 aiti-helper 建「调试页面卡顿」会话（帮助点 `jank-debug`：指标判读 + 本仓历史卡顿案例库 12 类 + 修复工具箱）。内部版走 aiti-helper（本扩展分组+预选）；外部版 prompt 弹窗 → POST ask-ai 两段式建会话 → 跳转 pi-web。

## 用途

aiti-float 0.4.4 冻结事故（微任务风暴烧主线程）的排障即由它实证定位——检测器分数骤降 + 页面 CDP 超时 = 疑似主线程饿死。相关教训见 `dev-repo/docs/aiti-web-ext-float-dialogs.md` 机制节。
