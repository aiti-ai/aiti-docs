---
title: 自定义 Agent（aiti-custom-agent）
icon: 🧩
ext:
  id: aiti-custom-agent
  name: 自定义 Agent
  description: UI 表单注册自定义会话后端——启动命令 + 参数前缀 + 成员 env + 桥模式，保存即热生效；generic 驱动 one-shot spawn（docker 化 / 命令包装 / 同一 CLI 多配置）
  soul: 一行命令，一个后端；docker 里跑 agent，从此不再手写配置。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-custom-agent/ 后 reload
  license: MIT
  tags: [custom-agent, session-provider, launch-wrapper, docker, generic-driver, ui-config]
---

# aiti-custom-agent

> ❝ **一行命令，一个后端。** ❞

自定义 agent 注册中心（方案 `dev-repo/docs/aiti-custom-agent-plan.md`）：工具条 🧩 打开管理面板（列表 + 表单），把「启动命令 + 参数前缀 + 环境变量 + 桥模式」注册成新建会话的后端，**全程不写 JSON**，保存即热生效（unregister/register 热更新，失败可回退扩展 reload）。

## 典型场景

- Claude Code 跑在 docker 里（隔离宿主环境，`-v ${cwd}:${cwd} -w ${cwd}` 同路径挂载 + `--add-host` 回连桥）
- 同一 CLI 多配置并存（工作号/个人号：两条成员不同 env，各自 label）
- docker 跑一次性任务（任务文本写 stdin，stdout 流式进会话）
- 命令包装（代理/审计/初始化脚本：参数前缀）

## 表单字段

| 字段 | 说明 |
|---|---|
| 显示名 / 标识 id | 选择器展示名 / provider type（slug 自动生成可改） |
| 驱动类型 | 通用命令（generic one-shot）或协议委托（claude/codex/zcode/cursor/qoder/acp/codebuddy/pi——经基础扩展 `ctx.services` 的 `<extId>.launch` 服务，别名 agentKey 随基础扩展、直连优先认领；服务缺席不注册并 fail-loud） |
| 命令 + 探测 | 空=必填；探测按钮即时验证可执行性（ENOENT 即失败） |
| 参数前缀 | 每行一个参数，拼在驱动内置参数之前；支持 `$VAR` / `${cwd}`（会话工作目录） |
| 环境变量 | 成员级 key-value，优先级最高；密钥建议 `$VAR` 引用父进程 env |
| 桥模式 | 继承 / host.docker.internal（替换主机保留端口路径）/ 自定义 URL / 关闭 |
| 探活 / 排序 / 启停 | 探活命令缺省=命令（退出码不判定，二进制存在即算活）；order 小者靠前 |

## generic 驱动语义

one-shot 任务型：`prompt` 写进 stdin → stdout 逐块流式（`message_update`）→ 进程退出收口（`message_end` + `agent_settled`）；abort 杀进程（SIGTERM → 3s → SIGKILL）。能力面诚实声明：仅核心四件套 + getMessages；模型/权限/fork/队列等全部 false。历史本地 JSONL（`<configDir>/sessions/<id>.jsonl`），P1 不进 All Sessions（provider 不带 agentKey，宿主不落站位文件）。

launch 解析复用共享层 `dev-repo/_shared/agent-spawn-env.ts` 的 `resolveCliLaunch`（本扩展与 8 家 agent 扩展同款：env 合并顺序 = 基底/治理透传 → 自动 `AITI_BRIDGE_URL` → 成员 env → bridge 重写；`$VAR`/`${cwd}` spawn 时展开）。

## 端点

- `GET /api/extensions/aiti-custom-agent/agents` → `{agents:[{...成员, probe, registered, registryKey}], warnings}`
- `POST /agents`（创建，重复 id 409）/ `PUT /agents/<id>`（更新/改名）/ `DELETE /agents/<id>`
- `POST /probe`：`{id}` 重探已存成员 / `{command, probe}` 表单临场探测
- `POST /reload`：全量重建注册表；`POST /selftest`：generic 句柄事件流自检

## 存储

`<configDir>/agents.json`（内部格式，UI 读写；登记 `aitiConfigs.configFiles` 进备份白名单）。高级用户可直接编辑文件（支持 `env` 行式写法 KEY=VALUE / -NAME），非法条目按 warning 跳过不整体失败。
