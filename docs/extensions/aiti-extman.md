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
- **详情**：启停开关、版本、目录、插入点明细、依赖、服务端能力、来源地址、卸载（仅用户根）
- **在线注册表**：aiti.pw/extensions.json 代理拉取，浏览/一键安装/更新检查/文档跳转

安装后工具栏出现 🧩 扩展按钮。

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
