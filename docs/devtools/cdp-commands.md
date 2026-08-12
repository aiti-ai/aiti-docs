---
title: CDP 命令集
icon: ⌨️
description: 8 域 42 命令参考 — DOM/CSS/Input/Page/Runtime/Storage/Performance/Browser
tags: [devtools, cdp, reference]
---

# CDP 命令集（8 域 42 命令）

`page_exec` 支持的命令全集。AI 与人工操作共用同一套。

## DOM

| 命令 | 说明 |
|---|---|
| `query` / `queryAll` | CSS 选择器查询元素，返回简化节点树 |
| `getElementInfo` | 元素信息（tag/rect/text/attributes/xpath） |
| `setAttribute` / `removeAttribute` | 属性操作 |
| `insertHTML` | 插入 HTML |
| `removeNode` ⚠️ | 删除节点（危险，需确认） |
| `walkDom` | 遍历 DOM 结构 |

## CSS

| 命令 | 说明 |
|---|---|
| `getComputedStyle` | computed style |
| `setStyle` | 覆盖样式 |
| `getStylesheets` | 样式表列表 |
| `setMediaEmulation` | 媒体模拟（如 print） |

## Input

| 命令 | 说明 |
|---|---|
| `click` | 点击（坐标/元素） |
| `type` / `setValue` | 输入文本 |
| `key` / `keyChord` | 键盘事件 |
| `wheel` / `scroll` | 滚动 |
| `hover` | 悬停 |
| `file` | 文件输入 |

## Page

| 命令 | 说明 |
|---|---|
| `reload` ⚠️ | 刷新（危险，需确认） |
| `navigate` ⚠️ | 跳转（危险，需确认） |
| `screenshot` | 截图（base64） |
| `getPerformance` | 性能指标 |
| `print` | 打印模拟 |

## Runtime

| 命令 | 说明 |
|---|---|
| `eval` | 页面上下文执行 JS（会话内默认放行，面板审计可见） |
| `getGlobal` | 读取全局变量 |
| `consoleLogs` | 采集 console 输出 |

## Storage

| 命令 | 说明 |
|---|---|
| `getLocalStorage` / `setLocalStorage` / `removeLocalStorage` | localStorage |
| `getSessionStorage` / `setSessionStorage` | sessionStorage |
| `getCookies` / `setCookie` | cookie |

## Performance

| 命令 | 说明 |
|---|---|
| `getMetrics` | 性能指标 |
| `trace` | 性能追踪片段 |

## Browser（受限操作，宿主执行 + 手势桥）

| 命令 | 说明 |
|---|---|
| `clipboardRead` / `clipboardWrite` | 剪贴板（需用户真实点击） |
| `download` | 下载（需用户手势） |
| `openDialog` / `confirm` | 弹窗/确认框（经宿主转发） |
| `fullscreen` | 全屏（需用户手势） |
| `playMedia` | 媒体播放（需用户手势） |

## 通用语义

| 概念 | 说明 |
|---|---|
| 目标 | `pageId`（`instanceId/frameId`），缺省 = host frame |
| 危险命令 | `DANGER_COMMANDS` 名单 → 确认卡 + 确认队列 |
| 手势桥 | Browser.* 受限操作由宿主执行（transient activation 安全） |
| 结果 | `{ok: true, result}` 或 `{ok: false, error}`，按 requestId 关联 |

> 通过 MCP 调用见 [MCP 桥 · server](/mcp-bridge/server.md)。
