---
title: aiti-omp-agent
icon: 🦉
ext:
  id: aiti-omp-agent
  name: Oh My Pi Agent
  description: Oh My Pi (omp.sh)——pi 最大 fork 的 RPC spawn 后端（拆分自 aiti-pi-agent 专一 omp）：omp --mode rpc 子进程 + ready 握手 / get_state 能力面 / host tools / login / branch
  soul: omp 的独立世界：ready 握手 / get_state 能力面 / host tools / login / branch。
  type: aiti-ext
  category: 多 agent 后端
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-omp-agent"
  install: |
    # 需本机装有 omp（bun install -g @oh-my-pi/pi-coding-agent，bun ≥1.3.14），或 OMP_CLI 指定路径
  license: MIT
  tags: [omp, rpc, spawn, session-backend, host-tools, login, branch, subagents]
---

# aiti-omp-agent · Oh My Pi 后端

> ❝ **omp 的独立世界：ready 握手 / get_state 能力面 / host tools / login / branch。** ❞

Oh My Pi（omp.sh，pi 的 Bun-only 超集 fork：subagents / plan mode / LSP-DAP / hindsight 记忆等）的 RPC spawn 后端——每会话一个独立 `omp --mode rpc` 子进程（bun 解释，stdio 换行分隔 JSON 协议）。拆分自 aiti-pi-agent 专一 omp；引擎层 `fork-rpc/` 与 pi-agent 同源（`_shared/pi-fork-rpc` 部署副本，差异全由 spec.commands 布尔位声明）。

## 机制

- **CLI 解析**：`OMP_CLI` 显式 → PATH `omp` → 兜底 `~/.bun/bin/omp`（systemd PATH 不含 bun bin）；未装 omp 照常注册，createSession 报清晰安装指引
- **线协议**：`ready` 握手（15s 超时兜底；ready 前死亡 fail-loud 报原因）→ `agent_start/turn_start/agent_end/agent_settled` / `model_select` / `queue_update`（远端队列镜像）/ `extension_ui_request`（pendingUI 封顶 32，超限自动取消最老）
- **会话 id 换绑（B4）**：omp 无 `--session-id`——ready 后轮询读回真实 `rpcSessionId` → `ctx.core.rebindSessionBackend` 换绑（旧宿主降级 skip）→ 总线广播 `aiti-omp-agent:rebind {from,to}`，session-manager 消费收敛占位行
- **spawn env 治理**：`governanceEnv("omp")` 白名单透传 + `AITI_BRIDGE_URL` 必注入 + extman `spawn.env` 用户列表（`-NAME` 可拔自动注入项）

## 能力面

steer / followUp / queueManage（list/clear/move/convert/remove/recall/requeue）/ getMessages / **contextUsage** / setModel / setThinkingLevel / **fork（branch 命令，`omp-m<N>` 经 sessionFile JSONL 反查真实 entry id）** / renameSession / compact / getCommands / **listTools（get_state.dumpTools）** / respondInteraction / **subagents**（getSubagents / 订阅分级 off|progress|events / getSubagentMessages）。login 走 `/login` 拦截 → `get_login_providers` → 候选合成 select UI / 直启 → `open_url` 帧驱动前端登录卡。

## P2 host tools 桥

ready 后拉 aiti-devtools 桥 MCP（`AITI_BRIDGE_URL`）`tools/list` → 按 **G1 白名单**过滤（缺省只读子集 14 个：aiti_inbox / page_snapshot / self_ui / user_* 等，写类 page_exec/form_fill 默认排除）→ `set_host_tools` 注入 omp；agent 调用经 HTTP `tools/call` 透传回桥；桥不可达静默降级。白名单 feature `hostToolsAllow`（留空=只读子集、`*`=全量、逗号分隔精确名单）。

## feature 开关

`spawn.env` / `spawn.command`（docker 化包装）/ `spawn.argsPrefix` / `hostToolsAllow`（下一轮会话生效）。

## 关系

aiti-pi-agent（拆分来源，专一 pi）；session-manager（消费 rebind 帧）；aiti-devtools（host tools 桥源）；aiti-custom-agent（提供标准 `.launch` 委托服务形状，暂无 omp 驱动消费方）。
