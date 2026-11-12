---
title: CodeBuddy Code 会话后端（aiti-codebuddy-agent）
icon: 🔵
ext:
  id: aiti-codebuddy-agent
  name: CodeBuddy Code 会话后端
  description: 腾讯 CodeBuddy Code CLI（cbc）驱动 —— stream 长连接（默认）+ exec 兜底双模式 + --resume 接入 All Sessions，control_request 三通道，API-key env 登录
  soul: 腾讯 CodeBuddy 会话，哪儿都能接上聊。
  type: aiti-ext
  category: 多 agent 后端
  version: "0.1.6"
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

腾讯 CodeBuddy Code（WorkBuddy 桌面端剥离的官方 CLI，npm 包 `@tencent-ai/codebuddy-code`，命令 `cbc`）会话后端：接入 All Sessions 多 agent 前端——面板里的 cbc 历史行（`codebuddy:<sid>`）一键复活为 live 会话。

（2026-09-10 实测 2.148.0；**2.150.0 起转 stream 长连接**）。

## 机制（进程模型双档，feature `codebuddy.connectionMode`）

- **stream（默认，2.150.0 实测）**：单进程长连接多轮——stdin 续写 + `control_request` 三通道（interrupt / set_model / set_permission_mode **运行中即时生效**）+ `can_use_tool` 转前端授权卡（respondPermission ✅）
- **exec（兼容档）**：`cbc -p <prompt> --output-format stream-json [--model M] [--permission-mode X] [--resume sid]` 每轮单发，模型/权限切换下轮生效，respondPermission:false（print 模式无审批面，`--permission-mode` 预放行）
- **stream-json 输出与 Claude Code 同形**：system/init（`session_id`/`model`/`tools`/`slash_commands`）+ stream_event（text_delta 增量）+ assistant + result（`is_error`/`usage`/`modelUsage.contextWindow`）
- ⚠ 错误轮 exit code 也是 0 —— 成败只认 result 帧
- 懒持久化：首轮 init 帧捕获真实 sid → `session_backend_ready` 换绑 `codebuddy:<uuid>`
- 历史回放：复活路径经 All Sessions 服务出口（session-manager `services.sessions`；cbc 存储的唯一读取实现在其 `lib/agents/codebuddy.ts`——**存储 jsonl 与 claude 非同构**：顶层 role/content + 数字毫秒时间戳 + `function_call`/`function_call_result`/`reasoning` 独立行型，工具调用折叠为结构化 tool 行 → 查看器原生工具卡（input/output 段），reasoning 不进时间线但提供真实模型）
- CLI 解析：feature `codebuddy.cliPath` → PATH 上的 `cbc`/`codebuddy` → npx 兜底（`process.execPath` + npm npx-cli.js，免 systemd PATH 坑；首用有包下载延迟）

## 登录与凭据（双档齐备）

**API-key 档（P0）**
- iam.md 官方 env 直读：`CODEBUDDY_API_KEY` / `CODEBUDDY_AUTH_TOKEN`（优先级更高）/ `CODEBUDDY_BASE_URL`（第三方 OpenAI 兼容网关，绕腾讯积分）
- 凭据落点：扩展 configDir `codebuddy-credentials.json`（0600）；extman 功能管理的三个凭据 feature（apiKey/authToken/baseUrl）优先于凭据文件
- API：`GET /api/extensions/aiti-codebuddy-agent/login/status`（徽标数据源）· `POST /login/key` `{apiKey?,authToken?,baseUrl?}`（空串=清除该字段）· `POST /login/clear`

**浏览器 OAuth 档（服务端 PTY 驱动）**
- `POST /login/tui` `{site?}`：经 aiti-cmd `services.runner` 后台建 cbc 交互 TUI 会话（**进程所有权在服务端**，sid 共享给 aiti-cmd 前端 xterm 渲染），程序化喂 `/login`（可选 `site` 序号自动选站）
- `GET /login/tui/status`：`waiting|success|failed|timeout|idle` + 授权 URL（OSC8 还原 + SSO 提示词过滤，sticky）；完成以 `~/.codebuddy` 落盘指纹变化判定（settings.json + local_storage/ mtime）；330s 兜底超时
- `POST /login/tui/input` `{text}`：站点选择等人工介入键入转发（进程仍在后端）；`POST /login/tui/cancel` 终止
- 不实现 OAuth 协议、不碰凭据内容（受控登录标准哲学）

## 能力面（fail-loud，按通道分流）

followUp / queueManage / setModel / setPermissionMode / listModels / getUsage / contextUsage（result.modelUsage）/ getMessages / listTools / getCommands ✅；stream 模式 setModel/setPermissionMode 运行中即时生效 + **respondPermission ✅**（can_use_tool → 前端批准/拒绝）；exec 兼容档切换下轮生效、respondPermission ❌；steer / 文件附件 ❌

## 会话 recycle

`GET/POST /api/extensions/aiti-codebuddy-agent/session/recycle`——存量 handle 升级到当前扩展代码（热重载后老代码会话重建），同 aiti-zcode-agent。

## 桥工具注入（适配 C）

- `MCP_TARGETS` 已含 codebuddy（`~/.codebuddy/.mcp.json`）：`node dev-repo/bridge/bin/aiti-mcp-register.mjs --targets codebuddy` 注册 `aiti` shim 条目
- spawn env：治理白名单透传服务进程的 `AITI_BRIDGE_URL`；feature `codebuddy.bridgeUrl` 显式覆盖（优先生效）。两者皆无 → cbc 会话不含 aiti_* 工具，不影响正常对话

## 模型目录（动态，D13）

`cbc --help` 真实清单经共享解析器 `probeCbcCatalog` 探测 + cache 层（`<cacheDir>/cbc-model-catalog.json`，可再生）——**动态为准**，文档清单降级为 fallback seed（default/fast/balanced/primary/deep 档位 + glm-5.3 / glm-5.2 / kimi-k3 / kimi-k2.6 / minimax-m3 / gemini-3.5-flash / gpt-5.6-{sol,terra,luna} / gpt-5.5 / gpt-5.4 / gpt-5.3-codex…新 cbc 已含 hy4-preview / glm-5.3-flash / kimi-k3-1 / kimi-k2.8-preview 等 16 档），并与 pi 目录合并展示。
