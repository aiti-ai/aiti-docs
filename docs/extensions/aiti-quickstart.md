---
title: aiti-quickstart
icon: 🚀
ext:
  id: aiti-quickstart
  name: 快速上手
  description: 空白态引导扩展——新建会话欢迎页 widget（上手步骤 / 快捷操作 / 示例提示词，走宿主 newSessionWidgets 插槽可 ⚙ 自定义）+ 左栏 DockStack 全折叠空白引导卡（与应用中心同屏共存，✕ 可关闭）+ 侧栏底部「快速上手」按钮（应用中心可钉进常用区，点击重返 quickstart 欢迎页）
  soul: 空白不可怕，第一句从这里开始。
  type: dev-repo
  category: 会话与项目
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-quickstart/tools/deploy.mjs   # 双实例部署 + reload；
    # 消费方 session-manager（optionalDependsOn 软依赖）经 aiti-quickstart.api 服务渲染进 DockStack filler（上半，应用中心在下）
  license: MIT
  tags: [quickstart, onboarding, guide, welcome, new-session-widgets, filler, get-started]
---

# aiti-quickstart · 快速上手

> ❝ **空白不可怕，第一句从这里开始。** ❞

pi-web 的「完全空白态」引导：新建会话欢迎页与左栏全折叠空白都有上手内容，且常用区随时可重返 quickstart 页。纯 client 扩展，**宿主零改动**，缺席/禁用时各面自然回退现状。

## 能力

- **新建会话欢迎页 widget ×3**（宿主 `newSessionWidgets` 插槽，桌面 8 列 / 手机 4 列网格，⚙ 自定义面板统一管隐藏/移动/排序，偏好存 `pi-new-session-widgets`）：
  - **快速上手**（top，8×2）：4 步骤卡——① 选项目目录（左栏项目行 / Workspace 下拉）② 输入第一条消息回车开始 ③ `@` 引用文件、`/` 调出命令菜单 ④ 底部选择器切换模型
  - **快捷操作**（top，4×1）：`Ctrl+Alt+N` 新建会话 · `@` 引用文件 · `/` 命令菜单 · Enter 发送 / Shift+Enter 换行
  - **试试这样问**（bottom，8×1）：示例提示词 chip，点击经 `pi-web.composer` 服务写入输入框并聚焦
- **左栏全折叠空白引导卡**（经 client 服务 `aiti-quickstart.api` 交付 session-manager 编排器，DockStack filler）：标题 + 3 步精简引导 + 「打开快速上手页」按钮 + 右上 ✕ 关闭（持久化 `pi:quickstart:sidebar-dismissed`，关闭后回退纯应用中心）。布局 = 引导卡在上（flexShrink 0）、应用中心在下（flex:1 内滚），任一区块展开照旧自动让位
- **侧栏底部「快速上手」按钮**（sidebarFooter 条目）：与内置 模型/技能/设置 同排同款；应用中心自动收编为可钉住卡片 → **☆ 钉进常用区，点击重返 quickstart 欢迎页**（`?cwd=` → home 兜底 → toast 提示，导航走 `pi-web.newSession.setCwd`）

## 机制

- 懒扩展（`clientImmediately: false`）：manifest 静态条目（欢迎页 widget ×3 + sidebarFooter ×1）由宿主渲染标准形，物化后同 id 注册条目接管（title 转 t() 多语）；session-manager 编排器挂载时 `ensureMaterialized` 确定性拉起 filler 交付面
- 纯逻辑层 `quickstart-logic.ts`（widget 元数据常量 / 关闭态存取 / cwd 解析链）+ 单测 `quickstart-logic.test.mjs`（10 用例：cwd 解析链 / 关闭态 roundtrip / 布局常量 / manifest↔client 防漂移 / i18n key 全覆盖）

## 降级

| 场景 | 表现 |
|---|---|
| 禁用/缺席 aiti-quickstart | filler 回退纯应用中心（widget 区仅 builtin:recent），footer 按钮消失，零报错 |
| 用户 ✕ 关闭引导卡 | filler 上半为空（返回 null），应用中心照常 |
| aiti-app-center 缺席 | filler 仅引导卡 |
| aiti-float 缺席 | session-manager fallback 直排分支无 filler（widget/footer 按钮不受影响） |
