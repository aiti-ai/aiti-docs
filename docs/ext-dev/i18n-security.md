---
title: i18n 与安全
icon: 🌐
description: 扩展多语言（ui.i18n 表 + 类型契约）与安全模型（受信目录、fail-closed 门禁、fileAccess、publicApi 白名单）
tags: [ext-dev, i18n, security]
---

# i18n 与安全

## 1. i18n

### 声明（entry `ui.i18n`）

```ts
ui: {
  i18n: {
    en:      { "my-ext.greet": "Hello, {name}!" },
    "zh-CN": { "my-ext.greet": "你好，{name}！" },
  },
}
```

- 表结构：`Record<locale, Record<key, message>>`；key 自带扩展前缀命名空间（避免撞 key）。
- client 用 `ctx.t("my-ext.greet", { name })` 查表；宿主按当前 locale 取（缺失回退）。

### 类型契约（可选，宿主仓内开发）

声明 `LocaleNamespaceMap` 后，`t(key)` 的 key 获得编译期检查：

```ts
declare module "dev-repo/ext" {
  interface LocaleNamespaceMap {
    "my-extension": { "my-ext.greet": string };
  }
}
```

不声明则退化为 string（向后兼容）。**类型级文档，无运行时效果**。

### locale 感知

`ctx.getLocale()` 读当前 UI locale（跟随宿主语言设置），Intl 格式化（相对时间/数字）用它。

## 2. 安全模型

### 加载边界

- 扩展 = **完全服务器权限代码**，只从受信目录加载（`~/.pi/web/extensions/` 及各分层根，
  见[部署](/ext-dev/deploy.md) §1）。
- 加载失败不阻塞其它扩展（错误进 `/api/extensions/status`）。

### 请求门禁（fail-closed）

- 每个请求先过扩展 `middleware(req)` 钩子，再过 core 的 DNS-rebinding 门禁；
- **middleware 抛异常 = fail-closed 403**（aiti-agent core 兜底）——写中间件时保守失败，
  不要吞异常放行。

### 跨扩展 API 边界

- 扩展 API 挂在 `/api/extensions/<id>/<path...>`；默认同站门禁保护。
- 需要被**任意页面跨域 `<script src>`** 拉取的只读资产（服务端注入场景），用 `publicApi`
  白名单：仅 GET + 精确路径 + 声明的路径，写操作与未声明路径仍走默认门禁（详见
  [contract](/ext-dev/contract.md) §1 `publicApi` 行）。

### 文件访问

- 扩展读写用户文件**必须**走 `ctx.core.fileAccess`（`allowRoot(root)` / `isAllowed(p)`），
  复用宿主 allowed-roots 安全规则（会话 cwd 等已预授权）；不要自己拼路径绕过。
- 扩展数据只写自己的三层目录（configDir/stateDir/cacheDir）；跨扩展取数走
  [ctx.services](/guide/ext-services.md)，**禁止直读**他扩展 configDir。

### 客户端边界

- client bundle 在浏览器执行，权限等同于页面脚本；敏感操作一律下沉 server `api` 钩子。
- 插槽 extra 只喂数据（[宿主插槽红线](/guide/ext-services.md) §5.1）——写操作走服务，不走注入回调。
