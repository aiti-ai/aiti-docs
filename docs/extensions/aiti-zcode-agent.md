---
title: ZCode 会话后端（aiti-zcode-agent）
icon: 🟢
ext:
  id: aiti-zcode-agent
  name: ZCode 会话后端
  description: 智谱 ZCode（桌面端内嵌 CLI runtime）驱动 —— --json + --resume 接入 All Sessions，合规吃 GLM 编程套餐
  soul: GLM 套餐在哪儿跑，面板就在哪儿看。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
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

调研底稿：`docs/zcode-desktop-cli-agent-analysis.md`（2026-09-06 实测，runtime 0.16.5 / AppImage 3.11.2）。

## 机制

- 协议：`node zcode.cjs --json --mode build [--resume sess_xxx] --prompt <text>`
- `--json` 为**单个 pretty JSON 对象**（exit 0 全量打印）：`{sessionId, traceId, turnId, response, usage{...}, projection{contextWindow}}`
- 进程模型：每轮一个单发进程 + `--resume` 续聊（同 aiti-codex-agent 的 exec 模式）
- 懒持久化：`sess_xxx` 首轮后可知 → `session_backend_ready` 换绑 `zcode:sess_xxx`（core 双注册 handle + 站位文件跟随迁移）
- 站位命名：接管时写入真实标题（session-manager open-live 传 meta.name）；新会话首轮换绑后取首条 user 消息截断（core 通用）；刷新不丢
- 历史回放：resume 时经 All Sessions 服务出口（session-manager `services.sessions`）回填 liveHistory——zcode 存储的唯一读取实现在 session-manager `lib/agents/zcode.ts`，本扩展不自建读取
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

## 能力面（fail-loud）

| 能力 | 值 | 说明 |
|---|---|---|
| prompt / followUp | ✅ | 每轮单发 + `--resume`，天然顺序语义 |
| contextUsage | ✅ | usage.totalTokens / projection.contextWindow（1M 窗口套餐） |
| setModel | ✅ | 下轮生效（ZCODE_MODEL 换 ref，bigmodel/zai 通道端点随动） |
| abort | ✅ | SIGTERM 杀本轮子进程 → settled "aborted" |
| steer | ❌ | 需 app-server 长驻协议（NDJSON stdio），P2 升级 |
| getTools / getCommands | ❌ | 内置工具集固定；commands list P2 |

## 模型目录

`bigmodel/GLM-5.3`（默认）、`bigmodel/GLM-5.3-Flash`、`bigmodel/GLM-5-Turbo`；zai 通道同构（`zai/GLM-5.3` …）。模型通道决定凭据链（bigmodel/zai 两套 OAuth token 分离）与端点（`open.bigmodel.cn/api/anthropic` / `api.z.ai/api/anthropic`）。

## 功能管理（extman features）

| feature | 类型 | 默认 | 说明 |
|---|---|---|---|
| `zcode.runtimePath` | string | 空 | 指定 runtime（zcode.cjs/解压目录/AppImage） |
| `zcode.autoDownload` | boolean | 开 | 探测不到时自动下载 AppImage（约 300MB） |
| `zcode.mode` | string | build | 每轮 `--mode`：build/edit/plan/yolo |
| `zcode.model` | string | 空 | 新会话默认模型 ref；**留空自动跟随已认证的套餐通道**（读 coding-plan-cache，避免 zai 用户被 bigmodel 默认卡住） |
| `zcode.apiKeyOverride` | string | 空 | 手动提供编程套餐 API Key，跳过 OAuth 链 |

## All Sessions 接入（桌面端历史会话）

- 解析器：session-manager `lib/agents/zcode.ts`（**唯一读取实现**，id "zcode"）——读 `~/.zcode/cli/db/db.sqlite`（opencode 同构 schema：session/message/part，WAL 安全复制到 /tmp 后只读查询）；part 类型 text/reasoning/step-*/tool，reasoning 跳过、tool 降级 `🛠 名称(参数) → 输出` 文本行
- 源卡片：All Sessions 面板发现 ZCode 源（count = db 会话数），激活后历史行入索引；详情预览即 adapter.parse
- 接管（open-live）：`zcode:sess_xxx` → 后端 createSession resume + **经 `services.sessions` 服务出口回放历史**（IndexedMessage → liveHistory）→ 主窗打开即有上下文，续聊 `--resume` 同一会话（实测：接管后问“上一条运行的什么命令”→ “pwd”）
- 服务出口：session-manager entry `services.sessions.parseSession(compositeId)`（v1，进程内只读；消费方缺席 fail-silent，不得自行重实现各 agent 存储读取）

## 安全与边界

- 换 key 只与本机用户自己的凭据 + 智谱官方域名交互；key 缓存 0600 且不入 git
- 不写 `~/.zcode/cli/config.json`，不写桌面端 `v2/` 任何文件
- env 治理：spawn 仅透传 `governanceEnv("zcode")` 白名单（`ZCODE_MODEL/ZCODE_BASE_URL/...`）
- `--mode yolo` 仅在 feature 显式配置时使用；默认显式 build（`--prompt` 缺省是 yolo）

## 测试

```bash
node --test dev-repo/aiti-zcode-agent/zcode-core.test.mjs
```

25 用例：`--json` 解析 / 错误提取 / 模型 ref 与 env 组装 / 凭据解密+换 key 全链路（注入 fetch，零网络）/ 下载原子性（.part + abort 取消）/ 通道探测 / 假 AppImage 解压缓存 / handle wire 契约（换绑、resume、abort、错误帧、模型切换、种子跟随）。

> 真实 AppImage 补充实测：`--appimage-extract "resources/glm/*"` pattern 提取 3.11.2 → 47MB 产物（zcode.cjs 0.16.5）可执行，无需全量解压。
