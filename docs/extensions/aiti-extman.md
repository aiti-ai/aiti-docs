---
title: aiti-extman
icon: 🧩
description: 扩展管理器 —— 搜索/启停/安装/在线注册表
ext:
  id: aiti-extman
  name: aiti-extman
  description: 扩展管理器 —— 搜索/启停/安装/在线注册表
  soul: 管扩展的，也该是个扩展。
  type: dev-repo
  category: 系统工具
  version: 0.1.0
  status: beta
  author: aiti-ai
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
- **详情**：启停开关、版本、目录、插入点明细、依赖、服务端能力、来源地址、**发行者**、卸载（仅用户根）
- **在线注册表**：aiti.pw/extensions.json 代理拉取，浏览/一键安装/更新检查/文档跳转
- **发行者信任（VSCode 式）**：安装前解析发行者并弹信任确认，未信任不安装；已信任发行者的后续安装自动放行

安装后工具栏出现 🧩 扩展按钮。

## 发行者与信任（publisher / trust）

每个扩展详情里显示**发行者**：名称 + 可点击的网站（新窗口打开）+ 信任状态 + 信任/撤销按钮。

**发行者来源判定**（安装时解析，优先级）：

| 来源 | 发行者取自 | 示例 |
|---|---|---|
| npm 包 | npm registry：`_npmUser` / `maintainers` / 最新版 `author`（私有 registry 无发行者信息时回退注册表条目 author / `npm:<包名>` 指纹） | `npm:@justdb/aiti-devtools` → jonschlinkert |
| github/gitlab/git | 仓库 owner（URL 解析，离线可得） | `git:https://github.com/foo/bar` → foo |
| 本地路径 / zip / 其他 url | package.json 的 `author`（字符串或对象）→ 网站取 author.url / homepage / repository | `/path/to/ext` → author.name |

安装成功后把解析出的发行者写回扩展目录 package.json 的 `publisher` 字段，供面板展示。

**信任门控**：安装（含 zip 上传）前先解析发行者——未在信任名单则**不安装**，返回 needsTrust，前端弹信任确认框（显示发行者名 + 可点击网站），点「信任并安装」才真正安装并记录信任；已信任发行者直接安装。信任名单持久化在 `<dataRoot>/aiti-extman/trusted-publishers.json`，可在添加面板「🤝 已信任发行者」区查看/撤销。

## AI 自管理能力

> AI 能为你：**启停/安装/卸载扩展、逐项开特性，乃至直接新建或修改一个扩展。**

```yaml
ai:
  manage: true
  skills:
    - 查看全量状态/在线注册表（GET /status、/registry）
    - 安装（git:/npm:/本地路径）/删除/启停/reload（POST /ops）
    - 特性开关：set-feature 逐项启停扩展声明的 features（如 aiti-devtools 的 aiti_* 工具）
    - 新建/修改扩展：`create-from-template` 模板库起步（**可选，AI 自由创建也行**）；配**规范提示词**（entry 契约/store 约定/部署链/红线 + 各扩展点 demo 参考）——**默认不注册为 skills，创建/修改时单独喂给 AI** → 写业务源码 → deploy → reload（用户工具栏立即出现）
  install: git:/npm:/本地路径/zip
  storage_dir: <dataDir>
  source_dir: dev-repo/<各扩展源码>
  page: 工具栏 🧩 扩展 → 管理器
```

接入 ai-helper 后：直接说「帮我建一个 XXX 扩展」→ AI 读模板生成/修改 → 部署上线（见 [aiti-helper](/extensions/aiti-helper.html)）。

### AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `extman-recommend` AI 推荐扩展 | 描述想实现的能力 → AI 推荐已装/在线的扩展 | 纯建议（自然语言） |

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。
