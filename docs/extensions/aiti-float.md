---
title: 弹窗浮动增强器（aiti-float）
icon: 🎈
ext:
  id: aiti-float
  name: 弹窗浮动增强器
  description: data-ext-float 契约接管 —— 拖拽/边缘缩放/位置持久化/点按置前/双击复位/自动最大化按钮，小屏自动全屏
  soul: 面板只管标一个属性，浮起来的一切交给它。
  type: dev-repo
  category: 聊天增强
  version: 0.4.0
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

纯 client 扩展：凡根节点标 `data-ext-float="1"` 的弹窗面板，自动获得拖拽移动、边缘缩放、位置持久化、点按置前、双击复位；首个子元素作拖拽把手。v0.4.0 起还会自动往标题栏注入标准 ⛶/❐ **最大化按钮**（点击铺满视口，小屏全屏态自动隐藏；`data-ext-float-max="0"` 豁免）——扩展零代码。再加 `data-ext-float-full="1"` 即小屏（≤640px 宽或 ≤700px 高）自动铺满视口并停用手势/持久化，跨断点动态切换。

未安装/禁用本扩展时，面板回退普通居中弹窗（自身 style 兜底）——接入方零逻辑零状态。

契约详见内部设计文档「扩展弹窗浮动契约」（data-ext-float 一属性接管拖拽/缩放/持久化）。

## 接入示例

- 可运行参考：[demo](demo.md)、[ext-jsx-client 模板](ext-jsx-client.md)
- 实际接入方：aiti-ui-env、aiti-ai-schedule 等扩展弹窗

## 版本历史

- **0.4.0**（2026-08-26）：自动注入标准最大化按钮 ⛶/❐（`data-ext-float-max` 豁免）；新增 `__piweFloat.isFull()`；extman / ai-usage / subagents 自备按钮已迁移
- 0.3.x：小屏全屏 `data-ext-float-full`、手动最大化 API（`toggleMax/setMax/isMax`）
