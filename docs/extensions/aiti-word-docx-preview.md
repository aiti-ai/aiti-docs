---
title: Word 预览（aiti-word-docx-preview）
icon: 📄
ext:
  id: aiti-word-docx-preview
  name: Word 文档预览
  description: .docx 高保真只读预览（docx-preview：分页 / 页眉页脚 / 表格 / 图片 / 列表还原）
  soul: 只读档零依赖——Apache 链路看 Word，编辑交给 SuperDoc / OnlyOffice。
  type: dev-repo
  category: 开发工具
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-word-docx-preview/ 后 reload
    # 依赖：aiti-editor（多编辑器仲裁宿主）
  license: Apache-2.0（本扩展；源码侧 package.json 与 LICENSE 文件不一致——LICENSE 为 MIT，待统一）/ docx-preview Apache-2.0 + JSZip MIT/GPLv3 双许可
  tags: [word, docx, preview, docx-preview, file-viewer]
---

# aiti-word-docx-preview

> ❝ 只读档零依赖——Apache 链路看 Word，编辑交给 SuperDoc / OnlyOffice。 ❞

多编辑器机制（aiti-editor M0）的 Word 纯预览实现扩展，命名规范 `aiti-<filetype>-<impl>`。

## 能力

- **.docx 高保真分页渲染**：比核心 mammoth 纯 HTML 转换显著还原（页面 / 页眉页脚 / 脚注尾注）
- 表格 / 图片 / 超链接 / 列表样式还原；零安装纯 JS 解析（文件不落第三方服务）
- 文件变化实时跟随（watch）；「关于编辑器」菜单查看能力 / 限制 / 依赖 / 许可

## 设计要点

- **纯 client 扩展**：无编辑（不注册 ContentProvider.write）、无 save-blob、服务端零数据面依赖
- vendor UMD 懒加载（docx-preview 75K + jszip 97K），打开 .docx 才拉取
- 只装本扩展时点「编辑」→ 能力联动提示/路由（aiti-word-superdoc / aiti-onlyoffice 承接编辑）
- 停用本扩展 → docx 预览回核心 mammoth（零回归）
- 许可注记：package.json 声明 Apache-2.0，但目录 LICENSE 文件为 MIT——源码侧不一致，待统一
