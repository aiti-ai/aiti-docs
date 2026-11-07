---
title: 文件夹浏览器（aiti-folder）
icon: 📂
ext:
  id: aiti-folder
  name: 文件夹浏览器
  description: fileViewer folder 接管 + pathPicker 目录选择器 —— 浏览/回收站删除 + git 工具条与分组提交计划（软依赖 aiti-git-ops）
  soul: 目录树不是导航的终点，是操作的起点。
  type: dev-repo
  category: 开发工具
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-folder/ 后 reload
  license: MIT
  tags: [folder, file-viewer, path-picker, trash, git]
---

# aiti-folder

> ❝ **目录树不是导航的终点，是操作的起点。** ❞

pi-web 文件夹浏览器扩展：

- **fileViewer folder slot 接管**：目录类型由扩展组件渲染浏览
- **pathPicker**：通用目录选择器（其他扩展选路径复用）
- **回收站删除**：删除走 `trash` 库进系统回收站，可恢复不惊魂
- **git 工具条（GitBar）**：软依赖 aiti-git-ops（引擎缺席整条隐藏）——⎇ 分支 chip（共享 BranchPanel）· ↑↓ ahead/behind 同步（SyncBar 确认流）· ✎ 手动提交（勾选→stage→commit）· 行级 stage/unstage/discard；订阅 `aiti-git-ops:changed:*` topic 零轮询刷新
- **分组提交计划（git-plan）**：启发式分组（目录聚类/类型规则/状态修饰）+ 本地偏好学习 + AI 精修与 AI 提交信息（中继 aiti-git-review.aiReview）；计划存 state 层，执行直调引擎 `/git/plan/execute`（断点/回滚）
- **文件操作**：新建文件/文件夹（已存在 409）、嵌套上传（单文件 25MB/总 100MB）、重命名/移动（EXDEV 跨设备=复制+源入回收站）/复制、目录 tar.gz 流式下载（5 分钟票据防路径泄露）、目录开终端、entry-info、doc-search（代理 aiti-doc-center FTS5 带 `<mark>` 高亮）；写路径统一 realpath 校验防 symlink 逃逸
