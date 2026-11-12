---
title: aiti-extman
icon: 🧩
description: 扩展管理器 —— 搜索/启停/安装/在线注册表
ext:
  id: aiti-extman
  name: aiti-extman
  description: 扩展管理器 —— 搜索/启停/安装/在线注册表
  soul: 管扩展的，也该是个扩展。
  type: aiti-ext
  category: 系统工具
  version: "0.1.8"
  status: beta
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-extman/ 后 reload
  license: MIT
  tags:
    - extension
    - manager
    - registry
---

# aiti-extman

pi-web 的扩展管理器扩展：把扩展管理从宿主内置 UI 迁出，业务全部在扩展里实现。

- **搜索**：左列表上方搜索框——本地已安装 + 在线注册表（aiti.pw）合并结果；本地带已安装标记，在线的直接带安装按钮
- **来源安装**：搜索框粘贴 `git:` / `npm:` / github 链接 / 本地路径，出现「从来源安装」快捷项
- **详情**：启停开关、版本、目录、插入点明细（**可点击打开**）、依赖、服务端能力、来源地址、**发行者**、卸载（仅用户根）
- **在线注册表**：aiti.pw/extensions.json 代理拉取，浏览/一键安装/更新检查/文档跳转
- **发行者信任（VSCode 式）**：安装前解析发行者并弹信任确认，未信任不安装；已信任发行者的后续安装自动放行
- **共享依赖**：全部扩展声明的运行时依赖自动装进共享根 `<webRoot>/node_modules`（每实例一份），npm/git/zip 安装即用、无需手动装依赖；详情「npm 依赖」行逐项标注 ✓共享 / ●本地 / ✗缺失
- **功能打开**：详情「插入点」区把扩展声明的每个 UI 注入点列成可点击条目——全局插槽（顶部工具条/侧栏/弹窗等）点「打开」直接触发页面上对应按钮；需上下文的插槽（会话行操作/聊天输入框）点「在哪操作」提示在哪个上下文使用

安装后工具栏出现 🧩 扩展按钮。

## 发行者与信任（publisher / trust）

每个扩展详情里显示**发行者**：名称 + 可点击的网站（新窗口打开）+ 信任状态 + 信任/撤销按钮。

**发行者来源判定**（安装时解析，优先级）：

| 来源 | 发行者取自 | 示例 |
|---|---|---|
| npm 包 | npm registry：`_npmUser` / `maintainers` / 最新版 `author`（私有 registry 无发行者信息时回退注册表条目 author / `npm:<包名>` 指纹） | `npm:@aiti-ai/aiti-devtools` → jonschlinkert |
| github/gitlab/git | 仓库 owner（URL 解析，离线可得） | `git:https://github.com/foo/bar` → foo |
| 本地路径 / zip / 其他 url | package.json 的 `author`（字符串或对象）→ 网站取 author.url / homepage / repository | `/path/to/ext` → author.name |

安装成功后把解析出的发行者写回扩展目录 package.json 的 `publisher` 字段，供面板展示。

**信任门控**：安装（含 zip 上传）前先解析发行者——未在信任名单则**不安装**，返回 needsTrust，前端弹信任确认框（显示发行者名 + 可点击网站），点「信任并安装」才真正安装并记录信任；已信任发行者直接安装。信任名单持久化在 `<dataRoot>/aiti-extman/trusted-publishers.json`，可在添加面板「🤝 已信任发行者」区查看/撤销。

## 共享依赖（共享 node_modules）

扩展 server 端的运行时依赖不再「各扩展自带 node_modules」，而是统一装进**共享根**
`<webRoot>/node_modules`（每实例一份：`~/.pi/web` 与 `~/.pi/web-dev` 各一）。原理：宿主
jiti 从扩展目录逐级向上解析裸说明符，共享根一存在即对所有扩展生效；扩展本地
`node_modules` 就近优先（存量未迁移的扩展照旧）。

- **自动对齐（reconcile）**：安装 / 卸载 / zip 安装后自动把全部扩展 package.json
  `dependencies`+`optionalDependencies` 的并集写进共享根的 package.json 并
  `npm install --legacy-peer-deps`（同名冲突**同族区间取交集**——取下界最高者如 `^0.1.3`+`^0.1.5` → `^0.1.5`，单份物理拷贝也能满足所有声明者；区间互不相交/复杂 spec 才退 `||` 交 npm 自选；卸载后自动裁剪
  无人引用的包；`peerDependencies`/`devDependencies` 不装）。也可手动触发：
  `POST /ops {"action":"reconcile-deps"}`（deploy 脚本经 `_shared/reconcile-deps.mjs`
  通知，部署脚本不再自行 npm i）。
- **标注视图**：详情「npm 依赖」行逐项标 ✓共享（绿，共享根命中）/ ●本地（灰，扩展
  自带）/ ✗缺失（红，两边都没有——server 端 import 了未声明依赖），悬停看共享根路径。
- **要点**：server 端要用的第三方包必须写进扩展 package.json 的 `dependencies`；共享
  根的 package.json dependencies 字段由 extman 全权管理（每次 reconcile 按并集重写，
  勿手改）。
  （2026-09-10 实施，aiti-cmd 为已迁移样板）。

## 功能打开（注入点一键触发）

详情页「插入点」区把扩展声明的每个 UI 注入点（toolbar/sidebar/sidebarFooter/sessionTopbar/dialogs/sessionRowActions/chatInputTop…）列成可点击条目：

