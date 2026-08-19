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
- **懒加载**：`clientImmediately: false`——启动阶段不预取不注册 client bundle，首次渲染到 chatInputTop 插槽时才拉取并 materialize
- **依赖边**：`clientDependsOn: ["demo"]` 演示启动图 inject 边（informational，仅影响预取调度）
