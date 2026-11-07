---
title: aiti-inject
icon: 💉
ext:
  id: aiti-inject
  name: aiti-inject
  description: dev 实例专用 —— 在 pi-web dev 页面注入生产 aiti-devtools launcher（FAB）
  soul: 调试的第一步不该是读文档。
  type: dev-repo
  category: 页面调试注入
  version: 0.3.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # dev 分支启动时作为 extra 扩展根注入：
    PI_WEB_EXTRA_EXTENSIONS_DIRS=/path/to/dev-exts npm run dev
  license: MIT
  tags: [dev, inject, launcher, fab]
---

# aiti-inject

> ❝ **调试的第一步不该是读文档。** ❞

**pi-web dev 分支专用**扩展：打开 dev 页面时把**生产** aiti-devtools 的 launcher（inject JS）注入页面，dev 界面出现生产的 FAB（调试器入口）。

- 两件事（v0.3+）：① client 注入生产 aiti-devtools launcher（带内容哈希版本号，launcher 改动 → 强制拉新）；② startup 生成 dev 独立 MCP 配置（`$PI_CODING_AGENT_DIR/mcp.json` 只写 aiti-devtools → dev 本地桥 `http://127.0.0.1:30142/dev/api/extensions/aiti-devtools/mcp/mcp` 一条，其余 MCP 服务器 merge 继承共享配置；`PI_WEB_DEV_AITI_MCP_URL` 可覆盖；`GET /status` 查看、`GET /sync` 重写）
- 生产环境（npm 安装包）不设置 `PI_WEB_EXTRA_EXTENSIONS_DIRS`，不加载此扩展。

## 相关

- 正经可配版：[aiti-debug-inject](aiti-debug-inject.md)（feature 配置目标地址 + 开关，跨实例调试）
