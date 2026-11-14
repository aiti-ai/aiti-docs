---
title: 快速开始：从零写一个扩展
icon: 🚀
description: 跟着教程做出第一个 pi-web 扩展——server API + toolbar 按钮 + feature 声明，全程热重载验证
tags: [ext-dev, tutorial, quick-start]
---

# 快速开始：从零写一个扩展

> 目标：写一个 `my-ext` 扩展，带一个服务端 API、一个工具条按钮弹窗、一个可开关的 feature。
> 全程 15 分钟，不需要构建工具链（client 先手写 `.mjs`，要 JSX/npm 再上[模板](/extensions/ext-jsx-client.md)）。

前置：本机装好 aiti（pi-web）并有可访问实例。开发建议用 **dev 实例**（`PI_WEB_DEV_DIST=1`，
扩展根在 `~/.pi/web-dev/extensions/`，与生产互不干扰；目录分层详见[部署与热重载](/ext-dev/deploy.md)）。

## 1. 建目录

扩展 = 一个目录 + 一个入口文件。目录名 = 扩展 id（必须一致）：

```bash
mkdir -p ~/.pi/web-dev/extensions/my-ext/client
```

入口文件名支持 `index.ts` / `index.mjs` / `index.js` / `index.cjs`（jiti 转译 TS，
`moduleCache: false` 热重载生效）；目录内只有一个脚本文件时也可单文件布局。

## 2. 写入口 `index.ts`（server 侧）

```ts
// ~/.pi/web-dev/extensions/my-ext/index.ts
// 无需任何 import：jiti 直接加载 TS，宿主按结构契约校验。
// 要类型提示时用 module augmentation（宿主仓内开发才可行，见 contract.md）。

export default {
  id: "my-ext",                    // 必须与目录名一致
  name: "My Extension",
  icon: "🧰",
  description: "第一个扩展",

  server: {
    async startup(ctx) {
      // configDir/stateDir/cacheDir 三层目录由框架保证存在
      console.log("[my-ext] started, config at", ctx.configDir);
    },
    async shutdown(ctx) {
      // 热重载/退出时清理
    },
    // API：GET /api/extensions/my-ext/hello?name=xx
    async api(req, ctx) {
      if (ctx.method === "GET" && ctx.path[0] === "hello") {
        const name = ctx.searchParams.get("name") ?? "world";
        return Response.json({ hello: name, from: ctx.id });
      }
      return null; // 未命中的路径 → 404（必须返回 null，不能抛）
    },
  },

  ui: {
    // 声明式静态条目（懒加载 v2）：宿主在 client 物化前就能渲染这个工具条按钮
    toolbar: [{ id: "open", label: "My Ext" }],
    clientImmediately: true, // 缺省即 true；显式写出便于阅读
    i18n: {
      en: { "my-ext.title": "My Extension" },
      "zh-CN": { "my-ext.title": "我的扩展" },
    },
  },

  client: "client/bundle.mjs", // 第 4 步创建；先不放也行（纯 server 扩展可省）

  features: [
    { id: "greeting.enabled", label: "问候功能", type: "boolean", default: true },
  ],
};
```

> `ctx` 的完整成员见[服务端 ctx API](/ext-dev/server-api.md)。

## 3. 热重载验证 server 侧

```bash
# 让宿主重新扫描/加载扩展（dev 实例；端口按你的实例）
curl -X POST http://127.0.0.1:30142/api/extensions/reload

# 看加载状态（加载失败会在这里报错，不阻塞其它扩展）
curl http://127.0.0.1:30142/api/extensions/status | jq '.extensions["my-ext"]'

# 试 API
curl "http://127.0.0.1:30142/api/extensions/my-ext/hello?name=aiti"
```

到此已经有了一个带 API 的可用扩展。浏览器改动后端代码 → 再 POST reload 即生效。

## 4. 写 client bundle（toolbar 按钮）

client 是**单个预编译 ESM**，`default export function register(ctx)`，组件不 import react
（`h`/hooks 由宿主传入）。手写最小版：

```js
// ~/.pi/web-dev/extensions/my-ext/client/bundle.mjs
export default function register(ctx) {
  const { h, useState, registerItems } = ctx;

  function Panel() {
    const [open, setOpen] = useState(false);
    if (!open) return null;
    return h("div", { style: "position:fixed;top:60px;right:20px;z-index:9999;" +
      "background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px;" },
      h("span", null, ctx.t("my-ext.title")),
      h("button", { onClick: () => setOpen(false) }, "×"));
  }

  registerItems("toolbar", [
    {
      id: "open",
      // 声明式条目：宿主统一渲染 36×36 标准按钮，⋯ 菜单同款
      meta: { label: "My Ext", icon: "🧰", onClick: () => setOpen(true) },
    },
  ]);

  // 弹层本体挂到 dialogs 插槽（独立注册，open 状态自管）
  registerItems("dialogs", [{ id: "panel", render: () => h(Panel) }]);
}
```

浏览器**刷新页面**（reload 后前端 ESM module map 有缓存），工具条出现 🧰 按钮。

> 这是演示写法。真实项目请用[ext-jsx-client 模板](/extensions/ext-jsx-client.md)：
> JSX + TypeScript + npm 依赖，vite lib mode 打包出宿主能 `import()` 的单文件，
> React 经 host-shim 委托宿主，产物零 React 引用。

## 5. feature 开关验证

在扩展管理器（工具条 🧩）里找到 `my-ext` → 关掉「问候功能」→

- server 侧消费：`ctx.features.get("greeting.enabled")`
- client 侧消费：`ctx.getFeatures()["greeting.enabled"]` + `ctx.onFeatureChange(cb)`

`tool.*` 前缀的 feature id 有特殊语义：宿主在 agent 工具注入时自动过滤禁用工具
（详见[feature 声明与消费](/ext-dev/features.md)）。

## 6. 下一步

| 想做什么 | 去哪 |
|---|---|
| 用 JSX/npm 依赖写复杂 UI | [ext-jsx-client 模板](/extensions/ext-jsx-client.md) |
| 数据放哪（配置/状态/缓存） | [扩展数据与存储规范](/guide/ext-data.md) |
| 调用别的扩展 / 提供能力给别人 | [扩展服务与跨扩展调用规范](/guide/ext-services.md) |
| 重 UI 按需加载 | [懒加载契约](/guide/ext-lazy-loading.md) |
| 让 AI 会话里用你的工具 | [AI 集成](/ext-dev/ai.md) |
| 装到生产实例 / 发版 | [部署与热重载](/ext-dev/deploy.md) |
| 登记进文档站扩展注册表 | [ext 元数据规范](/extensions/spec.md) |

## 常见坑（新手五大坑）

1. **改了 client 没刷新浏览器**——reload 只更新服务端与 manifest，前端 bundle 是浏览器缓存的 ESM。
2. **`ctx.dataDir` 报错**——已移除，改用 `ctx.configDir` / `ctx.stateDir` / `ctx.cacheDir`（访问即抛是故意的）。
3. **API 返回 `undefined`**——未命中路径必须显式 `return null`（宿主按 null 判 404）。
4. **hooks 顺序错误**——组件里 hooks 必须在条件 return 之前调用（Rules of Hooks 对宿主注入的 hooks 同样生效）。
5. **version 写死在 entry**——会被 package.json 覆盖，别写；发版时只动 package.json。