- **全局插槽**（不依赖会话上下文）：标记「全局」，点「打开」→ 在页面 DOM 中定位该功能入口并直接触发（顶栏按钮经 `data-topbar-id` 精确定位；侧栏/弹窗按 label 匹配），如点「🧰 AITI」条目直接打开 devtools 面板。
- **需上下文插槽**（会话行操作/聊天输入框等）：标记「⚠ 需上下文」，点「在哪操作」→ 提示该功能在哪个上下文使用（如「左侧会话列表·会话行操作按钮」「聊天输入框上方」），不做无上下文的强行触发。

插槽上下文定义在 `index.ts` 的 `SLOT_CONTEXT`（global: toolbar/sidebar/sidebarFooter/sessionTopbar/dialogs/banners/pages；context: sessionRowActions/chatInputTop）。

对懒扩展（`clientImmediately:false`），「打开」按钮先 `ensureMaterialized` 物化再打开（旧宿主优雅降级为直接打开）。

## 依赖反向视图（「被依赖」+ 硬阻止）

详情「依赖」区之外，每个扩展还能看**谁依赖我**（反向视图）。禁用/卸载时：**硬边**（`dependsOn` / 硬能力边，含生效提供者解析链）→ **硬阻止**——提示先禁用依赖者，不给「仍要禁用」按钮；仅 client 预取软边 → 自绘确认框列出受影响方可强行继续；可选边永不弹（设计于 2026-09-05 实施）。

## 依赖与能力模型（三视图 + pin）

基于 core 的声明式依赖与能力模型（`dependsOn`/`optionalDependsOn`/`provides`/`takeover`，规范见 [ext-services](/guide/ext-services.html) §6；已实施上线 2026-09-08，含生产 core 同步）：

- **三视图**：`exts`（扩展列表）/ `caps`（能力表：按能力名分组——提供者列表（生效者高亮）、消费方、pin 下拉；missing 能力标红）/ `conflicts`（同 id 多来源组 + takeover 冲突组，可 pin、一键回「自动」）。
- **边类型**：client（`clientDependsOn` 预取）/ hard-ext / optional-ext / hard-cap / optional-cap 五类（旧宿主降级仅 client 边）。依赖边展示解析结果链（如 `cap.git-trace → aiti-git-trace ✓`，missing ✗）。
- **警告口径**：禁用/卸载**硬阻止只吃 hard 边**（见上节）；能力边附解析链文案。管理器自身不允许禁用/卸载自己。
- **pin**：`extPins` 支持 `source:<extId>`（多来源指定）与 `capability:<name>`（能力生效者指定）双 key，`devPriority` 开关控制开发态工作区版本是否优先。解析裁决：pin > takeover 声明者 > semver 最新 > id 字典序。

## 扩展协议（aitiExtProtocol 徽标 + AI 升级）

扩展 package.json 声明 `aitiExtProtocol` 协议版本（如 `"1.0"`，语义 = 写法所遵循的协议代际）；列表行与详情「协议」行出状态徽标——当前 / 兼容 / 待升级 / 不兼容 / 过新（需升级宿主）/ 未声明 / 非法。待升级条目出 **🤖 AI 升级**按钮：唤起 aiti-helper `ext-protocol-upgrade` skill 读内置逐版本迁移手册自动迁移；安装响应带回 protocolCheck（规范 §7 筛查占位）。规范与 bump 流程见扩展开发规范。

## ops 动作全集

`POST /ops {"action":…}`：install / remove / enable / disable / reload / set-feature / **set-pin / set-dev-priority / trust / untrust / reconcile-deps**——aiti-app-center 的「一键禁用扩展」与开关视图消费的就是 enable/disable；`set-feature` 即逐项开停扩展声明的 features。

## 服务出口区

扩展卡片详情新增「服务出口」区：读取 `statusPayload.services`，展示该扩展经 `ctx.services.provide` 注册的全部服务 key（含 core 预置）——谁对外提供了什么一眼可见（P3 已实施）。配合上节依赖视图，形成「我依赖谁 / 我被谁依赖 / 我提供什么 / 我消费什么」的完整闭环。

## AI 自管理能力

> AI 能为你：**启停/安装/卸载扩展、逐项开特性，乃至直接新建或修改一个扩展。**

```yaml
ai:
  manage: true
  skills:
    - 查看全量状态/在线注册表（GET /status、/registry）
    - 安装（git:/npm:/本地路径）/删除/启停/reload/set-feature（POST /ops 全动作：set-pin / set-dev-priority / trust / untrust / reconcile-deps）
    - 新建/修改扩展：`create-from-template` 模板库起步（**可选，AI 自由创建也行**）；配**规范提示词**（entry 契约/store 约定/部署链/红线 + 各扩展点 demo 参考）——**默认不注册为 skills，创建/修改时单独喂给 AI** → 写业务源码 → deploy → reload（用户工具栏立即出现）
  install: git:/npm:/本地路径/zip
  storage_dir: <dataDir>
  page: 工具栏 🧩 扩展 → 管理器
```

接入 ai-helper 后：直接说「帮我建一个 XXX 扩展」→ AI 读模板生成/修改 → 部署上线（见 [aiti-helper](/extensions/aiti-helper.html)）。

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `extman-recommend` AI 推荐扩展 | 描述想实现的能力 → AI 推荐已装/在线的扩展 | 纯建议（自然语言） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。
