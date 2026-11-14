---
title: 部署与热重载
icon: 📦
description: 扩展目录分层与优先级、dev/prod 隔离、reload/status API、extman 安装与版本化
tags: [ext-dev, deploy, reload, extman]
---

# 部署与热重载

## 1. 目录分层与优先级

代码与数据分离；同一 id 存在于多层时，**高层覆盖低层**：

| 层 | 目录 | 说明 |
|---|---|---|
| user | `~/.pi/web/extensions/`（`PI_WEB_EXTENSIONS_DIR` 覆盖） | 正式安装位置 |
| extra | `PI_WEB_EXTRA_EXTENSIONS_DIRS`（逗号分隔） | 环境注入的中间层（列表序优先） |
| dev | `<宿主包目录>/dev-exts/` | 开发实例专用（如 dev 页面注入 FAB） |
| bundled | `<宿主包目录>/extensions/`（`PI_WEB_BUNDLED_EXTENSIONS_DIR` 覆盖） | 随包发布的基线 |

数据根：`~/.pi/web/data/<id>/`（`PI_WEB_DATA_DIR` 覆盖）——内部再分 config/state/cache 三层
（[存储规范](/guide/ext-data.md)）。

## 2. dev/prod 隔离

`PI_WEB_DEV_DIST=1`（dev server / dev systemd 服务）时，默认根整体切到 **`~/.pi/web-dev/`**：

- dev 实例加载 `~/.pi/web-dev/extensions/`，**不加载生产扩展集、不共享运行态**；
- 显式 `PI_WEB_EXTENSIONS_DIR` / `PI_WEB_DATA_DIR` 永远最高优先。

所以：开发期把扩展放进 `~/.pi/web-dev/extensions/<id>/`，生产装到 `~/.pi/web/extensions/<id>/`。

## 3. 热重载（服务端）

```bash
# 服务端代码改动 → 热重载（jiti moduleCache:false，代码生效）
curl -X POST http://127.0.0.1:<端口>/api/extensions/reload

# 加载状态 / 版本 / 加载错误（单个扩展失败不阻塞其它扩展）
curl http://127.0.0.1:<端口>/api/extensions/status
```

热重载流程：逐个 `shutdown()` → 清缓存 → `loadAll()` → `startAll()` → 成功后原子 swap
`globalThis.__piWebExt`。扩展在 `shutdown` 里清理资源；core 随后自动反卷该扩展提供的服务、
反注册会话后端。

## 4. 前端 bundle 生效

- `reload` 后**刷新浏览器**——前端 bundle 是浏览器 ESM module map 缓存的，服务端 reload 不清它。
- 也可以在页面里触发宿主 client 重载：`ctx.reloadExtensions()`（fresh manifest + 图谱调和 +
  失效物化；扩展管理器流程内部即用此）。

## 5. 安装形态

| 方式 | 做法 |
|---|---|
| 手工 | 拷目录到实例扩展根 → reload |
| extman | 扩展管理器（工具条 🧩）：搜索/启停/安装/在线注册表 → [aiti-extman](/extensions/aiti-extman.md) |
| 随包 | 打进宿主包 `extensions/` 基线（bundled 层，用户目录同名可覆盖） |

## 6. 版本化

- **唯一事实源是 `package.json` 的 `version`**（发布流程维护）；entry 里的 `version` 字段只是
  老扩展兜底，新扩展禁写。
- 注册表/extman/manifest 显示的版本都来自 package.json（缺失才回退 entry 值）。
- 配套发布纪律（私仓验证 → 官方源）见各发布仓文档；文档站登记见
  [ext 元数据规范](/extensions/spec.md)。

## 7. 排错速查

| 症状 | 检查 |
|---|---|
| reload 后扩展消失 | `status` 看加载错误；入口文件名/目录 id 是否一致 |
| client 改动不生效 | 浏览器刷新了吗？bundle 路径与 entry `client` 字段一致吗？ |
| API 404 | 未命中路径必须显式 `return null`（宿主按 null 判 404，返回 undefined 亦同）；检查路由拼接：`/api/extensions/<id>/<path...>` |
| 依赖的扩展不在 | extman 详情看依赖解析（`dependsOn` 声明式警告，不阻断加载——运行时自己降级） |
| dev 扩展在生产看不到 | dev 实例根是 `~/.pi/web-dev/extensions/`，生产装 `~/.pi/web/extensions/` |
