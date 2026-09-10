---
title: CodeBuddy Code 会话后端（aiti-codebuddy-agent）
icon: 🔵
ext:
  id: aiti-codebuddy-agent
  name: CodeBuddy Code 会话后端
  description: 腾讯 CodeBuddy Code CLI（cbc）驱动 —— 每轮单发 -p stream-json + --resume 接入 All Sessions，API-key env 登录
  soul: 腾讯 CodeBuddy 会话，哪儿都能接上聊。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-codebuddy-agent/ 后 reload
    # 需要本机可用 cbc：npm i -g @tencent-ai/codebuddy-code（或依赖 npx 兜底）
  license: MIT
  tags: [codebuddy, tencent, cbc, workbuddy, cli, session, multi-agent, glm, kimi]
---

# aiti-codebuddy-agent

> ❝ **腾讯 CodeBuddy 会话，哪儿都能接上聊。** ❞

腾讯 CodeBuddy Code（WorkBuddy 桌面端剥离的官方 CLI，npm 包 `@tencent-ai/codebuddy-code`，命令 `cbc`）会话后端：每轮单发进程 + `--resume` 续聊（同 zcode/codex 的 exec 模式），接入 All Sessions 多 agent 前端——面板里的 cbc 历史行（`codebuddy:<sid>`）一键复活为 live 会话。

方案底稿：`docs/aiti-codebuddy-agent-plan.md`（2026-09-10 实测 2.148.0，§10 实施记录）。

## 机制

- 协议：`cbc -p <prompt> --output-format stream-json --include-partial-messages [--model M] [--permission-mode X] [--resume sid]`
- **stream-json 输出与 Claude Code 同形**：system/init（`session_id`/`model`/`tools`/`slash_commands`）+ stream_event（text_delta 增量）+ assistant + result（`is_error`/`usage`/`modelUsage.contextWindow`）
- ⚠ 错误轮 exit code 也是 0 —— 成败只认 result 帧
- 懒持久化：首轮 init 帧捕获真实 sid → `session_backend_ready` 换绑 `codebuddy:<uuid>`
- 历史回放：复活路径经 All Sessions 服务出口（session-manager `services.sessions`；cbc 存储的唯一读取实现在其 `lib/agents/codebuddy.ts`——**存储 jsonl 与 claude 非同构**：顶层 role/content + 数字毫秒时间戳 + `function_call`/`function_call_result`/`reasoning` 独立行型，工具调用折叠为结构化 tool 行 → 查看器原生工具卡（input/output 段），reasoning 不进时间线但提供真实模型）
- CLI 解析：feature `codebuddy.cliPath` → PATH 上的 `cbc`/`codebuddy` → npx 兜底（`process.execPath` + npm npx-cli.js，免 systemd PATH 坑；首用有包下载延迟）
- 队列：`_shared/backend-queue.ts` 共享层——运行中输入一律入本地 followUp 队列（单发模式无 steer 面），面板可见可撤回、settle 自动续轮

## 登录与凭据（双档齐备）

**API-key 档（P0）**
- iam.md 官方 env 直读：`CODEBUDDY_API_KEY` / `CODEBUDDY_AUTH_TOKEN`（优先级更高）/ `CODEBUDDY_BASE_URL`（第三方 OpenAI 兼容网关，绕腾讯积分）
- 凭据落点：扩展 configDir `codebuddy-credentials.json`（0600）；extman 功能管理的三个凭据 feature（apiKey/authToken/baseUrl）优先于凭据文件
- API：`GET /api/extensions/aiti-codebuddy-agent/login/status`（徽标数据源）· `POST /login/key` `{apiKey?,authToken?,baseUrl?}`（空串=清除该字段）· `POST /login/clear`

**浏览器 OAuth 档（服务端 PTY 驱动）**
- `POST /login/tui` `{site?}`：经 aiti-cmd `services.runner` 后台建 cbc 交互 TUI 会话（**进程所有权在服务端**，sid 共享给 aiti-cmd 前端 xterm 渲染），程序化喂 `/login`（可选 `site` 序号自动选站）
- `GET /login/tui/status`：`waiting|success|failed|timeout|idle` + 授权 URL（OSC8 还原 + SSO 提示词过滤，sticky）；完成以 `~/.codebuddy` 落盘指纹变化判定（settings.json + local_storage/ mtime）；330s 兜底超时
- `POST /login/tui/input` `{text}`：站点选择等人工介入键入转发（进程仍在后端）；`POST /login/tui/cancel` 终止
- 不实现 OAuth 协议、不碰凭据内容（受控登录标准哲学；`docs/aiti-codebuddy-agent-plan.md` §9.3）

## 能力面（fail-loud）

followUp / queueManage / setModel（下轮 `--model`）/ setPermissionMode（下轮 `--permission-mode`）/ listModels / getUsage / contextUsage（result.modelUsage）/ getMessages / listTools / getCommands ✅；steer / respondPermission（print 模式无审批面，`--permission-mode` 预放行）/ 文件附件 ❌

## 会话 recycle

`GET/POST /api/extensions/aiti-codebuddy-agent/session/recycle`——存量 handle 升级到当前扩展代码（热重载后老代码会话重建），同 aiti-zcode-agent。

## 桥工具注入（适配 C）

- `MCP_TARGETS` 已含 codebuddy（`~/.codebuddy/.mcp.json`）：`node dev-repo/bridge/bin/aiti-mcp-register.mjs --targets codebuddy` 注册 `aiti` shim 条目
- spawn env：治理白名单透传服务进程的 `AITI_BRIDGE_URL`；feature `codebuddy.bridgeUrl` 显式覆盖（优先生效）。两者皆无 → cbc 会话不含 aiti_* 工具，不影响正常对话

## 模型目录

cbc 内置（`--help` 实测）：default/fast/balanced/primary/deep 档位 + glm-5.3 / glm-5.2 / kimi-k3 / kimi-k2.6 / minimax-m3 / gemini-3.5-flash / gpt-5.6-{sol,terra,luna} / gpt-5.5 / gpt-5.4 / gpt-5.3-codex，并与 pi 目录合并展示。
