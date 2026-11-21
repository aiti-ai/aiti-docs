---
title: 本地开发与一键启动
icon: 🛠️
description: 克隆仓库后一条命令跑起来：扩展原位加载、边改边生效；开发模式与编译运行两种模式
tags: [guide, local-dev, development, in-place, extension]
---

# 本地开发与一键启动

在仓库里改代码、直接跑实例，**不需要把扩展部署到 `~/.pi/web/extensions`**。
宿主本来就会从 `<仓库>/extensions`（bundled 层）加载扩展；`npm run local` 把这条路径需要的
依赖、构建和启动串成一条命令。

## 1. 前提

- Node.js ≥ 22.19
- git clone 本仓库

## 2. 一条命令

```bash
git clone <repo> && cd <repo>
npm run local
```

首次运行会自动完成（后续运行按需跳过）：

1. **根依赖**：`node_modules/next`、`node_modules/vite`、`node_modules/esbuild` 缺失时执行 `npm install`
2. **pi 插件**：把 `pi-plugins/*` 以本地路径写入 `~/.pi/agent/settings.json`（`--no-plugins` 跳过；原文件备份为 `settings.json.bak-inplace`）
3. **扩展运行时依赖**：执行 `bin/bundled-extensions-reconcile.js`，准备共享 `node_modules` 并建立 `extensions/node_modules` 软链接
4. **扩展前端产物**：扫描 `extensions/*`，只构建"产物缺失 / 源码更新 / 产物残缺"的扩展
5. **启动**：`next dev`，默认 http://127.0.0.1:30141

> 扩展与 pi 插件都从**源码目录原位加载**：改源码 → reload / 重建 / 重启即可，不需要 deploy。

## 3. 编译运行

```bash
npm run local -- --prod
```

流程：扩展前端构建 → `next build --webpack` → `next start`（同一端口）。
构建产物在 `.next-local/`，与已有的 `.next` / `.next-dev` 隔离。

## 4. 常用参数

| 参数 | 说明 |
| --- | --- |
| `--prod` | 编译运行（build + start） |
| `--port <n>` | 端口，默认 30141 |
| `--build-only` | 只做依赖 + 构建，不启动（`npm run local:build`） |
| `--only a,b` | 只构建指定扩展 |
| `--skip-build` | 跳过扩展前端构建 |
| `--force-build` | 强制重建全部扩展前端 |
| `--no-install` | 跳过根依赖安装与扩展依赖 reconcile |
| `--no-plugins` | 不写 pi 插件本地路径 |
| `--restore-plugins` | 移除本脚本写入的插件条目并退出 |

## 5. 边用边改

| 改什么 | 怎么生效 |
| --- | --- |
| `app/` `lib/` `components/` `hooks/` | next dev HMR，刷新页面 |
| 扩展服务端 TS（`index.ts` 等） | `POST /api/extensions/reload` |
| 扩展前端（`client/**`） | `npm run local:build -- --only <id>` → 刷新页面 |
| `packages/aiti-devtools-inject` | `npm run local:build -- --only aiti-devtools`（会连带构建注入产物与 assets） |
| `pi-plugins/**` | 重启 `npm run local`（插件进程内加载） |
| 宿主 env / 端口 | 重启 `npm run local` |

## 6. 目录与数据

| 项目 | 位置 |
| --- | --- |
| 扩展源码 | `<repo>/extensions/*`（原位加载） |
| 扩展前端产物 | 各扩展目录内（`dist/` 或 `client/`，均不入 git） |
| 扩展运行时依赖 | `extensions/node_modules` → `<webRoot>/node_modules`（软链接） |
| 实例数据 | `~/.pi/web/data`（dev / prod 共用，与正式安装一致） |
| Next 产物 | `<repo>/.next-local` |

## 7. 常见问题

**扩展 UI 不显示 / client 404**
先跑 `npm run local:build -- --only <id> --force-build`；构建失败时按提示 `cd extensions/<id> && npm install`。

**构建失败提示找不到 vite/esbuild**
执行 `npm install`（根 devDependencies 已包含 `vite` 与 `esbuild`）。

**日志出现 `extension dependency reconcile failed`，或部分扩展未加载**
某个扩展依赖的版本可能尚未发布到 npm registry。脚本会跳过该包、以降级方式安装其余依赖，并让 `@aiti-ai/ext-shared` 直接使用仓库源码（源码优先）。若仍有扩展缺失，`cd extensions/<id> && npm install` 后重启。

**日志提示 `deployed extension(s) ... shadow the in-place sources`**
user 扩展层（dev：`~/.pi/web-dev/extensions`；prod：`~/.pi/web/extensions`）里有同名部署副本，会盖住仓库源码。把该目录下对应扩展移走即可（原位不需要部署副本）。

**改了 pi 插件没生效**
插件在实例启动时加载；重启实例（TUI 里同样需要重启会话/进程）。

**第一次启动 Next 修改了 `tsconfig.json`**
Next 会把 `.next-local/types` 加入 `include`，属于一次性正常行为，可提交也可留在本地。

## 8. 与正式部署的区别

- `npm run local` 面向开发：扩展从源码加载，不需要 `deploy-all`。
- 发布/生产仍使用部署模式（`~/.pi/web/extensions` 的部署产物），两者互不影响。
- 同一份 `~/.pi/web/data` 建议同一时间只跑一个实例。
