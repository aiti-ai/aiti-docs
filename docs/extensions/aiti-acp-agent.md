---
title: ACP 会话后端（aiti-acp-agent）
icon: 🔗
ext:
  id: aiti-acp-agent
  name: ACP 会话后端
  description: 泛用 ACP 驱动 —— 一个适配器接所有 Agent Client Protocol agent（10 家内置自动探测 + 自定义后端面板 + 授权卡/队列/模型目录）
  soul: 协议统一了，适配器只需要写一次。
  type: dev-repo
  category: 多 agent 后端
  version: "0.3.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-acp-agent/ 后 reload
  license: MIT
  tags: [acp, agent-client-protocol, session, multi-agent]
---

# aiti-acp-agent

> ❝ **协议统一了，适配器只需要写一次。** ❞

泛用 Agent Client Protocol（ACP）驱动：一个适配器接入所有讲 ACP 的 agent，作为多 agent 前端的通用会话后端。专属 CLI（qoder 等）有更深的定制需求时走各自专属扩展。

## 机制

- ACP 是 Zed 主导的 agent↔编辑器 JSON-RPC stdio 标准——协议统一了，适配器只需要写一次
- **装机才接原则**：启动时探测 PATH，装了对应 CLI 才注册该后端
- **内置后端自动探测（10 家）**：**`claude-agent-acp`**（agentKey `claude`；包已由 @zed-industries/claude-code-acp 更名 **@agentclientprotocol/claude-agent-acp**，bin 同步改名，0.16→0.100.0 全握手复测协议面 v1 不变，resolve 新 bin 优先旧 bin 兜底）、`gemini --experimental-acp`、`opencode acp`、`cbc --acp`（codebuddy，npx 兜底）、copilot（`--acp`）/ qwen / iflow / kimi / goose / cline
- **自定义后端**：「ACP Agents」管理面板 + `acp-agents.json`——任意讲 ACP 的 CLI 一行接入
- **能力面**：核心四件套 + followUp/queueManage/setModel/respondPermission（session/request_permission 授权卡）/getUsage（usage_update 帧）/listModels/fileAttachments（按 promptCapabilities.image 实例级收敛）/contextUsage/getMessages；steer ❌
- **模型目录（D15）**：cache 层 + 启动后台真实获取、上次使用置顶；claude-code 后端 order:10 保持下拉首位
- **feature**：`acp.permissionPolicy`（allow 默认 / ask 转前端授权卡）+ `acp.permissionTimeoutSec`（默认 300s 超时自动允许）+ `behavior.showAcpManager` + spawn 三件（env/command/argsPrefix）
- session/load 接管 + cwd 经 session-manager 恢复；cancel 6s 强制收口兜底；AI 自管理 skills（acp-agent-add / diagnose）

## 相关

- 多 agent 前端与 All Sessions：[session-manager](session-manager.md)
- 专属深度定制后端：[aiti-pi-agent](aiti-pi-agent.md) / [aiti-qoder-agent](aiti-qoder-agent.md)
