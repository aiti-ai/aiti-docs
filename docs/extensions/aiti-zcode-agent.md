---
title: ZCode 会话后端（aiti-zcode-agent）
icon: 🟢
ext:
  id: aiti-zcode-agent
  name: ZCode 会话后端
  description: 智谱 ZCode（桌面端内嵌 CLI runtime）驱动 —— app-server 长驻（默认，流式/工具卡/steer/附件）+ oneshot 兜底双通道，接入 All Sessions，合规吃 GLM 编程套餐
  soul: GLM 套餐在哪儿跑，面板就在哪儿看。
  type: dev-repo
  category: 多 agent 后端
  version: "0.1.9"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-zcode-agent/ 后 reload
  license: MIT
  tags: [zcode, glm, 智谱, bigmodel, cli, session, multi-agent, coding-plan]
---

# aiti-zcode-agent

> ❝ **GLM 套餐在哪儿跑，面板就在哪儿看。** ❞

智谱 ZCode 会话后端：驱动 ZCode 官方 CLI（桌面端 AppImage 内嵌的 `resources/glm/zcode.cjs`，node 直接跑），接入 All Sessions 多 agent 前端。编程套餐额度仅限官方工具白名单（Claude Code/Codex/ZCode/…）——**借道官方 CLI 本体 = 合规吃套餐**；所有 HTTP 调用（UA/指纹/工具定义）由官方 CLI 构造，扩展只做协议层驱动。


## 机制（传输通道双档，feature `zcode.transport`）

- **app-server（默认）**：长驻 ZCode Protocol（桌面端同款 NDJSON stdio）——流式打字机 / 原生工具卡 / steer 注入 / 热切模型 / 权限模式即时生效 / 文件附件 v4 上传，省每轮 ~5-6s 冷启动
- **oneshot（兜底档）**：`node zcode.cjs --json --mode M [--resume sess_xxx] --prompt <text>` 每轮单发 + `--resume` 续聊
- `--json` 为**单个 pretty JSON 对象**（exit 0 全量打印）：`{sessionId, traceId, turnId, response, usage{...}, projection{contextWindow}}`
- **3.17+ CLI 启动闸**：CLI 新增 `prepareCliProviderRuntimeEnv`（tui/app-server/login 无 builtin provider config 即崩）——扩展 `providerRuntimeEnv()` 注入 `ZCODE_BUILTIN_PROVIDER_CONFIG_FILE`（runtime 同包 `resources/config/provider/zcode-builtin.json` 优先，回退桌面刷新副本）+ `ZCODE_PERSONAL_PROVIDER_CONFIG_FILE`（`~/.zcode/v2/provider_config.json`），buildTurnEnv 与受控登录 driver 同闸；AppImage glm-only 解压补提 `resources/config/*`
- 懒持久化：`sess_xxx` 首轮后可知 → `session_backend_ready` 换绑 `zcode:sess_xxx`（core 双注册 handle + 站位文件跟随迁移）
- 站位命名：接管时写入真实标题（session-manager open-live 传 meta.name）；新会话首轮换绑后取首条 user 消息截断（core 通用）；刷新不丢
- 历史回放：resume 时经 All Sessions 服务出口（session-manager `services.sessions`）回填 liveHistory——zcode 存储的唯一读取实现在 session-manager `lib/agents/zcode.ts`，本扩展不自建读取；结构化工具行（IndexedMessage.tool）回放成 **pi 原生形状**（assistant.toolCall 块 + toolResult 消息按 toolCallId 配对）→ 前端按 pi 自家工具卡片渲染，不再退化 `🛠 {json}` 文本（2026-09-07）
- 模型注入走官方 env 通道（`ZCODE_MODEL`/`ZCODE_BASE_URL`/`ZCODE_API_KEY`），**不写 `~/.zcode/cli/config.json`**
- abort 两阶段：spawn 前（取消 runtime 解析/下载，AbortController）+ spawn 后（SIGTERM 杀子进程 → settled "aborted"）

## runtime 生命周期（按序尝试）

1. feature `zcode.runtimePath`：zcode.cjs 文件 / 解压目录 / ZCode-*.AppImage 本体
2. 自动探测：`/tmp/.mount_ZCode.*/`（挂载运行实例）→ 解压缓存（dataDir/runtime，版本去重）→ `~/.zcode/ZCode-*.AppImage`（最高版本）
3. 自动下载：官网 `zcode.z.ai/cn#all-downloads` 直链（`cdn-zcode.z.ai/.../linux/x64/`）→ `--appimage-extract` 解压缓存（免 root）

