---
title: Qoder 会话后端（aiti-qoder-agent）
icon: ⚡
ext:
  id: aiti-qoder-agent
  name: Qoder 会话后端
  description: Qoder CLI 专属后端 —— 双区域 credits/listModels、WASM 签名请求、扩展 API 免开会话查询
  soul: 别人走 ACP 大路，它偏要走签名的独木桥——因为风景在对面。
  type: dev-repo
  category: 多 agent 后端
  version: "0.4.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-qoder-agent/ 后 reload
  license: MIT
  tags: [qoder, qodercli, credits, wasm, multi-agent]
---

# aiti-qoder-agent

> ❝ **别人走 ACP 大路，它偏要走签名的独木桥——因为风景在对面。** ❞

Qoder CLI（qodercli/qoderclicn）专属会话后端。二者是 claude-code 协议族成员，驱动层与 aiti-claude-code-agent 同构；本扩展独占 qoder 两个成员，在其之上增加：

| 能力 | 说明 |
|---|---|
| `getUsage` | 账号 credits/配额 —— `{openapi}/api/v2/quota/usage`（Bearer dt-token） |
| `listModels` | 模型目录 —— infer 网关 `/api/v2/model/list?Encode=1`（WASM 签名请求） |
| 扩展 API | `GET /api/extensions/aiti-qoder-agent/{usage,models}`（无需开会话） |

**双区域**：variant 区分国内/国际两套 CLI 与网关（intl=`qodercli`+api2-v2.qoder.sh；cn=`qoderclicn`+gateway.qoder.com.cn）。

**steer 探针门控**：注入面存在但默认关——`tools/steer-probe.mjs --record` 对该二进制 pass 才开（realpath 归一 + 版本新鲜度校验）。

**接管/冷恢复回放**：历史里的工具调用回放成 pi 原生工具卡（与直播同形，不再只剩 `🛠 {json}` 文本行）——
生产端 = session-manager claude-like adapter（`tool_use`/`tool_result` 按 id 配对），消费端 = `seedHistory`
走共享层 `@aiti-ai/ext-shared/seed-tool`。


## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（经 aiti-agent-manager 面板发起）：spawn 官方 CLI 的无浏览器登录（`NO_BROWSER=true`，双区域域名各自 `qoder.com`/`qoder.com.cn` 通道，正则不钉域名抓 `/device/selectAccounts`）——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-qoder-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停
