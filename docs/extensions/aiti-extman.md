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
