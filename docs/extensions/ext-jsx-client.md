---
title: ext-jsx-client
icon: ⚛️
ext:
  id: ext-jsx-client
  name: ext-jsx-client（扩展 JSX 模板）
  description: 扩展 client 用 JSX + TypeScript + npm 依赖的共享模板（vite lib mode + host-shim 委托）
  soul: 写扩展不该被迫手写 h() —— JSX + npm 依赖，复制即用。
  type: other
  category: 开发模板
  version: 0.1.0
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 这不是可安装扩展，而是源码模板 —— 复制到你的扩展目录后用：
    cd dev-repo && cp -r templates/ext-jsx-client <your-ext> && cd <your-ext>
    npm install && npm run build:client
  license: MIT
  tags: [template, jsx, vite, client, 模板, 脚手架]
---

# ext-jsx-client（扩展 JSX 模板）

> ❝ **写扩展不该被迫手写 `h()` —— JSX + npm 依赖，复制即用。** ❞

让 pi-web 扩展 client 能用 **JSX + TypeScript + npm 依赖**的共享模板：vite lib mode
打包成宿主能 `import()` 的单个 `.mjs`，`react` 经 host-shim 委托宿主 `h/useState/…`，
产物零 React 引用、npm 包全内联。

## 为什么需要它

扩展 client 之前"不能用 JSX/npm"不是框架限制，而是**没走构建**：

| 端 | 加载 | 用 npm | 用 JSX |
|---|---|---|---|
| server（`index.ts`） | jiti（服务端） | ✅ | ✅ |
| client（`client/*.mjs`） | 浏览器 `import()` | 原样 serve 不支持 | 原样 serve 不支持 |

模板给 client 补一步 vite 构建，两条路都通了。可运行例子见 [demo 扩展](/extensions/demo.html)（顶栏 ⚛️ 按钮）。

## 三步使用

```bash
# 1. 复制模板
cd dev-repo && cp -r templates/ext-jsx-client <your-ext> && cd <your-ext>

# 2. 改三处
#    - vite.config.ts：build.lib.fileName → "<your-ext>.mjs"（= index.ts 的 client 字段）
#    - package.json：dependencies 加你的 npm 包（如 qrcode/date-fns）
#    - client/src/entry.tsx：换成你的 UI（registerItems 注册 toolbar/dialogs/...）

# 3. 构建 + index.ts 指向产物
npm install && npm run build:client
# index.ts: export default { id: "your-ext", client: "client/<your-ext>.mjs", ... }
# deploy 脚本里先跑 build-client.mjs
```

## 模板结构

```
templates/ext-jsx-client/
├── package.json            # scripts(build/deploy) + vite devDep
├── vite.config.ts          # lib mode + jsx automatic + alias 正则 + external:[]
├── skills/                 # AI 帮助点（aiti-helper skills 机制）
│   ├── index.json          # 列 skill 名（如 ["ext-guide"]）
│   └── ext-guide/SKILL.md  # 占位 skill（复制后换成你的帮助点）
├── client/src/
│   ├── entry.tsx           # register(ctx) 入口 + 示例面板（useState/列表 map key 示范）
│   ├── host-shim.ts        # react → 宿主 h/useState… 委托桥（含 jsxs validated 标记）
│   └── jsx-runtime.ts      # 一行
└── tools/build-client.mjs  # 包装 vite build
```

## 原理（三个关键设计）

1. **vite lib mode**：`client/src/entry.tsx` → 单个 ESM `.mjs`（`formats: ['es']`），
   宿主加载方式不变。
2. **host-shim 委托**：`resolve.alias` 把 `react` / `react/jsx-runtime` 指到
   `host-shim.ts`，hooks 委托宿主 `register(ctx)` 传入的 `h/useState/useEffect/apiUrl/t`。
   产物零 React 引用，宿主保持单渲染实例。
3. **依赖内联**：`rollupOptions.external: []` 强制 npm 依赖全打进单个 `.mjs`。

## AI 帮助点（aiti-helper skills）

模板自带 `skills/` 骨架。扩展在 `index.ts` 声明后，aiti-helper 会自动聚合该扩展的
AI 帮助点（弹窗 🤖 AI 按钮 → 按扩展分组高亮）：

```ts
export default {
  id: "your-ext",
  // ...
  ai: { manage: true, intro: "一句话：AI 能帮我做什么", skills: "skills" },
}
```

- `skills/index.json` 只列 skill 名；每个 skill 一个 `skills/<name>/SKILL.md`（frontmatter：`name/title/summary/placeholder/outputs/action`，正文是给 AI 读的手册，可用 `{basePath}` 拼 API 路径）
- 可运行例子：[demo 扩展](/extensions/demo.html) 的 `skills/demo-selfcheck`（AI 跑自检）与 `demo-humor`（AI 玩幽默彩蛋）

## 常见坑（模板已踩平，勿回退）

- **vite 默认 classic JSX** → 必须 `esbuild.jsx: "automatic"`，否则产物 `React.createElement` + React 未定义。
- **alias 前缀匹配** → 用正则 `/^react$/`、`/^react\/jsx-runtime$/` 分开（字符串 alias 会吞 `jsx-runtime`）。
- **lib mode 默认外部化 dependencies** → 必须 `external: []` 才内联。
- **`__setCtx(ctx)` 最先调**（任何 JSX 渲染前），否则组件里 hooks 委托不到宿主。
- **静态兄弟元素假阳性 key 警告** → host-shim 的 `jsxs` 必须补 `_store.validated = 1`（值必须是 1；2 仍告警）。抄 host-shim 时别漏这段。
- **JSX 里 `map()` / svg path 数组必须给 key**（宿主是 React，规则一致）。
- **弹窗关闭按钮带 `aria-label="关闭"`**：aiti-helper 的全局 AI 按钮靠识别关闭按钮注入到其左边；裸文本"关闭"识别不了 → AI 按钮不注入。
- **DialogsSlot 的 `onClose` 别传空函数**：会导致面板内关闭按钮/遮罩全部失效，要绑真实状态（`onClose={() => setPanelOpen(false)}`）。

## 命令

```bash
npm run build:client   # 构建（改源码后必跑，否则页面无变化）
npm run watch          # vite build --watch：改源码自动重建（rev 变化 → 配合前端 rev poller 即无刷新 HMR）
```

> 详细方案文档（本地 `dev-repo/docs/aiti-ext-jsx-vite-plan.md`）：host-shim 完整代码、
> vite.config 全文、HMR 分层方案。