## 登录与 key 生命周期

1. feature `zcode.apiKeyOverride` 有值 → 直接用
2. dataDir 缓存 key（0600）且 credentials.json 指纹未变 → 用缓存
3. 解密 `~/.zcode/v2/credentials.json`（fallback secret 推导 + aes-256-gcm）→ 官方 login 同路径静默换 `zcode-api-key`（先查后建幂等）→ 缓存
4. 未登录 → fail-loud + 三条指引（桌面端授权 / `login --no-browser` / 手动填 override key）

## 能力面（fail-loud，按 `ZCODE_CAPABILITIES_BASE` + 通道分流）

| 能力 | 值 | 说明 |
|---|---|---|
| prompt / followUp | ✅ | app-server 流式打字机 + 顺序队列；oneshot 每轮单发 + `--resume` |
| steer | ✅ | app-server（v4 `sendText{requestedDelivery:"guide"}` 运行中注入，模型间隙 drain）；oneshot 注入失败自动降级本地 followUp 队列 |
| contextUsage | ✅ | usage.totalTokens / projection.contextWindow（1M 窗口套餐） |
| setModel | ✅ | app-server 即时；oneshot 下轮生效（ZCODE_MODEL 换 ref，bigmodel/zai 通道端点随动） |
| setPermissionMode | ✅ | app-server 即时生效 |
| queueManage / respondInteraction | ✅ | ExitPlanMode、AskUserQuestion 反向请求卡 |
| respondProviderHeaders | ✅ | provider_headers 验证码卡（见下「验证码桥」） |
| getUsage / listModels | ✅ | 动态模型目录（桌面端注册表优先） |
| fileAttachments | ✅ | app-server v4 attachment 上传 |
| fork | ✅ | 仅 app-server（见「fork 能力」节） |
| getTools / getCommands | ❌ | 内置工具集固定；commands list P2 |

## 模型目录

`bigmodel/GLM-5.3-Flash`（默认）、`bigmodel/GLM-5.3`、`bigmodel/GLM-5-Turbo`（seed 兜底三档）；目录以**桌面端注册表动态为准**（`buildZcodeCatalogRefs`），zai 通道同构。模型通道决定凭据链（bigmodel/zai 两套 OAuth token 分离）与端点（`open.bigmodel.cn/api/anthropic` / `api.z.ai/api/anthropic`）。

## 功能管理（extman features）

| feature | 类型 | 默认 | 说明 |
|---|---|---|---|
| `zcode.transport` | string | app-server | 传输通道：app-server 长驻 / oneshot 单发兜底 |
| `zcode.runtimePath` | string | 空 | 指定 runtime（zcode.cjs/解压目录/AppImage） |
| `zcode.autoDownload` | boolean | 开 | 探测不到时自动下载 AppImage（约 300MB） |
| `zcode.mode` | string | **yolo** | 每轮 `--mode`：yolo/build/edit/plan（2026-09-06 应用户要求由 build 改 yolo） |
| `zcode.model` | string | 空 | 新会话默认模型 ref；**留空自动跟随已认证的套餐通道**（读 coding-plan-cache，避免 zai 用户被 bigmodel 默认卡住） |
| `zcode.apiKeyOverride` | string | 空 | 手动提供编程套餐 API Key，跳过 OAuth 链 |
| `spawn.env` / `spawn.command` / `spawn.argsPrefix` | 继承 extman 共享声明器 | 空 | spawn 环境变量 / 启动命令覆盖（docker 化包装）/ 参数前缀 |

另有隐藏 feature `zcode.ultraGateway`（默认开；false 回退 provider 直连不做 ultra 网关 mapping）。

## All Sessions 接入（桌面端历史会话）

- 解析器：session-manager `lib/agents/zcode.ts`（**唯一读取实现**，id "zcode"）——读 `~/.zcode/cli/db/db.sqlite`（opencode 同构 schema：session/message/part，WAL 安全复制到 /tmp 后只读查询）；part 类型 text/reasoning/step-*/tool，reasoning 跳过、tool 降级 `🛠 名称(参数) → 输出` 文本行 + **结构化 tool 字段**（opencode-family 归纳器共享；output 超 20k 字符回放截断标注）
- 源卡片：All Sessions 面板发现 ZCode 源（count = db 会话数），激活后历史行入索引；详情预览即 adapter.parse
- 接管（open-live）：`zcode:sess_xxx` → 后端 createSession resume + **经 `services.sessions` 服务出口回放历史**（IndexedMessage → liveHistory）→ 主窗打开即有上下文，续聊 `--resume` 同一会话（实测：接管后问“上一条运行的什么命令”→ “pwd”）
- 服务出口：`ctx.services.get("session-manager.sessions").parseSession(compositeId)`（DI 方案 P1 key 契约；v1，进程内只读；消费方缺席 fail-silent，不得自行重实现各 agent 存储读取。旧 `__piWebExt.byId("session-manager")` 穿透为生产旧 core 过渡期兜底）

