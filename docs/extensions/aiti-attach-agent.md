---
title: 附着会话后端（aiti-attach-agent）
icon: 🔌
ext:
  id: aiti-attach-agent
  name: 附着会话后端
  description: Socket 附着已运行 agent 进程 —— 连接 pi TUI bridge；支持环境变量全自动（PI_WEB_BRIDGE_AUTO=1 任何 CLI 会话自动上桥）；followUp 排队回显 + 图片附件透传 + 空闲超时退出
  soul: 不抢方向盘——agent 已经在跑，附着上去看就好。
  type: dev-repo
  category: 多 agent 后端
  version: "0.1.6"
  status: experimental
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-attach-agent/ 后 reload
  license: MIT
  tags: [attach, socket, tui, session, multi-agent]
---

# aiti-attach-agent

> ❝ **不抢方向盘——agent 已经在跑，附着上去看就好。** ❞

Socket 附着型会话后端：连接一个已在运行的 agent 进程（pi TUI bridge），不 spawn 新进程。适合「终端里跑着的 pi」直接挂进 All Sessions 面板旁观/交互。

## 机制

- 「一切后端皆扩展」原则下的第一个真实后端：核心只剩抽象层，本扩展经 `ctx.sessionProviders.register()` 注册 `attach` 后端
- 接入方式：pi TUI 侧桥扩展 `/web` 命令 spawn pi-web（detached）时传 `--socket <path>`，即完成附着
- 场景：用户在终端跑 pi TUI → 输入 `/web` → 浏览器工作台直接接管同一会话

## 自动桥：任何 CLI 会话免命令实时上 web（PI_WEB_BRIDGE_AUTO=1）

不想每次手敲 `/web`？在 shell 配置（`~/.bashrc` / `~/.zshrc`）里导出（本机 2026-08-30 已启用）：

```bash
export PI_WEB_BRIDGE_AUTO=1                              # 任何 pi CLI 会话起动即自动起桥
# 可选：aiti_* 工具改走指定 pi-web 实例的托管桥
# （不设 = 走常驻独立桥 127.0.0.1:8777；attach 不受影响，按注册表走）
# export PI_WEB_BRIDGE_BASE=https://pi.example.com/dev    # dev 实例
# export PI_WEB_BRIDGE_BASE=https://pi.example.com        # prod 实例
```

之后每个终端 `pi` 会话（含 `-c` / `--resume` 恢复）在 `session_start` 时自动执行等价
`/web --attach --no-spawn --no-open`：起 socket rpc 桥 + 写 `~/.pi/agent/bridge-registry.json`，
不 spawn 不开浏览器。pi-web（dev/prod 任一实例）打开该会话即自动 attach——All Sessions
列表带 `tui-bridge` 标，实时流式旁观 + 双向 IO（可在 web 里发消息/steer/follow_up 排队/带图/切换模型）。

**排队回显与附件（2026-10）**：pi 的 `queue_update` 不进扩展事件通道——桥自维护文本镜像**合成广播**：入队 = 桥命令忙时（prompt/steer/follow_up）+ TUI 终端本地入队（`input` 事件感知：回车=steer、Alt+Enter=followUp）；出队 = `message_start(user)` 同序弹匹配文本；`get_state` 见空队而镜像非空即自愈清空。`get_state` 携带 `steering/followUp` 文本 → attach handle 补只读 `queueManage(list)`（排队面板刷新/重连恢复，变更动作 fail-loud）。prompt/steer/follow_up **透传图片附件**（此前排队/插队带图静默丢）。

**空闲超时退出（2026-09-15）**：CLI 全自动桥的 pi TUI 会话空闲超时后自动 `ctx.shutdown()` 退出（清挂起进程 + 桥 socket + 连接器重试）——同一 env 与 pi-web inprocess 会话对齐；到点有页面 attach 或模型在跑则续期；手动 `/web` 与 headless 子代理不自动退。

| env | 谁设置 | 效果 |
|---|---|---|
| `PI_WEB_BRIDGE_AUTO=1` | 用户 shell（CLI 全自动）或 pi-web 宿主（子代理注入） | 会话起动自动起桥 |
| `PI_WEB_BRIDGE_BASE=<url>` | 用户 shell（可选） | 指向已运行 pi-web：`aiti_*` 工具与该实例托管桥合流；不设则 attach 照常（走注册表），aiti_* 走独立桥 |
| `PI_WEB_BRIDGE_PORT` / `PI_WEB_BRIDGE_LANG` | 可选 | 桥端口推导 / 提示文案语言 |
| `PI_WEB_IDLE_TIMEOUT_MS` | 用户 shell（可选） | CLI 自动桥空闲超时退出（默认 10 分钟，0 禁用；到点有页面 attach / 模型在跑则续期；手动 /web 与子代理不自动退；非法值回退默认） |
| `PI_WEB_CHILD_MARKER` | pi-web 自动 | 宿主印记：有它 + 非子代理 = pi-web 内嵌会话，**不**自动桥（本来就在 web 里）|

边界与行为细则：

- pi-web 内嵌会话与其子进程永不自动桥（`PI_WEB_CHILD_MARKER` 守卫）——它们本来就在 web 里；内嵌多会话同 pid 会撞同名 socket，此守卫兼防冲突；
- **进程内切会话（`/new`、`/resume`）registry 跟随重登记**（socket 复用），web 打开切换后的会话仍走 attach；
- 手动权优先：`/web off` 只关当下，再 `/web` 可重启（重复 `/web` 照常进管理菜单）；起新会话会重新自动起桥；
- socket 权限 `600`（仅属主可连）；Windows 命名管道由 ACL 隔离；
- pi 退出 socket 断开、注册表自清；桥仅在进程存活期有效；
- SIGTERM/kill 硬杀会跳过清理留下死条目——自愈：下次任意读写 registry 按死 pid 清扫，无需人工干预；
- IM（cc-connect 等）拉起的 pi 同属「CLI 会话」，想让它们也上桥需在其 service 环境里加同样的 env。

