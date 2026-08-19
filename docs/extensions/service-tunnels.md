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
  version: 0.3.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 源码：dev-repo dev-repo/service-tunnels/
    # 部署：node tools/deploy.mjs（构建客户端 + 拷贝 + 目标内 npm install --omit=dev）
    # 生效：POST /api/extensions/reload
  license: MIT
  tags: [tunnels, ports, expose, auth, totp, inject]
---

# service-tunnels

服务端口发现与隧道（**完整实现随扩展自包含**，2026-08 从 pi-web core 剥离）。**在哪都该能安全访问自己的本地服务**——这正是它的来源。

## 能力

### 1. 服务端口发现（Ports）

- 自动发现宿主进程树（含 pi agent 及其 spawn 的进程）当前监听的 TCP 端口（`GET /api/extensions/service-tunnels/services?refresh=1`）
- 端口列表即 proxy 的 allow-list：只有 enrolled 的端口可经 vhost（`<port><suffix>`）代理访问（默认零转发）
- 附带隧道信息与平台信息

### 2. 暴露与隧道（Expose / Tunnels）

- **expose**：把本地端口暴露为 http / https / tcp 隧道（schema 驱动参数，如 provider / site / host 后缀）
- **tunnel-start / tunnel-stop / tunnel-stop-all**：隧道启停管理
- 暴露入口绑定（addBinding）由扩展 middleware 统一代理（vhost 直通）

### 3. 自暴露（Self）

- **exposeSelf / stopSelf**：把宿主自身暴露为可访问站点（`PI_WEB_EXPOSE` 启动配置）
- **allowlocal 两阶段门禁**：自暴露直连需显式允许（本地访问控制）
- **allowhosts**：自暴露 host 白名单管理
- 自暴露访问地址查询（getSelfAccessUrls）

### 4. 认证（Users / TOTP）

- **用户管理**：user-add / remove / list / set-password / managers / summary（Basic 认证）
- **TOTP 两因素**：enroll / activate / status / disable / default-label（生产站点强制 two_factor 策略）
- 未认证请求 401/302 到登录（Authelia 或内置用户）

### 5. 注入联动（Inject）

- middleware 在认证决策后的 HTML 响应上注入 aiti-devtools launcher（`globalThis.__aitiInject` 判定的注入端口白名单）
- 被注入页面与隧道同源，注入/调试桥/隧道共用同一套 vhost 门禁

### 6. 安全与记录

- **DNS-rebinding 门禁**（宿主 proxy.ts）：所有 API 请求先过门禁（fail-closed）
- **allow-tool-download**：工具下载许可开关
- **隧道日志**：暴露/隧道启停与自暴露状态记录

## 架构（2026-08 从 pi-web core 剥离后）

```
pi-web core（只留通用门禁）
  ├─ proxy.ts：扩展 middleware 钩子（fail-closed）→ DNS-rebinding + PI_WEB_PASSWORD
  ├─ instrumentation.ts：ext registry 加载/启动（service-tunnels 由 startAll 启动）
  └─ app/api/extensions/[...path]/route.ts：/api/extensions/<id>/<action> 分发（含门禁）

service-tunnels 扩展（~/.pi/web/extensions/service-tunnels/，完全自包含）
  ├─ server.startup    → createServiceTunnels 单例（globalThis.__piServiceTunnels）+ PI_WEB_EXPOSE
  ├─ server.middleware → 服务 vhost 分支（st.proxy.parseHost/resolve）+ allowlocal 门禁
  ├─ server.api        → /api/extensions/service-tunnels/<action>（发现/暴露/隧道/用户/TOTP/自暴露）
  ├─ ui.toolbar/dialogs/banners + client bundle → ServicesDialog（Ports/Self/Users 三页签）+ 🔴 自暴露告警
  └─ node_modules/service-tunnels/ —— 标准 npm 依赖（私有源 npm-registry.example.com，deploy 时
     `npm install --omit=dev` 安装；加载器按扩展目录解析裸说明符）
```

- **URL 变更**：旧 `/api/services`、`/api/service-tunnels` 已随剥离移除；统一走
  `/api/extensions/service-tunnels/services` 与 `/api/extensions/service-tunnels/status`
- **middleware 兼容**：宿主 proxy.ts 在核心门禁前调用扩展 middleware 钩子——vhost
  决策、allowlocal 门禁、自暴露隧道域名映射全部在扩展内（与迁移前同进程、同
  globalThis 单例）
- **aiti-devtools 联动不变**：仍经 `globalThis.__piServiceTunnels` 读库实例做
  注入端口 enroll；middleware 的 aiti 注入经 `globalThis.__aitiInject` 读取
- **无扩展时**：无 vhost/自暴露功能，`/api/extensions/service-tunnels/*` 404，
  核心门禁不受影响

## 开发与部署

```bash
cd dev-repo/dev-repo/service-tunnels
node tools/build-client.mjs   # 客户端 bundle（esbuild，react→host-shim 外部化）
npm install                  # 开发依赖（esbuild）
node tools/deploy.mjs         # 构建客户端 + 拷贝源码 + 目标内 npm install --omit=dev
# 生效：POST /api/extensions/reload；测试：node --test server/*.test.mjs
```

> 依赖说明：`service-tunnels` 0.3.39+ 已把 justget 打包进自身 dist（零运行时依赖），
> 扩展经标准 npm 依赖引入；pi-web 扩展加载器按扩展目录解析裸说明符（`lib/ext/loader.ts`
> jiti id = 扩展入口），扩展可带标准 node_modules。
