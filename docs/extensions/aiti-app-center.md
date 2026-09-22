---
title: aiti-app-center
icon: 🧭
ext:
  id: aiti-app-center
  name: 应用中心
  description: 左栏区块栈全部折叠后空白态的应用抽屉（开始菜单）——应用视图（动作/面板/管理入口卡，hover 快捷钉 + 信息页）与开关视图（feature 开关按扩展分组）双视图单行切换，tag 式分类（内部固定分类多语 + 自定义分类 + 默认 other）、按视图搜索、编辑模式排序/隐藏/恢复
  soul: 所有插件入口的家——折叠即开始菜单。
  type: dev-repo
  category: 系统与管理
  version: 0.2.0
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

左栏 DockStack 全部区块折叠后的大片空白 → 呈现应用中心：搜索行（含编辑 `✏️` / 打开扩展管理 `＋` / 视图切换）+ 常用（钉住）卡片网格 +「更多」分类浏览。任一区块展开即自动让位（filler 语义，零显隐状态）。

## 能力

- **两个视图，切换不占行**（v0.2.0）：搜索行右侧一枚紧凑图标按钮在「应用」与「开关」间往返（图标随当前视图指向另一侧）
  - **应用视图（默认）**：可执行入口卡——`action`（toolbar 声明式条目，`meta.onClick` 可调；懒扩展静态条目自带物化转发）、`panel`（rightFileDock 停靠面板，`present` 状态机：已停靠原位置前 → 偏好位 → 右栏 tab）、`manage`（sidebarFooter 管理入口）
  - **开关视图**：manifest boolean features 按**来源扩展分组**的行式开关（组头 = 扩展图标 + 名 + 计数；点击即切，经 extman ops API + `pi-web:ext-features-changed` 事件回灌；关闭的 feature 对应顶栏条目消失但开关行仍可见可切）。string/textlist 配置项不进口袋，由 extman 面板承接
  - 搜索限当前视图；切到开关视图自动退出编辑模式
- **hover 快捷钉 + 信息页（`?`）**：非编辑态桌面 hover 卡片右上角即出 `☆`（钉/拔，触屏常显），不必进编辑模式；钉住后「更多」保持展开（连续钉不被打断）。`?` 开信息浮层（absolute 于面板根节点、内容内部滚动）：
  - 来源扩展（名 · id · version · **描述**）、功能说明（卡片类型 + 名称 + feature 描述）
  - 该扩展的开关列表**就地可切**
  - **一键禁用扩展**：二次确认 → 处理中 → 乐观移除该扩展全部卡片 + 提示「可在 extman 重新启用」；硬依赖者非空则**置灰**并引导去 extman（口径 = manifest 声明近似，与 extman `depsResolved` 差异接受）；`aiti-app-center` 自身与 `aiti-extman`（管理器）不提供禁用按钮
  - 「打开 extman」跳转（extman 缺席时禁用区与 `＋` 一并隐藏）
- **编辑模式（`✏️`，仅应用视图）**：钉住区排序 ▲▼、隐藏 ✕、底部「已隐藏 N 项」恢复区——批量整理入口
- **tag 式分类（v2 体系）**：条目级（`meta.category` / 静态条目 `category`）→ feature 级（`features[].category`）→ 扩展级（index.ts 顶层 `category`，经 manifest 透传）→ 覆盖表 → 默认 `other`。内部固定 8 分类多语（会话与项目/代码与 Git/模型与 AI/自动化与 Agent/调试与观测/界面与阅读/系统与管理/其他），非内部 id = 自定义分类原样展示。扩展作者标注一个字段即可入册；未标注的存量扩展由 `APP_OVERRIDES` 覆盖表兜底归类
- **形态自适应（v3）**：应用 ≤ 12 平铺全部；否则常用 +「更多」两段式——无钉住记录（首次态）「更多」默认展开；形态判断取**实际可见钉住数**（隐藏项/未注册条目不计）
- **用户定制**：`pi:app-center:pinned:v1` / `pi:app-center:hidden:v1`（localStorage，客户端约定；只存应用卡）+ 同 tab `pi:app-center:store` 事件与跨 tab `storage` 同步；v1 残留的 `toggle:*` 记录由 `pruneToggleIds()` 在组件加载时一次性清洗（幂等、干净时零写入）
- **移动端**：卡片触达 ≥40px、搜索不自动聚焦、chips 换行 tag 云、操作按钮 `hover:none` 常显；应用中心随侧栏抽屉全屏

## 架构

- 纯 client 扩展（零自有服务端 API）；经 client 服务 **`aiti-app-center.api`**（`{ renderAppCenter }`）交付
- 消费方 session-manager 编排器：挂载时 `ensureMaterialized("aiti-app-center")`，把服务组件工厂作 `filler` prop 传给 aiti-float DockStack——全折叠时渲染进 spacer，其余时刻零渲染
- 软依赖链：应用中心缺席 = 空白照旧（session-manager `optionalDependsOn`）；旧 aiti-float（无 filler prop）= 应用中心不显示，其余不受影响
- 分层：`client/src/app-registry.ts` 纯逻辑（分类解析链 / 卡片组装 / 视图分流与分组 / 存储与迁移 / extman ops 调用）+ `client/src/app-center.tsx` 渲染（无自有状态存储）；禁用扩展的卡片消失走 extId 乐观过滤，不依赖宿主 store 更新时序

## 依赖

- 宿主 pi-web：`registry.ts manifest()` 透传扩展级/feature 级 `category` 与 `description`（description = 入口声明优先、package.json 兜底；未同步的宿主上分类自动落覆盖表/默认分类、描述显示「（无描述）」，优雅降级）。⚠ 宿主 registry 实例挂在 `globalThis.__piWebExt` 单例上，`manifest()` 的改动要重启 pi-web 进程才生效（`POST /api/extensions/reload` 换不掉它）
- 运行时同伴：aiti-float（DockStack filler prop，v2）、session-manager（编排器接线）、aiti-extman（`ops` set-feature/disable + `＋` 打开的面板；缺席即隐藏开关写与禁用区）

## 方案

- `dev-repo docs/aiti-app-center-plan.md`（2026-09-19 立项即实施；v2 分类体系重设计、v3 形态自适应）
- `dev-repo docs/aiti-app-center-refactor-plan.md`（v0.2.0 重构：视图分置不占行 / hover 快捷钉 + 信息页 / 编辑模式恢复 / 一键禁用状态机 / `toggle:*` 迁移，2026-09-22 实施）
