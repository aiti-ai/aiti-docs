---
title: UI 环境 · 桌面/无头虚拟屏（aiti-ui-env）
icon: 🖥️
ext:
  id: aiti-ui-env
  name: UI 环境（桌面/无头虚拟屏）
  description: 后台无头服务器 UI 调试的环境分配器 —— 4 态模式裁决新启动 MCP/应用的显示环境，Xvfb+openbox+AT-SPI 虚拟屏 + VNC-on-web + RDP-on-web，Linux/Windows/macOS 三平台服务化；VNC 密码由 VNC server 自己认证（桥纯透传）
  soul: 没有显示器，也可以有舞台。
  type: dev-repo
  category: 调试
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-ui-env/ 后 reload：
    cd dev-repo/aiti-ui-env && node tools/deploy.mjs
    curl -X POST http://127.0.0.1:<端口>/api/extensions/reload
    # 服务化（虚拟屏常驻）：
    cd scripts/linux && ./setup-linux.sh && ./install-service.sh
  license: MIT
  tags: [headless, xvfb, vnc, rdp, atspi, display, virtual-desktop, noVNC, vnc-password]
---

# aiti-ui-env

> ❝ **没有显示器，也可以有舞台。** ❞

后台无头服务器（VPS/工作站）上的 UI 调试环境管理器：一套 **4 态模式开关**，
裁决「新启动的 MCP / GUI 应用」落在 **真实桌面** 还是 **Xvfb 无头虚拟屏**
（openbox WM + AT-SPI 总线 + VNC-on-web），人在浏览器里也能看到/操作虚拟桌面。

- 完整方案：内部设计文档（含模式状态机、生效链路、Linux/Windows 服务化、安装矩阵）
- 前置参照：无头 AT-SPI 实测与容器 VNC 蓝图（内部调研文档）

## 四种模式（随时切换，对新启动生效）

| # | 模式 | 语义 |
|---|---|---|
| 1 | `prefer-desktop` 优先桌面 | 桌面可用→桌面，否则虚拟屏 |
| 2 | `prefer-headless` 优先无头虚拟环境 | 虚拟屏可用→虚拟屏，否则桌面 |
| 3 | `always-desktop` 总是桌面 | 强制桌面，不可用即报错 |
| 4 | `always-headless` 总是无头虚拟环境 | 强制虚拟屏，未启动给出启动指引（可自动拉起） |

切换即时生效：已启动的进程不动，下一次 `resolve`/`run` 生效。

## 能力

- **agent 工具**（方案 M 注入；整组 feature `agentTools.enabled` **默认关**——helper 🤖 临时启用或 extman 开，也可逐项启停）：
  `ui_env_status` / `ui_env_set_mode` / `ui_env_resolve` / `ui_env_run` / `ui_env_headless`（虚拟屏启停）/ `ui_env_deps`（依赖自检/安装）/ `ui_env_vnc` / `ui_env_rdp`
- **CLI**：`scripts/ui-env`（shell 里 `eval "$(ui-env env)"` 直接给 MCP/应用启动器注入环境）
- **API**：`/api/extensions/aiti-ui-env/{status|set-mode|resolve|run|headless|vnc|vnc-session|vnc-password|vnc-clipboard|rdp|rdp-session|install-status}`
- **面板**：toolbar 🖥️ → 4 模式单选 + 双环境卡（探测结果）+ VNC 链接 + 🔑 密码 + 安装状态

## 虚拟屏栈（Linux）

```
Xvfb :99 ─ dbus/AT-SPI 总线 ─ openbox ─ x11vnc 127.0.0.1:5900 ─ vnc-bridge 127.0.0.1:6080
                                      └── 外部访问：扩展 middleware 代理
                                          /aiti-ui-env/vnc/*（含 WS 升级）→ 当前站点同端口
```

启动 env 产出：`DISPLAY=:99` + `DBUS_SESSION_BUS_ADDRESS`（AT-SPI 语义树可见，供
cua.ai 等独立驱动扩展使用）+ `XDG_RUNTIME_DIR` + GTK/Qt a11y 开关。
cua.ai **不在本扩展**——它挂本扩展的 AT-SPI 总线做独立扩展（依赖单向）。

