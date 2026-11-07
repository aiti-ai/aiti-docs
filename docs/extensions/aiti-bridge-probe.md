---
title: aiti-bridge-probe
icon: 🩺
ext:
  id: aiti-bridge-probe
  name: 桥连接探针
  description: 手机端桥/SSE 连接探针（临时诊断）——页面侧采集生命周期/EventSource/fetch/心跳缺口证据落盘供 AI 分析；问题定位后应卸载
  soul: SSE 断在哪一环，让证据说话。
  type: dev-repo
  category: 调试
  version: "0.1.0"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    node dev-repo/aiti-bridge-probe/tools/deploy.mjs   # 临时诊断工具，不进部署 git；问题定位后卸载
  license: MIT
  tags: [debug, bridge, sse, mobile, diagnostics]
---

# aiti-bridge-probe · 桥连接探针

> ❝ **SSE 断在哪一环，让证据说话。** ❞

手机端（华为浏览器/Android）AI 主窗口 SSE 切后台失联问题的诊断工具：根因已在 aiti-devtools-inject「解冻重连锚点」修复，本扩展保留作未来桥连接问题的通用诊断面（对照探针/强制重连是通用手段）。

## 采集面

- 页面生命周期事件：visibilitychange / pagehide / pageshow / freeze / resume / online / offline
- EventSource 构造器 hook：所有 SSE 的 create/open/error（按 readyState 区分网络闪断 vs HTTP CLOSED）+ message 计数
- fetch hook：`/bridge/` 与 aiti-devtools 相关请求的状态码/耗时/失败
- **15s 心跳采样**：gap>25s = 页面被冻结/断网时段
- BridgeClient connect/disconnect 包装 + isConnected 镜像

## 使用

顶栏 🩺 按钮开浮层：实时状态（可见性/在线/连接/ES 数/心跳缺口）+ 事件流 + 三按钮——📤 全量上报（`POST /report` 落 `cacheDir/probe.jsonl`）/ ▶ 对照探针（裸 HTTP + 无 token 裸 SSE，分离传输层与协议层故障）/ 🔁 强制重连（复现恢复路径）。AI 经 `GET /report[?tail=N][?clear=1]` 读取/清空。

feature `probe.enabled`（默认开）控制按钮显隐。