## 安全与边界

- 换 key 只与本机用户自己的凭据 + 智谱官方域名交互；key 缓存 0600 且不入 git
- 不写 `~/.zcode/cli/config.json`，不写桌面端 `v2/` 任何文件
- env 治理：spawn 仅透传 `governanceEnv("zcode")` 白名单（`ZCODE_MODEL/ZCODE_BASE_URL/...`）

## 🧬 验证码桥（provider_headers 反向请求卡）

ZCode 通道（start-plan 等）触发风控验证码时：client 自带 `CaptchaRequestCard`（自 pi-web core 外迁，「谁的能力谁渲染」——aiti-session-cards 仅保留交互元语/授权卡）。三态：**无感直通**（captchaVerifyParam 缓存 5min）/ **官方 AliyunCaptcha 滑块**（SDK 三元组缓存 1h）/ 失败取消；appserver 180s 超时兜底、轮次收口清卡。作答经 `respondProviderHeaders` 能力位回传。

## 🔑 受控登录（ext-controlled-login 标准，2026-09-08）

工具条 **🔑 登录**（或本面板）一键发起：后端 spawn 官方 CLI 的无浏览器登录（`z.ai` 通道），把授权链接推到本弹窗——**在任意设备的浏览器打开完成授权即可**，凭据由官方 CLI 自动落盘，扩展现有凭据链路自动感知。

- API：`POST /api/extensions/aiti-zcode-agent/login/start`（幂等）· `GET /login/status` · `POST /login/cancel`
- 状态机：waiting（转圈）→ success ✅ / failed / timeout / cancelled，均带重试；弹窗打开期间 2s 轮询状态、关闭即停

## 🔀 fork 能力：编辑从此处 / 分支（2026-09-18）

`session/fork` 协议面接线（capability `fork`，仅 app-server 常驻通道；oneshot=false）。`ZcodeHandle.fork(entryId, {reset})`：
- **编辑从此处**（reset=true，ChatWindow 发送路径按 capability 分流）：fork 子会话 → handle 换绑（rebindSessionId → session_backend_ready，宿主注册表/站位/队列 sidecar 全链路换绑）→ 历史从源重建 → 编辑消息就地续跑。等价 pi 的 navigate_tree 回退；zcode 无 truncate，fork-at-turn 是唯一协议面。首条消息（分支点空）= 根重建：丢通道清 sid，下轮 prompt 全新 create。
- **分支**（reset=false，消息「分支」按钮）：纯 fork，当前会话不动，返回子会话复合 id 供前端跳转（冷 resume）。
- 位置 id 映射：UI `ext-N` 与 liveHistory 严格 1:1（normalizeHandleMessages 直传 + 分页绝对索引）→ turnIndex = 前缀 user 计数 - 1。传分支点（上一条 assistant）= 不含被编辑消息；传消息自身 = 含该轮（分支语义）。已知局限：steer 注入的 user 气泡若服务端未持久化会致计数偏移（e8i 解析失败显式报错，不静默错位）。
- 服务端限制「运行中不许 fork」原样上抛人话提示（能力保留、时机受限）；文件回滚走 zcode 自有 checkpoint 语义，不经 git-trace 门。capability 门控：无 fork 无 navigateTree 的外部后端，「编辑从此处」按钮隐藏（标示不支持）。

## 测试

```bash
node --test dev-repo/aiti-zcode-agent/zcode-core.test.mjs
```

52 用例（zcode-core.test.mjs）+ zcode-appserver(33) / handle-fork(6) / handle-queue(7) / cards(1) 四套件：`--json` 解析 / 错误提取 / 模型 ref 与 env 组装 / 凭据解密+换 key 全链路（注入 fetch，零网络）/ 下载原子性（.part + abort 取消）/ 通道探测 / 假 AppImage 解压缓存 / handle wire 契约（换绑、resume、abort、错误帧、模型切换、种子跟随）/ app-server 通道 / fork / 队列 / 验证码卡。

> 真实 AppImage 补充实测：`--appimage-extract "resources/glm/*"` pattern 提取 3.11.2 → 47MB 产物（zcode.cjs 0.16.5）可执行，无需全量解压。