> **VNC-on-web：多实例 + 随机端口 + URL 零凭据**：每次启动随机分配 RFB/Web 端口（避免与桌面
> gdm 或其他服务冲突），重复启动自动开新实例（注册表 `dataDir/vnc-instances.json` 持久化），
> 浏览器经当前站点 middleware（子 basePath 下 `/aiti-ui-env/vnc/*`，WS 走 `/ws/<实例id>` 路由）。
> **URL 不落目标地址**：路径段 = 实例真随机令牌（30min 轮换 + 旧令牌宽限，middleware 按首段路由到实例 webPort）；
> 认证 = 30min HttpOnly cookie（`POST /vnc-session` 下发，面板打开即建立）：复制到别处无 cookie 直接 403
> （防泄露/防跳板）；刷新/重复打开 30min 内可用。

## VNC 密码契约（2026-09-18 定稿）

密码是「用户自己知道的那个」——设置时持久化 `configDir/vnc-passwd`（1~8 位；env `UI_ENV_VNC_PASSWORD` 优先；0600），**由 VNC server 自己认证、桥不代答**（`lib/vnc-bridge.mjs` RFB 纯透传，noVNC 只弹密码框）。

- **UltraVNC 专有钥匙**：其 ini `passwd` 走专有 DES-ECB 钥匙 `E84AD660C4721AE0`——**不是**标准 VNC 的 `17526B06234E5807`（用错钥匙 server 解出乱码必败）；格式 = 8 字节密文 + 1 字节校验 hex，只写小写 `[UltraVNC] passwd`；系统版 TightVNC 才用标准钥匙
- **写前先杀 winvnc**：winvnc 退出时会把内存里的旧配置回写 ultravnc.ini 覆盖新值；ini 整体重建防残留键
- **PS 脚本必须 UTF-8 BOM**：PowerShell 5.1 无 BOM 按 ANSI 解码，中文注释字节拼出行尾反引号吞代码
- **`resetVncPassword(pw,{id})` 统一入口**（面板 🔑 / `POST /vnc-password` / `ui_env_vnc reset-password`）：Windows = 自管便携 winvnc（ini+重启）+ 系统版 UltraVNC/TightVNC 注册表（需管理员）；Linux = x11vnc `-rfbauth` / `~/.vnc/passwd`（storepasswd→vncpasswd→openssl legacy 三级兜底）；**macOS 屏幕共享用系统账号密码不可改**——`SysVncEntry.passwordResettable=false` + `passwordNote` 给出去处，UI 按标记显隐

## RDP-on-web

webRDP 经 rdp-bridge 把 RDP 协议 WS 透传进浏览器（agent 工具 `ui_env_rdp` + feature `behavior.rdp`）：`POST rdp {start{host,port 支持 host:port/rdp://}|stop|status|list|sys-scan|sys-open{port}|sys-stop}`（sys-open/sys-stop 桥接系统 xrdp）；middleware `/aiti-ui-env/rdp/<token>/*`（30min cookie `ui_env_rdp`）；`vnc-clipboard` 直读/直写剪贴板。

## macOS

桌面 = Aqua 控制会话（WindowServer + /dev/console 属主 + launchd 上下文证据链）；「无头」= 诚实降级——屏幕共享 VNC（:5900）就绪 + vnc-bridge/noVNC 浏览器查看（免密 sudo 自动 load -w），认证 = mac 账号密码；无 Xvfb 等价物。`scripts/macos/setup-macos.sh`。

## 安装

```bash
# Linux：组件安装（apt + justget 兜底）+ 服务化（systemd user + linger 保活）
cd scripts/linux && ./setup-linux.sh && ./install-service.sh
# 浏览器看虚拟桌面（经站点 middleware，无新端口）
open https://<站点地址>/<basePath>/aiti-ui-env/vnc/vnc.html  # 面板点「打开查看」后新标签直访（URL 零凭据，30min cookie 会话）

# Windows（管理员）：虚拟显示驱动 + 自动登录 + TightVNC + noVNC
.\scripts\win\setup-windows.ps1
.\scripts\win\install-service.ps1 -NSSM   # 或 -ScheduledTask
```

> 公网暴露：无新端口——5900/6080 只回环，浏览器经当前站点 middleware（`/aiti-ui-env/vnc/*`）
> 直访（HTTP+WS 代理；认证=30min HttpOnly cookie，URL 零凭据，无 cookie 一律 403）。

## AI 帮助点（ai.helpers）

| 帮助点 | 作用 | 落地 |
|---|---|---|
| `ui-env-setup` AI 帮我选显示模式 | 描述运行场景 → AI 推荐显示模式（prefer-headless 等） | `POST set-mode`（mapping mode） |

声明在 `index.ts` 的 `ai` 段（pi skills 标准：`skills/index.json` + `skills/ui-env-setup/SKILL.md` frontmatter `action.type=api` → `POST set-mode` mapping），由 ai-helper 主动聚合。

## 文档

- 方案文档：内部设计文档