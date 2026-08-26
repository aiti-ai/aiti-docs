---
title: 文件夹浏览器（aiti-folder）
icon: 📂
ext:
  id: aiti-folder
  name: 文件夹浏览器
  description: fileViewer folder 接管 + pathPicker 目录选择器 —— 浏览/回收站删除
  soul: 目录树不是导航的终点，是操作的起点。
  type: dev-repo
  category: 开发工具
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-folder/ 后 reload
  license: MIT
  tags: [folder, file-viewer, path-picker, trash]
---

# aiti-folder

> ❝ **目录树不是导航的终点，是操作的起点。** ❞

pi-web 文件夹浏览器扩展：

- **fileViewer folder slot 接管**：目录类型由扩展组件渲染浏览
- **pathPicker**：通用目录选择器（其他扩展选路径复用）
- **回收站删除**：删除走 `trash` 库进系统回收站，可恢复不惊魂
