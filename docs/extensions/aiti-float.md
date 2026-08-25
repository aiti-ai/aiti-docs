---
title: aiti-float
icon: 🎈
ext:
  id: aiti-float
  name: 弹窗浮动增强器
  description: data-ext-float 契约接管 —— 拖拽/边缘缩放/位置持久化/点按置前/双击复位，小屏自动全屏
  soul: 面板只管标一个属性，浮起来的一切交给它。
  type: dev-repo
  category: 聊天增强
  version: 0.2.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-float/ 后 reload
  license: MIT
  tags: [float, dialog, drag, resize, mobile, contract]
---

# aiti-float

> ❝ **面板只管标一个属性，浮起来的一切交给它。** ❞

纯 client 扩展：凡根节点标 `data-ext-float="1"` 的弹窗面板，自动获得拖拽移动、边缘缩放、位置持久化、点按置前、双击复位；首个子元素作拖拽把手。再加 `data-ext-float-full="1"` 即小屏（≤640px 宽或 ≤700px 高）自动铺满视口并停用手势/持久化，跨断点动态切换。

未安装/禁用本扩展时，面板回退普通居中弹窗（自身 style 兜底）——接入方零逻辑零状态。

契约详见 `docs/aiti-web-ext-float-dialogs.md`。
