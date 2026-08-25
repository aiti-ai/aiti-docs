---
title: aiti-ui-env
icon: 🖥️
ext:
  id: aiti-ui-env
  name: UI 环境（桌面/无头虚拟屏）
  description: 后台无头服务器 UI 调试的环境分配器 —— 4 态模式（优先桌面/优先无头/总是桌面/总是无头）裁决新启动 MCP/应用的显示环境，Xvfb+openbox+AT-SPI 虚拟屏 + VNC-on-web 浏览器查看，Linux/Windows 双平台服务化
  soul: 没有显示器，也可以有舞台。
  type: dev-repo
  category: 调试
  version: 0.1.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 方案：docs/aiti-ui-env-extension-plan.md
    # 部署到 ~/.pi/web/extensions/aiti-ui-env/ 后 reload：
    cd dev-repo/dev-repo/aiti-ui-env && node tools/deploy.mjs
    curl -X POST http://127.0.0.1:30142/dev/api/extensions/reload
    # 服务化（虚拟屏常驻）：
    cd scripts/linux && ./setup-linux.sh && ./install-service.sh
  license: MIT
  tags: [headless, xvfb, vnc, atspi, display, virtual-desktop, noVNC]
---

# aiti-ui-env

> ❝ **没有显示器，也可以有舞台。** ❞

后台无头服务器（VPS/工作站）上的 UI 调试环境管理器：一套 **4 态模式开关**，
裁决「新启动的 MCP / GUI 应用」落在 **真实桌面** 还是 **Xvfb 无头虚拟屏**
（openbox WM + AT-SPI 总线 + VNC-on-web），人在浏览器里也能看到/操作虚拟桌面。

- 完整方案：`docs/aiti-ui-env-extension-plan.md`（含模式状态机、生效链路、Linux/Windows 服务化、justget 安装矩阵）
- 前置参照：无头 AT-SPI 实测（`docs/archae-reader-cua-driver-verify.md`）、容器 VNC 蓝图（`docs/roadmap/remote-debug-workspace-2026-08.md`）

## 四种模式（随时切换，对新启动生效）

| # | 模式 | 语义 |
|---|---|---|
| 1 | `prefer-desktop` 优先桌面 | 桌面可用→桌面，否则虚拟屏 |
| 2 | `prefer-headless` 优先无头虚拟环境 | 虚拟屏可用→虚拟屏，否则桌面 |
| 3 | `always-desktop` 总是桌面 | 强制桌面，不可用即报错 |
| 4 | `always-headless` 总是无头虚拟环境 | 强制虚拟屏，未启动给出启动指引（可自动拉起） |

切换即时生效：已启动的进程不动，下一次 `resolve`/`run` 生效。

## 能力

- **agent 工具**（方案 M 注入，可被 extman 逐项启停）：
  `ui_env_status` / `ui_env_set_mode` / `ui_env_resolve` / `ui_env_run` / `ui_env_vnc`
- **CLI**：`scripts/ui-env`（shell 里 `eval "$(ui-env env)"` 直接给 MCP/应用启动器注入环境）
- **API**：`/api/extensions/aiti-ui-env/{status|set-mode|resolve|run|vnc|install-status}`
- **面板**：toolbar 🖥️ → 4 模式单选 + 双环境卡（探测结果）+ VNC 链接 + 安装状态

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
> 认证=30min HttpOnly cookie（`POST /vnc-session` 下发，面板打开即建立）：URL 无任何 token/nonce，
> 复制到别处无 cookie 直接 403（防泄露/防跳板）；刷新/重复打开 30min 内可用。

## 安装

```bash
# Linux：组件安装（apt + justget 兜底）+ 服务化（systemd user + linger 保活）
cd scripts/linux && ./setup-linux.sh && ./install-service.sh
# 浏览器看虚拟桌面（经站点 middleware，无新端口）
open https://pi.example.com/dev/aiti-ui-env/vnc/vnc.html  # 面板点「打开查看」后新标签直访（URL 零凭据，30min cookie 会话）

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

声明在 `index.ts` 的 `ai.helpers`，由 ai-helper 主动聚合（无需注册）。

## 文档

- [方案文档](/devtools/aiti-ui-env-extension-plan.md)