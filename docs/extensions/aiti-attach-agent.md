---
title: 附着会话后端（aiti-attach-agent）
icon: 🔌
ext:
  id: aiti-attach-agent
  name: 附着会话后端
  description: Socket 附着已运行 agent 进程 —— 连接 pi TUI bridge；支持环境变量全自动（PI_WEB_BRIDGE_AUTO=1 任何 CLI 会话自动上桥）
  soul: 不抢方向盘——agent 已经在跑，附着上去看就好。
  type: dev-repo
  category: 多 agent 后端
  version: 0.1.0
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
列表带 `tui-bridge` 标，实时流式旁观 + 双向 IO（可在 web 里发消息/steer/切换模型）。

| env | 谁设置 | 效果 |
|---|---|---|
| `PI_WEB_BRIDGE_AUTO=1` | 用户 shell（CLI 全自动）或 pi-web 宿主（子代理注入） | 会话起动自动起桥 |
| `PI_WEB_BRIDGE_BASE=<url>` | 用户 shell（可选） | 指向已运行 pi-web：`aiti_*` 工具与该实例托管桥合流；不设则 attach 照常（走注册表），aiti_* 走独立桥 |
| `PI_WEB_BRIDGE_PORT` / `PI_WEB_BRIDGE_LANG` | 可选 | 桥端口推导 / 提示文案语言 |
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
