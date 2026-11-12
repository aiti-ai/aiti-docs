---
title: 追加系统提示词管理（aiti-append-system）
icon: 📝
ext:
  id: aiti-append-system
  name: 追加系统提示词
  description: 管理 pi 的 APPEND_SYSTEM.md（会话启动时追加进 system prompt）——全局 ~/.pi/agent/ 与项目 <cwd>/.pi/ 两份，网页面板在线编辑保存，🤖 AI 帮你起草并直接写入
  soul: 一句提醒，次次生效。
  type: aiti-ext
  category: 效率工具
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-append-system/ 后 reload
  license: MIT
  tags: [system-prompt, append-system, prompt, rules, pi]
---

# aiti-append-system

> ❝ **一句提醒，次次生效。** ❞

追加系统提示词管理扩展：pi 每次会话启动都会把 `APPEND_SYSTEM.md` 的内容追加进 system prompt（全局 `~/.pi/agent/APPEND_SYSTEM.md` + 项目 `<cwd>/.pi/APPEND_SYSTEM.md`）。本扩展给这两份文件一个**在线编辑面板** + **AI 起草直写**帮助点，不用再开终端手改。

- **📝 网页面板**：全局 / 项目两个 tab，在线编辑 + 保存；显示文件路径、设置状态、修改时间、字数与未保存标记
- **保存语义**：`保存`=覆盖写入 · `追加保存`=追加到现有内容后 · `清空`=删除文件（回到「未设置」态）；保存后**新会话生效**
- **🤖 ai-helper 帮助点**（`write-append`）：任意弹窗点 🤖 唤起——AI 先读现状（避免重复/冲突），按「命令式、一句话一条、简短」原则起草，可直接写入全局或项目级
- **安全**：项目级读写校验 cwd 必须是当前 pi-web 已知会话的工作目录（防任意路径写文件）
- **入口**：面板常驻 pages 插槽，从**扩展管理器「打开」**进入；顶部工具条「📝 提示词」按钮默认隐藏（feature `behavior.showToolbar`，需要时在扩展管理器打开）

## 使用

1. 扩展管理器 → 追加系统提示词 → 打开（或打开工具条按钮后点 📝 提示词）
2. 选「🌐 全局」或「📁 项目」tab（项目 tab 需当前页面有活动会话）
3. 编辑内容 → 💾 保存；🤖 唤起 AI 帮你起草

## 生效链路

pi 的 resource-loader 在**会话启动时**读取两份文件追加进 system prompt——保存后对**新会话**生效，当前进行中的会话不受影响。
