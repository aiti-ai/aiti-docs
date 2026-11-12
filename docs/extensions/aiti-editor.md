---
title: 文件编辑器（aiti-editor）
icon: ✍️
ext:
  id: aiti-editor
  name: 文件编辑器
  description: 可扩展编辑器 —— Monaco 编辑接管 + 保存（mtime 冲突 409 + 白名单/大小校验）+ 压缩包解析 + 统一图片查看器（消息图片/文件图片合一，缩放·捏合·信息面板）
  soul: 看到不对的代码，当场就能改——不用切出去开 IDE。
  type: dev-repo
  category: 开发工具
  version: "1.0.7"
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

pi-web 文件编辑器扩展（可扩展编辑器架构）：

- **fileViewer slot 接管**：文本类文件由扩展组件渲染（Monaco 编辑），非文本交核心旧查看器
- **图片预览统一承载（2026-09-17）**：消息列表/输入框/markdown 点出的图片（base64/API URL，无磁盘路径）与磁盘图片文件共用同一套全功能查看器（缩放·pinch·平移·旋转·信息面板·复制·下载）。宿主经 `__aitiEditor.openImagePreview(src,{alt})` 调起（宿主侧无图片容器/image tab；懒扩展由入口桥幂等物化）；扩展以浮窗呈现——dialogs 插槽 + aiti-float 契约（拖拽/小屏全屏），未装 aiti-float 时自身 fixed 兑底；宿主侧扩展不可用回退上游原生 lightbox。小屏工具条换行限宽不溢出、棋盘格背景跟随宿主主题。
- **保存**：`POST /save` fs 写入 + baseMtime 冲突检测（409）+ 白名单/大小校验
- **读/watch**：走自有票据端点（路径不进 URL，防 access log 泄露）——`POST /ticket`（TTL 1h 滑动续期）换票据 → `/t/<ticket>/raw|stat|file`（provider 委派 + Range 流式）；watch 为自有 fs.watch（300ms 防抖）→ event-bus topic `ed-watch` 推送，30min 空闲自动停
- **压缩包解析**：7-Zip 解析链——系统已装直接用，未装经 justget 多源竞速下载 portable 7za 缓存本地
- **已交付**（原 M2+ 路线）：注册表 `window.__aitiEditor` 已开放；文件 provider 注册（registerFileProvider + `/file` 委派）；Markdown 智能预览（editor.mdPreviewSmart）；TS 兄弟文件 extraLib（/ts-siblings）
- **文档预览**：票据化 `/preview`（CSP sandbox + opaque origin + `noscript=1` 可剥作者脚本）；soffice 转 PDF（doc-pdf，feature `soffice.path`）；转可编辑格式另存（`POST /convert-saveas`：.doc→.docx / .ppt→.pptx）；AI 自管理 skill install-soffice
- **编辑器周边**：文件重命名/移动（`/rename` `/move`）；未保存编辑缓存（cache-write/read/delete，重开不丢）；git 变更标记（git-changes/git-base）；session-files 会话文件聚合；`GET/PUT /prefs` 偏好（editor-prefs.json 入 aiti-configs 备份）

依赖 js-yaml / sql-formatter / tar-stream / yauzl / exifr / @aiti-ai/ext-shared。
