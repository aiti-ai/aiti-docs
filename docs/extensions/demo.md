---
title: demo
icon: 🧪
ext:
  id: demo
  name: Demo Extension
  description: 全插槽演示扩展 —— 框架验证用，覆盖每个扩展点
  type: dev-repo
  category: 示例
  version: 0.1.0
  status: experimental
  author: aiti-ai
  repo: ""
  install: |
    # 框架验证用，一般无需安装（已部署时可直接参考）
  license: MIT
  tags: [demo, framework]
---

# demo

pi-web 扩展框架的全插槽演示扩展：覆盖 `server.startup/shutdown/api/middleware`、全部 `ui.*` 插槽与 client bundle 协议，用于开发期验证框架。

> 完成使命后可在生产删除。写扩展时可以参考它（见 [aiti-agent 扩展点](/devtools/extension-points.md)）。