### 排查

| 现象 | 检查 |
|---|---|
| 新终端起 pi 没自动上桥 | `echo $PI_WEB_BRIDGE_AUTO` 是否 =1（改 bashrc 后要 `source` 或重开终端）；启动日志有无 `[pi-web-bridge]` 行 |
| 日志出现「跳过 /web 注册（pi-web 内嵌进程…）」 | 该进程继承了 pi-web 宿主 env（如从 pi-web 会话里 spawn 的 shell）——换干净终端即可 |
| web All Sessions 里看不到会话 | 会话文件未落盘前（首条消息前）本就不在列表；或 registry 为空（`cat ~/.pi/agent/bridge-registry.json`，进程退出即清空属正常） |
| `aiti_*` 工具连的不是想要的桥 | 未设 `PI_WEB_BRIDGE_BASE` 时走独立桥 8777；要合流某个 pi-web 实例就设它的 base（见上） |
| registry 里有死条目（socket 指向已退出 pid） | 正常：硬杀（SIGTERM/kill）跳过清理所致，下次任意读写 registry 自动清扫 |

### 已修复：首次打开连不上（竞态窗口双胞胎，2026-08-30）

**现象**：TUI 刚起动（或浏览器 SSE 断线重连落在 TUI 重启空档）就点开该会话，
「第一次连不上」——web 里发消息无流式回显，切到别的会话再切回来才通。

**根因**（实测复现）：桥登记落在 `session_start` 后几毫秒，但会话行早已在
pi-web 列表里（`pi -c` 恢复旧会话场景）——在这个**竞态窗口**内点开，SSE 路由
`attachIfBridged` miss（registry 还没写）→ 兜底 `startRpcSession` 抢先起了一个
**本地 runtime**（「双胞胎」，与 TUI 双写同一 jsonl）。桥随后登记完成，
split-brain：POST prompt 走桥（attach 优先）、GET 状态/SSE 仍偏向本地双胞胎
（`getRpcSession` 优先）——prompt 到了 TUI、流式却绑在双胞胎上，表现为「连不上」；
切走再切回来 = SSE 重连时 attach 优先命中桥，所以「就通了」。残留一个僵尸双胞胎。

**修复**（pi-web 三处）：

1. `lib/session/index.ts` `attachIfBridged`：attach 成功即 `shutdownStrayLocalRuntime`——
   关掉同会话的竞态窗口本地 wrapper（单写者恢复；日志 `bridge claimed … shutting down
   stray local runtime`）；
2. `app/api/agent/[id]/route.ts` GET：**socket 优先**（`resolveAttachBySessionId` 压过
   `getRpcSession`）——状态对账 tick（前台 15s；切前台/网络恢复即时）内自愈回桥，无需刷新页面；
3. `app/api/sessions/[id]/context/route.ts`：桥认领时上下文也走桥 `get_messages`
   （磁盘文件可能落后 TUI 内存态，进行中的 turn 未 flush）；
4. `app/api/sessions/[id]/auto-name/route.ts`：桥认领时自动命名降级跳过（窗口期
   原本会对双胞胎跑命名 LLM turn 双写文件）；
5. `dev-repo/aiti-attach-agent/bridge-registry.ts`：registry 改 tmp+rename 原子写——
   原直写非原子，并发读者（dev/prod 两 pi-web + 多 TUI 共享同一份文件）读到半截
   JSON 会当空表，后续任意一次 read-modify-write 就把全部条目抹掉（attach 全体失效）。
   已同步安装副本 `~/.pi/agent/extensions/pi-web-bridge/bridge-registry.ts`（对新起的
   TUI 进程生效）。

残留边界：竞态窗口内建立的那条 SSE 连接仍绑在已死双胞胎上（心跳保活不重连），
下一次自然重挂载（切会话/刷新）即绑回桥——其余路由均已自愈。

### 深审记录（2026-08-30 第二轮）

| 项 | 结论 |
|---|---|
| queue-recovery / PATCH rename / DELETE / export | 只读或已有 provider 闸/attach-first ✓ 不需改 |
| set_tools（`setRpcSessionTools`）| 窗口期会在闸门前 `appendSessionToolSelection` 直写文件一行（预存在，窄；已登记待办非本轮修） |
| DELETE 窗口 | 窗口期内删 TUI 正要认领的文件理论上可能（需手动确认 + 秒级窗口）——接受 |
| registry 跨进程 read-modify-write | 原子写消除了半截 JSON 损坏面；多进程并发改写丢更新仍可能（无锁）——写入频率极低，接受；彻底解需文件锁 |
| registry 条目丢失后 TUI 不重登记 | 已知限制：条目只在 session_start/切会话时写；丢失后该会话 attach 失效到 TUI 切会话/重启（自愈清扫只删不补） |
| 探针误杀活条目 | probe 走内核 backlog，TUI 仅“忙”不会失败（需真卡死/积压 511）——实践不可达 |
| 回归测试 | 未加单测（twin 清理需 mock rpc-manager 动态导入，收益低）；已用 mock 桥 E2E 全链路验证 + 既有 providers/handle-adapter 测试通过 |
