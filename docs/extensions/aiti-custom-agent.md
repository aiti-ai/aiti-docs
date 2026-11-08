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
  version: "0.1.8"
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
| 驱动类型 | 通用命令（generic one-shot）或协议委托（claude/codex/zcode/cursor/qoder/acp/codebuddy/pi——经基础扩展 `ctx.services` 的 `<extId>.launch` 服务，别名 agentKey 随基础扩展、priority 5 直连优先认领；服务缺席不注册并 fail-loud）。协议型可再选「委托成员」（多成员家族如 ACP，缺省由基础扩展决定）；「命令」留空 = 该驱动默认 CLI（claude/codex/zcode/cursor/qoder/acp/codebuddy/pi），填了则作为启动包装交给 launch 服务 |
| **前缀命令**（下拉） | 默认「无」= 直接跑「命令」；用 docker / ssh / env / proxychains **等**包装真实 CLI——选中任一项即用该包装工具顶替 `command` 并展开对应结构字段（选「自定义」可写任意包装命令：sudo / nix-shell / podman / timeout…）；改动任一项即时重算「命令 + 参数前缀」，面板显示「实际执行：…」预览 |
| 命令 + 探测 | 选了包装类型时由它自动填（`docker`/`ssh`/`env`/`runsocks`，可手改换 podman 等）；探测按钮即时验证可执行性（ENOENT 即失败） |
| 参数前缀 | 每行一个参数，拼在驱动内置参数之前；支持 `$VAR` / `${cwd}`（会话工作目录）。前缀命令启用时由结构字段生成，仍可手改（改结构字段会按模板重写） |
| 环境变量 | 成员级 key-value，优先级最高；密钥建议 `$VAR` 引用父进程 env |
| 桥模式 | 继承 / host.docker.internal（替换主机保留端口路径）/ 自定义 URL / 关闭 |
| 探活 / 排序 / 启停 | 探活命令随包装类型自动预填（`docker version` / `ssh -V` / `env` / 工具名，手填的不覆盖）；缺省=命令（退出码不判定，二进制存在即算活）；order 小者靠前 |

### 前缀命令：四类包装

| 前缀命令 | 结构字段 | 生成结果（`command` + 参数前缀） |
|---|---|---|
| docker | 运行方式下拉（`run --rm -i` / `run --rm -it` / `run --rm -i --network host` / `compose run --rm` / `exec -i`）、镜像或容器名、容器内命令、附加参数（带「＋ 常用选项」下拉：`--add-host=host.docker.internal:host-gateway`、`--network host`、`-v ${cwd}:${cwd} -w ${cwd}`、挂载宿主 `~/.claude` / `~/.codex`） | `docker run --rm -i -v ${cwd}:${cwd} -w ${cwd} --add-host=… <镜像> claude` |
| ssh | 目标 `user@host`、端口（自动插 `-p`）、远端命令、附加选项（默认 `-t`） | `ssh -t -p 2222 wind@host claude` |
| env | 临时变量行（`KEY=VALUE`）、被包装命令 | `env FOO=bar HTTPS_PROXY=$HTTPS_PROXY claude` |
| 自定义 | 工具名填在「命令」框（任意可执行文件：sudo / nix-shell / podman / timeout / firejail…）、附加参数、被包装命令 | `sudo -E claude` / `nix-shell --run claude` |
| runsocks | 代理工具下拉（runsocks / proxychains4 / proxychains）、附加参数（如 `-f` 配置文件）、被包装命令 | `proxychains4 -f /etc/proxychains.conf claude` |

自定义是「等」的兜底：四类预设之外的包装命令都走它；设为预设类型时「命令」框自动填为工具名并只读（不会与模板脱钩），换 podman 之类请选「自定义」。

存储不变（仍是 `command` + `argsPrefix` 两项），因此老配置照常工作；打开一条老成员时会反向还原结构字段（docker 的运行方式/镜像/带值选项全部保序回填），看不到裸露的多行参数。
选择瞬间的迁移规则：原「命令 + 参数前缀」整串自动搬进「容器内/远端/被包装命令」字段（含原参数），不丢配置；不同包装之间切换时这段真实 CLI 跟着走（选回「无」则保留当前 command/参数原样交回用户手改）。

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
