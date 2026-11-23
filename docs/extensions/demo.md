---
title: Demo Extension（demo）
icon: 🧪
ext:
  id: demo
  name: Demo Extension
  nameEn: "Demo"
  description: 全插槽演示扩展 —— 框架验证用，覆盖每个扩展点
  descriptionEn: "Reference extension demonstrating every extension point: two client styles side by side (plain hyperscript, and JSX with npm dependencies built by vite), config files, skills and server-side hooks. Meant to be read as the canonical example of how an aiti extension is put together."
  soul: 框架先有例子，人才有样子。
  type: aiti-ext
  category: 示例
  version: "0.2.2"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 框架验证用，一般无需安装（已部署时可直接参考）
  license: MIT
  tags: [demo, framework]
---

# demo

> ❝ **框架先有例子，人才有样子。** ❞

pi-web 扩展框架的全插槽演示扩展：覆盖 `server.startup/shutdown/api/middleware`、全部 `ui.*` 插槽与 client bundle 协议，用于开发期验证框架。

> 完成使命后可在生产删除。写扩展时可以参考它（见 [aiti-agent 扩展点](/devtools/extension-points.md)）。
