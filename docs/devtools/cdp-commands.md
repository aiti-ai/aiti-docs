---
title: CDP 命令集
icon: 🎛️
description: page_exec 可执行的类 CDP 命令全集 —— 8 域 47 命令
tags: [devtools, cdp, commands]
---

# CDP 命令集（8 域 47 命令）

`page_exec` 在目标页面内执行类 CDP 命令：`{ cmd: "DOM.querySelector", args: {...} }`。命令由注入 client 在页面上下文本地实现（非 Chrome DevTools Protocol 原生转发），命名对齐 CDP 风格。

## DOM

| 命令 | 说明 |
|---|---|
| `DOM.querySelector` | 选择器查元素，返回序列化节点（tag/attrs/xpath/text/computed/framework） |
| `DOM.querySelectorAll` | 批量查询，返回简化节点树（排除 aiti 自身 UI，上限 20 条） |
| `DOM.getDocument` | 文档树概要（可配深度，默认 3 层） |
| `DOM.getBoxModel` | 元素盒模型（content 四元组 + padding/margin/border/scroll） |
| `DOM.getOuterHTML` | 外层 HTML（截断至 8000 字符） |
| `DOM.getInnerText` | 可见文本（清洗后截断） |
| `DOM.setAttribute` / `DOM.removeAttribute` | 属性操作 |
| `DOM.removeNode` ⚠️ | 删除节点（不可恢复，需确认） |
| `DOM.clearSelection` | 清除当前选中态与轮廓 |

## CSS

| 命令 | 说明 |
|---|---|
| `CSS.getComputedStyle` | computed style |
| `CSS.getMatchedRules` | 命中规则 |
| `CSS.setStyle` | 覆盖样式 |
| `CSS.listStyleSheets` | 样式表列表 |
| `CSS.getStyleSheetText` | 样式表文本 |

## Input

| 命令 | 说明 |
|---|---|
| `Input.click` / `Input.hover` / `Input.focus` / `Input.blur` | 基础交互 |
| `Input.setValue` | 设值（React 兼容：原生 setter + input/change 事件） |
| `Input.type` / `Input.insertText` / `Input.keyPress` | 键盘输入 |

## Page

| 命令 | 说明 |
|---|---|
| `Page.getMeta` | 页面元信息（title/url/viewport/框架识别等） |
| `Page.scrollTo` / `Page.scrollIntoView` | 滚动定位 |
| `Page.reload` ⚠️ | 刷新（需确认） |
| `Page.navigate` ⚠️ | 跳转（需确认） |
| `Page.captureScreenshot` 🖐 | 截屏（getDisplayMedia，浏览器弹选择器选屏幕/窗口/标签页；大图自动落盘返回路径） |
| `Page.getFrameTree` | frame 树（iframe src/name/title，同域含 url/readyState） |

## Runtime

| 命令 | 说明 |
|---|---|
| `Runtime.evaluate` | 页面上下文执行 JS——**默认关闭**，面板里开启或先调 `Runtime.setEvalEnabled {enabled:true}`；`contextId` 进 iframe 上下文（同域，索引从 1 起） |
| `Runtime.setEvalEnabled` | 开关 evaluate |
| `Runtime.fetch` | 目标页上下文发请求（同源无 CORS，受网络模拟影响） |
| `Runtime.getProperties` | 对象属性枚举 |

## Storage

| 命令 | 说明 |
|---|---|
| `Storage.localStorageGet` / `localStorageSet` ⚠️ / `localStorageClear` ⚠️ | localStorage（写入/清空为持久数据，需确认） |
| `Storage.sessionStorageGet` | sessionStorage |
| `Storage.cookies` | cookie（document.cookie，截断 2000 字符） |

## Performance

| 命令 | 说明 |
|---|---|
| `Performance.getEntries` | 资源计时条目（最近 N 条，默认 10） |

## Browser（受限操作，宿主执行 + 手势桥）

浏览器安全策略要求 transient activation 的操作，由宿主页面经手势桥代执行：

| 命令 | 说明 |
|---|---|
| `Browser.copy` / `Browser.paste` | 剪贴板写/读（读可能弹授权） |
| `Browser.download` | 下载文件 |
| `Browser.openWindow` | 打开新窗口 |
| `Browser.pickFile` | 文件选择器（小文件直接返回内容/小图片转 dataUrl） |
| `Browser.share` | 系统分享面板（标题/文本/链接） |
| `Browser.fullscreen` | 全屏 |
| `Browser.play` | 播放音视频（绕过自动播放策略） |

## 兼容别名

旧短名经 `CMD_ALIASES` 自动映射：`getInfo` → `DOM.querySelector`、`highlight` → `DOM.querySelector`、`scrollIntoView` → `Page.scrollIntoView`。新代码请用标准名。

## 通用语义

| 概念 | 说明 |
|---|---|
| 目标 | `pageId`（`instanceId/frameId`），缺省 = host frame |
| 危险命令 ⚠️ | `DANGER_COMMANDS` 名单（5 项）→ 确认卡 + 确认队列；调试会话内可免重复确认（dangerAutoOkMs） |
| 手势桥 🖐 | `GESTURE_COMMANDS` 名单（9 项）→ 宿主执行（transient activation 安全），无人值守模式可配自动放行 |
| 结果 | `{ok: true, result}` 或 `{ok: false, error}`，按 requestId 关联 |

> 通过 MCP 调用见 [MCP 桥 · server](/guide/mcp/server.md)。
