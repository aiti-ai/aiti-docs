---
title: Word 编辑（aiti-word-superdoc）
icon: ✍️
ext:
  id: aiti-word-superdoc
  name: Word 文档编辑器
  description: .docx 在线编辑（SuperDoc：ProseMirror docx 双向）。AGPL 隔离于本扩展，不装即无
  soul: ProseMirror 双向——打开即 docx 结构，导出即 docx 文件。
  type: aiti-ext
  category: 开发工具
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-word-superdoc/ 后 reload
    # 依赖：aiti-editor（多编辑器仲裁宿主）
    # 注意：SuperDoc 为 AGPL-3.0——不安装本扩展即 pi-web 全局零 AGPL 前端组件
  license: AGPL-3.0（SuperDoc，隔离于本扩展）+ 本扩展包装层 Apache-2.0（整包随 npm 按 AGPL-3.0 声明发布；源码侧 LICENSE 文件与 package.json 不一致——MIT vs AGPL-3.0，待统一）
  tags: [word, docx, editor, superdoc, prosemirror]
---

# aiti-word-superdoc

> ❝ ProseMirror 双向——打开即 docx 结构，导出即 docx 文件。 ❞

多编辑器机制（aiti-editor M0）的 Word 编辑实现扩展（M1b）。

## 能力

- **.docx 所见即所得编辑**（标题 / 粗斜体 / 列表 / 表格 / 图片 / 链接）+ 编辑态内建工具栏
- Ctrl+S 保存回原文件（409 冲突确认覆盖）；另存为 .docx 副本
- 预览态 = 只读编辑器（与编辑态同一渲染引擎，无二次转换）
- 文件变化实时跟随（watch）

## 功能开关

- `word.edit`：关闭后 .docx 仅预览（编辑能力整体关闭）

## AGPL 策略红利

SuperDoc 的 AGPL-3.0 义务**隔离在此单扩展**——不安装它即 pi-web 全局零 AGPL 前端组件：
docx 预览走 `aiti-word-docx-preview`（Apache），深度编辑走 `aiti-onlyoffice`（可选 Docker 档）。

> 许可注记：整包随 npm 按 AGPL-3.0 声明发布、SuperDoc 依赖隔离于本扩展目录；目录 LICENSE 文件（MIT）与 package.json（AGPL-3.0）不一致，待统一。

## 技术要点

- SuperDoc 经 npm 依赖进 vite 单 vendor chunk（dist 把 vue/yjs external，浏览器直连 import 无法解析；
  Univer 同款结论：node_modules 全家收进单一 chunk），打开 .docx 且切到本 provider 才拉取（gzip ~3.5MB）
- worker entry（browser/review-index/collaboration）随 chunk 落 `client/assets/`，部署脚本递归拷贝
- 保存链：`sd.export({ exportType: ["docx"] })` → host.save(ArrayBuffer) → save-blob 原子写
