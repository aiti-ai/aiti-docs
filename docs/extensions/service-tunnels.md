---
title: service-tunnels
icon: 🌐
ext:
  id: service-tunnels
  name: Service Tunnels
  description: 服务端口发现与隧道 —— 端口列表 / 暴露与隧道 / 自暴露 / TOTP+用户认证 / 注入联动
  soul: 本地服务不该被防火墙关起来——在哪都应该可以安全访问。
  type: dev-repo
  category: 服务隧道
  version: 0.2.0
  status: active
  author: aiti-ai
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/service-tunnels/ 后 reload
  license: MIT
  tags: [tunnels, ports, expose, auth, totp, inject]
---

# service-tunnels

服务端口发现与隧道（pi-web core 能力，扩展提供 UI 入口）。**在哪都该能安全访问自己的本地服务**——这正是它的来源。

## 能力

### 1. 服务端口发现（Ports）

- 自动发现 pi-web 进程树（含 pi agent 及其 spawn 的进程）当前监听的 TCP 端口（`/api/services?refresh=1`）
- 端口列表即 proxy 的 allow-list：只有列出的端口可经 vhost（`<port><suffix>.your-pi-web.example.com`）代理访问
- 附带隧道信息与平台信息

### 2. 暴露与隧道（Expose / Tunnels）

- **expose**：把本地端口暴露为 http / https / tcp 隧道（schema 驱动参数，如 provider / site / host 后缀）
- **tunnel-start / tunnel-stop / tunnel-stop-all**：隧道启停管理
- 暴露入口绑定（addBinding）由 proxy 统一代理（vhost 直通）

### 3. 自暴露（Self）

- **exposeSelf / stopSelf**：把 pi-web 自身暴露为可访问站点（`PI_WEB_EXPOSE` 启动配置）
- **allowlocal 两阶段门禁**：自暴露直连需显式允许（本地访问控制）
- **allowhosts**：自暴露 host 白名单管理
- 自暴露访问地址查询（getSelfAccessUrls）

### 4. 认证（Users / TOTP）

- **用户管理**：user-add / remove / list / set-password / managers / summary（Basic 认证）
- **TOTP 两因素**：enroll / activate / status / disable / default-label（生产站点强制 two_factor 策略）
- proxy.ts 的 Basic auth 门禁：未认证请求 401/302 到登录（Authelia 或内置用户）

### 5. 注入联动（Inject）

- proxy 在认证决策后的 HTML 响应上注入 aiti-devtools launcher（`globalThis.__aitiInject` 判定的注入端口白名单）
- 被注入页面与隧道同源，注入/调试桥/隧道共用同一套 vhost 门禁

### 6. 安全与记录

- **DNS-rebinding 门禁**：所有 vhost/API 请求先过门禁（fail-closed）
- **allow-tool-download**：工具下载许可开关
- **隧道日志**：暴露/隧道启停与自暴露状态记录

## 形态说明

当前扩展是**视图形态**（纯 UI viewer）：隧道/代理/暴露的**库实例在 pi-web core**（单一 `globalThis` 实例），扩展读取 core API（`/api/services`、`/api/service-tunnels`）渲染 Ports 工具条按钮与弹窗，不重复起实例，避免版本冲突。
