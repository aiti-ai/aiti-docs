---
title: aiti-quickstart
icon: 🚀
ext:
  id: aiti-quickstart
  name: 快速上手
  description: 空白态引导扩展——新建会话欢迎页 widget（上手步骤 / 快捷操作 / 示例提示词，走宿主 newSessionWidgets 插槽可 ⚙ 自定义）+ 左栏 DockStack 全折叠空白引导卡（与应用中心同屏共存，✕ 可关闭）+ v2 工作区获取 Hub（Git 克隆 / 上传压缩包 / 本地目录 / 新建）+ 侧栏「快速上手」静态条目（应用中心可钉住卡片，点击重返 quickstart 欢迎页）
  soul: 空白不可怕，第一句从这里开始。
  type: dev-repo
  category: 会话与项目
  version: "0.2.1"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-quickstart/tools/deploy.mjs   # 双实例部署 + reload；
    # 消费方 session-manager（optionalDependsOn 软依赖）经 aiti-quickstart.api 服务渲染进 DockStack filler（上半，应用中心在下）；
    # 另软依赖 aiti-event-bus（clone 进度帧）与 aiti-model-wizard（配置模型深链，缺席降级）
  license: MIT
  tags: [quickstart, onboarding, guide, welcome, new-session-widgets, filler, get-started]
---

# aiti-quickstart · 快速上手

> ❝ **空白不可怕，第一句从这里开始。** ❞

pi-web 的「完全空白态」引导：新建会话欢迎页与左栏全折叠空白都有上手内容，且常用区随时可重返 quickstart 页。v2 起含服务端出口（workspace/clone|history|forget|record），缺席/禁用时各面自然回退现状。

## 能力

- **新建会话欢迎页 widget ×3**（宿主 `newSessionWidgets` 插槽，桌面 8 列 / 手机 4 列网格，⚙ 自定义面板统一管隐藏/移动/排序，偏好存 `pi-new-session-widgets`；三 widget 均整行 8×1）：
  - **快速上手**（top，8×1）：4 步骤卡——① 选项目目录（左栏项目行 / Workspace 下拉）② 输入第一条消息回车开始 ③ `@` 引用文件、`/` 调出命令菜单 ④ 底部选择器切换模型；随引导状态切形（见下方「工作区获取（v2 Hub）」）
  - **快捷操作**（top，8×1）：`Ctrl+Alt+N` 新建会话 · `@` 引用文件 · `/` 命令菜单 · Enter 发送 / Shift+Enter 换行
  - **试试这样问**（bottom，8×1）：示例提示词 chip，点击经 `pi-web.composer` 服务写入输入框并聚焦
- **左栏全折叠空白引导卡**（经 client 服务 `aiti-quickstart.api` 交付 session-manager 编排器，DockStack filler）：标题 + 3 步精简引导 + 「打开快速上手页」按钮 + 右上 ✕ 关闭（持久化 `pi:quickstart:sidebar-dismissed`，关闭后回退纯应用中心）。布局 = 引导卡在上（flexShrink 0）、应用中心在下（flex:1 内滚），任一区块展开照旧自动让位
- **侧栏「快速上手」静态条目**（sidebarFooter）：仅作应用中心收编源；client 物化后同 id 条目接管（`render = null`，左下工具条不再渲染按钮）——重返入口 = **应用中心钉住卡片，点击重返 quickstart 欢迎页**（`?cwd=` → home 兜底 → toast 提示，导航走 `pi-web.newSession.setCwd`）

## 工作区获取（v2 Hub）

- **开始卡三步**：获取工作区 → 配置模型 → 发第一条消息；guide widget 随引导状态切形（fresh：大按钮流「获取工作区 / 配置模型」/ hasWorkspace：上次工作区 + 配置模型引导 / full：四步卡）
- **Hub 四入口**：Git 克隆（server API `POST workspace/clone`，git clone --progress + staging 落位 + never-overwrite `-2/-3` 递增，进度经 aiti-event-bus topic 帧）· 上传压缩包（复用 session-manager service）· 本地目录 · 新建空目录；Workspace 下拉底部「获取工作区…」日常可达
- **最近工作区**：获取记录 + `~/workspace` 顶层扫描合并（`GET workspace/history`，`POST workspace/forget` 移除记录）

## 机制

- 懒扩展（`clientImmediately: false`）：manifest 静态条目由宿主渲染标准形，物化后同 id 注册条目接管（title 转 t() 多语）——欢迎页 widget ×3 接管后照常渲染，sidebarFooter 条目接管后 `render = null`（不渲染按钮，见「能力」）；session-manager 编排器挂载时 `ensureMaterialized` 确定性拉起 filler 交付面
- 纯逻辑层 `quickstart-logic.ts`（widget 元数据常量 / 关闭态存取 / cwd 解析链 / 引导状态机）+ 单测 `quickstart-logic.test.mjs`（cwd 解析链 / 关闭态 roundtrip / 布局常量 / manifest↔client 防漂移 / i18n key 全覆盖）
- 软依赖：session-manager（filler 消费 + 上传复用）、aiti-event-bus（clone 进度帧）、aiti-model-wizard（配置模型深链，client 服务缺席降级）

## 降级

| 场景 | 表现 |
|---|---|
| 禁用/缺席 aiti-quickstart | filler 回退纯应用中心（widget 区仅 builtin:recent），sidebarFooter 无条目，零报错 |
| 用户 ✕ 关闭引导卡 | filler 上半为空（返回 null），应用中心照常 |
| aiti-app-center 缺席 | filler 仅引导卡 |
| aiti-float 缺席 | session-manager fallback 直排分支无 filler（欢迎页 widget 不受影响） |
