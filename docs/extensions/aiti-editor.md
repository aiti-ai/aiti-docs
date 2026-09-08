---
title: 文件编辑器（aiti-editor）
icon: ✍️
ext:
  id: aiti-editor
  name: 文件编辑器
  description: 可扩展编辑器 —— Monaco 编辑接管 + 保存（mtime 冲突 409 + 白名单/大小校验）+ 压缩包解析
  soul: 看到不对的代码，当场就能改——不用切出去开 IDE。
  type: dev-repo
  category: 开发工具
  version: 1.0.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-editor/ 后 reload
  license: MIT
  tags: [editor, monaco, save, file-viewer, archive]
---

# aiti-editor

> ❝ **看到不对的代码，当场就能改——不用切出去开 IDE。** ❞

pi-web 文件编辑器扩展（可扩展编辑器架构，设计见 `docs/pi-web-file-editor-design.md`）：

- **fileViewer slot 接管**：文本类文件由扩展组件渲染（Monaco 编辑），非文本交核心旧查看器
- **保存**：`POST /save` fs 写入 + baseMtime 冲突检测（409）+ 白名单/大小校验；读/watch 复用核心 API 零改动
- **压缩包解析**：7-Zip 解析链——系统已装直接用，未装经 justget 多源竞速下载 portable 7za 缓存本地
- **后续路线**（M2+）：注册表开放（`window.__aitiEditor`，内部便道——DI 方案 P3 灰名单 internal 类）、语言服务桥、ContentProvider 自定义、Markdown 增强

依赖 js-yaml / sql-formatter / tar-stream / yauzl。
