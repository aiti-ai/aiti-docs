---
title: 浏览器扩展（Chrome / Edge / Firefox）
icon: 🌐
ext:
  id: aiti-devtools-browser-ext
  name: 浏览器扩展
  description: 任意网页零改造注入 aiti-devtools——Chrome / Edge / Firefox（含 Android）MV3 扩展：FAB + Inspector + AI 窗，配合桥即可让 pi / claude / opencode 操作任意页面
  soul: 别人的网页，也是我的调试现场。
  type: browser-ext
  category: 页面调试注入
  version: "0.1.0"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  installable: false
  install: |
    cd browser-ext && npm run build   # → dist/chrome dist/edge dist/firefox
    # Chrome/Edge：chrome://extensions 开发者模式 → 加载已解压扩展程序 → dist/chrome（Edge 选 dist/edge）
    # Firefox：about:debugging → 临时载入附加组件 → dist/firefox/manifest.json（Android 需 ≥128）
    # Firefox 永久：npm run package → dist/aiti-devtools-firefox.xpi（ESR/DevEdition/Nightly 免签安装；正式版/Android 需 AMO 签名）
  license: MIT
  tags: [chrome, edge, firefox, mv3, content-script, injection, any-page]
---

# 浏览器扩展（Chrome / Edge / Firefox）

> ❝ 别人的网页，也是我的调试现场。 ❞

aiti-devtools 浏览器扩展（MV3）：**任意网页——无需目标应用任何改造——一键注入页面内 AI 调试助手**（FAB 💬 AI + <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg> Inspector、点选、AI 窗），配合 aiti-devtools 桥（本地独立桥或 pi-web）即可用 pi / claude / opencode 等 agent 操作任意页面。

## 能力

- **三浏览器**：Chrome / Edge（111+）/ Firefox（128+，含 **Firefox for Android ≥128** 完整支持）；`npm run build` 产出 dist/{chrome,edge,firefox}，`npm run package` 出 zip + **firefox .xpi**
- **注入机制**：`world:"MAIN"` content script——launcher 源码构建时内联进 content/main.js，文件顶层执行**不受页面 CSP 约束**；配置走隔离世界（storage.sync → localStorage 跨 world 共享 → MAIN world document_idle 同步读）
- **防重复注入**：`__dbgLauncherInstalled` 守卫——页面本身有 launcher（如 pi-web）时不双注入
- **options 配置页（v2）**：**AI 目标**三档（pi-web 工作台 / 兼容 agent 宿主 / cockpit 兜底）+ 目标地址 + **一键探测本机 pi-web**（HEAD launcher 资产，30141/30142 自动预填，pi-web 选中联动预填同源桥地址）；**站点规则**（默认关 + 白名单/排除正则，deny 优先）；**高级**（桥地址 / AITI_BRIDGE_URL 一键复制）；保存后刷新页面生效

## 安装

```bash
cd browser-ext && npm run build      # → dist/chrome dist/edge dist/firefox
```

- **Chrome / Edge**：`chrome://extensions`（或 `edge://extensions`）→ 开发者模式 → 加载已解压扩展程序 → `dist/chrome`（Edge 选 `dist/edge`）
- **Firefox（临时载入）**：`about:debugging#/runtime/this-firefox` → 临时载入附加组件 → `dist/firefox/manifest.json`（重启后消失）
- **Firefox（永久 xpi）**：`npm run package` → `dist/aiti-devtools-firefox.xpi`——ESR / DevEdition / Nightly 开 `xpinstall.signatures.required=false` 后「从文件安装」永久使用；正式版 / Android 需 AMO 签名（`web-ext sign --channel=unlisted` 或 AMO 后台 unlisted 上传；稳定 gecko id `aiti-devtools@aiti.ai` 已固定；world:MAIN 注入依赖 ≥128）

## 使用

1. 装好后，任意网页自动出现右下角 FAB（💬 AI + <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px"><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/><path d="M12 12"/></svg> Inspector）
2. 点 💬 打开 AI 窗（默认 = 桥同源的 cockpit 操作台）
3. agent 端接入（三选一）：**pi**（装 aiti-devtools-pi，连同一桥）/ **stdio shim**（env `AITI_BRIDGE_URL`，options 页一键复制）/ **MCP**（`{ type:"http", url:"<bridgeUrl>/mcp/mcp" }`）

> 前置：桥在跑（`systemctl start aiti-bridge` 或 `node dev-repo/bridge/bin/aiti-bridge.mjs`）。

## v2 增强（P0 已实施）

> v1 默认全站注入 + AI 窗裸桥 cockpit——与动机错位。**v2 重构**：①**默认关**——popup「⚡ 本页启用（本次）」（纯运行时消息，导航后失效，优先于排除规则）+「★ 总是启用此站点」白名单 / 排除正则（deny 优先）；②AI 窗默认指向 **pi-web**（设置页一键探测本机 30141/30142 预填，选中联动预填同源桥地址）/ 兼容 agent 宿主 / cockpit 兜底；③v1 配置自动迁移（enabled→defaultEnabled、excludes→denySites、自定义 aiUrl→cockpitUrl）、**权限面不变**（storage/activeTab/scripting/<all_urls>）。P1/P2（快捷键、连通性自检 UI、per-site 目标、严格隐私模式）已在方案中定稿，滚动实施。

## 方案

已实施（2026-09-16：三浏览器构建 + 产物端到端注入验证通过）。定位：填补「任意网页无载体可注入」缺口——工程插件只覆盖接插件的应用、pi-web 扩展只覆盖 pi-web、端口注入只覆盖被代理端口，浏览器扩展把覆盖面推到**全部网页**。
