---
title: demo-lazy
icon: 🐌
description: 输入字数统计（懒加载演示）—— 启动不加载，首次用到才拉取
ext:
  id: demo-lazy
  name: demo-lazy
  description: 输入字数统计（懒加载演示扩展）
  soul: 懒加载的最好演示，是用户根本感觉不到它存在。
  type: dev-repo
  category: 系统工具
  version: 0.2.0
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: ""
  install: |
    # 部署到 ~/.pi/web/extensions/demo-lazy/ 后 reload
  license: MIT
  tags:
    - lazy
    - demo
    - counter
---

# demo-lazy

输入字数统计扩展——同时是扩展框架**懒加载**语义的演示：

- **有用的小功能**：输入非空时在输入框上方显示一行紧凑的 `N 字 · ≈M tokens`（CJK ≈1 token/字，其余 ≈4 字符/token）；空输入不渲染任何东西
- **懒加载 v2 两段式样板**（2026-09-08）：`clientImmediately: false`——启动阶段零请求；顶栏「Lazy」静态按钮（manifest `ui.toolbar[]` 声明，宿主渲染、icon 同源）点击时才拉取 bundle 并经 `meta.onClick` 开面板。chatInputTop 字数统计行在物化后照常工作（保留作「常挂插槽标懒无效」的教学反例，见源码注释）
- **依赖边**：`clientDependsOn: ["demo"]` 演示启动图 inject 边（informational，仅影响预取调度）
