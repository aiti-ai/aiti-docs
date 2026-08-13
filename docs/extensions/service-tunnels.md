---
title: service-tunnels
icon: 🌐
ext:
  id: service-tunnels
  name: Service Tunnels
  description: 服务端口发现与隧道 UI —— 端口列表、自暴露状态、隧道信息
  type: dev-repo
  category: 服务隧道
  version: 0.2.0
  status: active
  author: aiti-ai
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/service-tunnels/ 后 reload
  license: MIT
  tags: [tunnels, ports, expose]
---

# service-tunnels

服务端口发现与隧道的**视图扩展**：读取 pi-web 核心的 `/api/services`、`/api/service-tunnels` 能力，渲染 Ports 工具条按钮与弹窗 UI（服务端口列表、自暴露状态、隧道信息）。

> 说明：隧道/代理/暴露的**库实例**在 pi-web core（单一 `globalThis` 实例），本扩展只做 UI，不重复起实例，避免版本冲突。
