---
title: 消息智能（aiti-msg-smart）
icon: 💬
ext:
  id: aiti-msg-smart
  name: 消息智能
  description: 消息点击识别 —— 段落/标题/代码行点击 → 引用/复制/选项弹层 + 子句/行高亮
  soul: AI 说得再好，抄起来也挺费劲。
  type: aiti-ext
  category: 聊天增强
  version: "0.1.7"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-msg-smart/ 后 reload
  license: MIT
  tags: [message, click, quote, smart]
---

# aiti-msg-smart

> ❝ **AI 说得再好，抄起来也挺费劲。** ❞

pi-web 的 **消息点击智能**：聊天里任何一段文本，点击即可引用/复制/操作——识别能力与弹层 UI 全部在本扩展，core 只提供薄扩展点（广播段落点击 + 宿主能力透传）。

## 能做什么

- **段落/标题/列表/表格行点击**：弹卡片 → 复制 / 引用（全文或单句）/ 选项按钮（是/否、A/B 预填）
- **代码块行点击**：点某行 → 复制该行 / 引用该行 + **点击行高亮**（accent 圈选，滚动跟随）
- **hover 引用单句按钮** → 原文里**子句高亮**圈出对应文本（类似 inject 圈选）
- **内联 code 点击**：行内代码一键复制 + 小动作层（默认「复制」，外部 provider 可追加动作）
- **识别器**（features 可启停，extman 管理）：
  - `recognizer.question`：封闭问句 → 是/否、A/B 选项按钮（引用预填）
  - `recognizer.file`：文件/目录路径 → 📂打开 + 📁定位（存在性校验，404 静默）
  - `recognizer.url`：http/https 链接 → 🔗 新窗口打开
  - `recognizer.summary`：任意段落 → 复制全文 / 引用全文
  - `recognizer.selection`：划选文字 → 弹层复制 / 引用回复（当前会话）/ 新会话引用
  - `recognizer.fileExternalRoots`：主 cwd 未命中时经 aiti-git-trace 的会话识别仓/关注路径跨仓分辨文件（可选依赖）
- **user 消息**：气泡内固定 💬 引用（操作区，不检测段落点击）

## 架构（与 core 的边界）

```
页面 (markdown 段落/pre)                 aiti-msg-smart (client bundle)
  └─ core 薄扩展点                        └─ 全部业务
     registerParagraphClick (广播)         识别器：question/file/url/summary
     handler.tags 声明可点标签              弹层卡片：复制/引用/选项/文件/url
     (p/li/tr/h1-h6 + pre 行)              浮层定位：tr/pre fixed 跟随滚动
     host-api: openFile/revealDir/appendText 子句高亮 / 点击行高亮
     tip 视觉契约（hint 文案由扩展提供）     内联 code 点击复制（事件委托）
```

core 不持有任何识别/决策/UI 文案（i18n hint 也移出）；新增可点场景（如标题）= 扩展声明 `tags` 即生效。

动作 provider 扩展点：其他扩展可注册 `msg-popover-action` / `inline-code-action` 主题，向弹层追加动作（如 aiti-cmd 命令）。

## AI 自管理能力

> AI 能为你：**理解弹层行为与识别边界、排查点击不生效（先查扩展 enabled + core 同步）。**

```yaml
ai:
  manage: true
  skills:
    - 排查「点段落没反应」：扩展 loaded/enabled（/api/extensions/status）+ core 是否含 registerParagraphClick（生产构建落后则不可用）
    - 新增可点语义块：core CLICKABLE_TAGS 候选内 + 扩展 ph.tags 声明（不写死 core 业务）
    - 弹层定位：tr/pre 走 portal fixed（扩展自管 anchorRect + scroll 跟随）；p/li/h 走 in-flow sibling
  storage_dir: 无（无服务端存储；仅一个 resolve-roots 只读 API，进程内消费 aiti-git-trace 出口供跨仓分辨；optionalDependsOn aiti-git-trace）
  page: 聊天消息段落/代码块直接点击
```

## 识别边界（决策收窄）

- **code 识别器已移除**（与「复制全文」冗余，tr 单元格 `|` 拼接误触发）；path 并入 file
- **表格单元格（td/th）不做**——tr 整行点击已覆盖
- 图片/blockquote 未做（嵌套冲突待定）
