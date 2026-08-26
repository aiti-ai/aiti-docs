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
  version: 0.1.0
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

**双区域**：variant 区分国内/国际两套 CLI 与网关。

详见 `dev-repo/aiti-qoder-agent/README.md`；认证与 API 逆向见 `docs/qodercli-auth-api-analysis.md`。
