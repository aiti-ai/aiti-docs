---
title: 消息分享（aiti-msg-share）
icon: 📤
ext:
  id: aiti-msg-share
  name: 消息分享
  nameEn: "Message Share"
  description: 把会话、单条消息、划选内容、文件与图片分享出去——工作台跑在自己机器上、外网访问不到，所以经可配置的分享目标（Gitee / 图床 / 对象存储 / 笔记库，内置 161 个）上传换回公网 URL，上传前自动脱敏，结果附二维码
  descriptionEn: "Share sessions, messages, selections, files and images through pluggable targets with secret redaction and QR codes"
  soul: 分享出去，是为了让对话继续。
  type: aiti-ext
  category: 聊天增强
  version: 0.1.10
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 随 aiti-agent（@aiti-ai/pi-web）打包，在应用内扩展管理器启用
  license: MIT
  tags: [share, session, message, qrcode, redaction, sxcu, gitee, oss, joplin]
---

# aiti-msg-share

> ❝ **分享出去，是为了让对话继续。** ❞

工作台跑在你自己的机器上，会话 URL 外部访问不到。这个扩展把你选中的内容通过**可配置的分享目标**上传，换回一个公网 URL——外加二维码、复制链接，以及支持的平台上的系统分享面板。

只有你主动点分享才会发生，而且**预览始终可编辑**——分享前能看到最终要发出去的是什么。

## 从哪里分享

| 入口 | 分享内容 |
| --- | --- |
| 消息 hover 操作区 | 该条消息 |
| 消息智能（aiti-msg-smart）划选弹层 | 选中文本 |
| 消息智能文件卡片 | 被引用的文件 |
| 会话行 `⋯` 更多菜单 | 整个会话（markdown 导出） |
| 文件编辑器工具条 | 当前文件，或当前选区 |
| 图片预览窗 | 该图片 |
| 命令面板 | 分享中心 |

每个入口都是**宿主插槽或扩展 topic**：本扩展注册 provider，其他扩展负责渲染，没有硬编码按钮。

## 分享目标

161 个内置目标来自 [`@aiti-ai/content-share`](https://www.npmjs.com/package/@aiti-ai/content-share)：

- **发布类**（公网 URL）：Gitee Snippet、兰空图床、SM.MS、Pastebin、Rentry、paste.rs、阿里云 OSS，外加 ShareX `.sxcu` 全量目录（catbox、imgbb、gofile、0x0.st…）
- **存档类**（存进自己的笔记库）：Joplin、Obsidian Local REST、memos、思源、flomo
- **本机类**（不上传）：指向自己工作台会话的链接
- **自定义**：任意 HTTP 端点（`.sxcu` 配置或模板 provider）

弹窗默认只展示**推荐集**（远端可在线维护推荐名单与死站标注）；「加更多…」打开完整目录——可搜索、带配置状态徽章（🟢 匿名 / 🟠 需配置 / ✓ 已配置 / 💀 已关停），并支持一键导入 ShareX `.sxcu`。

## 脱敏

上传前文本会过一遍 [`@aiti-ai/secret-mask-core`](https://www.npmjs.com/package/@aiti-ai/secret-mask-core)——与 `pi-secret-mask` 同源的确定性凭据检测引擎。命中的内容替换为 `[REDACTED:规则#hash]` 占位符并在预览中展示；勾选/取消立即重绘文本框，取消时恢复原文。二进制内容（图片/文件）不做扫描，界面会明确标注。

## 页面信息附加

预览区头部的多选框可把上下文附加到分享内容前：**系统**、**浏览器**、**网址**、**会话 ID**、**会话名**。

## AI 技能

通过 `aiti-helper` 的标准 `skills/` 机制声明三个技能：

- `configure-target` —— 引导获取并填入某平台的 token/密钥，然后测活
- `troubleshoot` —— 读分享历史、归类失败原因（网络/认证/超限/死站）、建议修复或换目标
- `import-sxcu` —— 校验 ShareX 配置兼容性并注册为目标

## 数据与隐私

- 目标凭据存于 `<configDir>/targets.json`（权限 `0600`），接口回显一律掩码。
- 上传走扩展自身 server 路由——浏览器不持有 token，也无 CORS 变通。
- 分享历史存于 `<stateDir>/shares.json`（保留最近 200 条）。
- 文件分享遵循宿主的允许目录策略（`ctx.core.fileAccess`）；图片源限制同源/本机，避免 SSRF。
