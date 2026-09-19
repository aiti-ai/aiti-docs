---
title: aiti-app-center
icon: 🧭
ext:
  id: aiti-app-center
  name: 应用中心
  description: 左栏区块栈全部折叠后空白态的应用抽屉（开始菜单）——收编全部扩展入口成卡片（动作/面板/开关/管理），tag 式分类（内部固定分类多语 + 自定义分类 + 默认 other）、搜索、用户钉住/隐藏/排序
  soul: 所有插件入口的家——折叠即开始菜单。
  type: dev-repo
  category: 系统与管理
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-app-center/tools/deploy.mjs   # 双实例部署 + reload；
    # 消费方 session-manager（optionalDependsOn 软依赖）经 aiti-app-center.api 服务渲染进 DockStack filler
  license: MIT
  tags: [app-center, launcher, start-menu, dock, spacer, category, apps]
---

# aiti-app-center · 应用中心

> ❝ **所有插件入口的家——折叠即开始菜单。** ❞

左栏 DockStack 全部区块折叠后的大片空白 → 呈现应用中心：搜索框 + 常用（钉住）卡片网格 +「更多」分类浏览。任一区块展开即自动让位（filler 语义，零显隐状态）。

## 能力

- **四类入口自动收编**（来自现有注册表，新插件装上即进列表）：
  - `action`：toolbar 插槽声明式条目（`meta.onClick` 可调；懒扩展静态条目自带物化转发）
  - `panel`：rightFileDock 停靠面板（`present` 状态机打开：已停靠原位置前 → 偏好位 → 右栏 tab）
  - `toggle`：manifest boolean features（extman ops API 切换 + `pi-web:ext-features-changed` 事件回灌；关闭的 feature 对应顶栏条目消失但开关卡仍可见可切）
  - `manage`：sidebarFooter 管理入口
- **tag 式分类（v2 体系）**：条目级（`meta.category` / 静态条目 `category`）→ feature 级（`features[].category`）→ 扩展级（index.ts 顶层 `category`，经 manifest 透传）→ 覆盖表 → 默认 `other`。内部固定 8 分类多语（会话与项目/代码与 Git/模型与 AI/自动化与 Agent/调试与观测/界面与阅读/系统与管理/其他），非内部 id = 自定义分类原样展示。扩展作者标注一个字段即可入册；未标注的存量扩展由 `APP_OVERRIDES` 覆盖表兜底归类
- **形态自适应（v3）**：应用 ≤ 12 平铺全部；否则常用 +「更多」两段式——无钉住记录（首次态）「更多」默认展开，用户逐个 ☆ 钉住后下次默认收起
- **搜索**：按 label/扩展名/extId/关键词（覆盖表补充）分词过滤，命中跨分类平铺
- **用户定制**：编辑模式（✏️）钉/拔、隐藏、上/下移；已隐藏项可恢复；`pi:app-center:pinned:v1` / `pi:app-center:hidden:v1`（localStorage，客户端约定）
- **移动端**：卡片触达 ≥40px、搜索不自动聚焦、chips 换行 tag 云；应用中心随侧栏抽屉全屏

## 架构

- 纯 client 扩展（零自有服务端 API）；经 client 服务 **`aiti-app-center.api`**（`{ renderAppCenter }`）交付
- 消费方 session-manager 编排器：挂载时 `ensureMaterialized("aiti-app-center")`，把服务组件工厂作 `filler` prop 传给 aiti-float DockStack——全折叠时渲染进 spacer，其余时刻零渲染
- 软依赖链：应用中心缺席 = 空白照旧（session-manager `optionalDependsOn`）；旧 aiti-float（无 filler prop）= 应用中心不显示，其余不受影响

## 依赖

- 宿主 pi-web：`registry.ts manifest()` 透传扩展级/feature 级 `category`（一行级 ×2；未同步的宿主上自动落覆盖表/默认分类，优雅降级）
- 运行时同伴：aiti-float（DockStack filler prop，v2）、session-manager（编排器接线）

## 方案

`dev-repo docs/aiti-app-center-plan.md`（2026-09-19 立项即实施；v2 分类体系重设计、v3 形态自适应）
