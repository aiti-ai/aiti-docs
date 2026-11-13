---
title: 安装
icon: download
description: 安装 aiti Web（@aiti-ai/pi-web）——npm、一键脚本（macOS/Linux）、PowerShell（Windows）三种方式
tags: [guide, install]
---

# 安装

aiti Web（npm 包名 **`@aiti-ai/pi-web`**）是自托管的 AI 开发工作台：一条命令启动，浏览器即用，自带 60+ 内置扩展，无需逐个安装。

## 安装（选一种）

:::: tabs#install

@tab npm

需要 Node.js ≥ 22.19（`node --version` 检查）：

```bash
npm install -g @aiti-ai/pi-web@latest
```

安装后启动：

```bash
pi-web          # 启动服务并打开浏览器（默认 http://127.0.0.1:30141）
```

不想全局安装？`npx @aiti-ai/pi-web@latest` 直接跑（不落盘、每次拉最新）。

@tab macOS / Linux

```bash
curl -fsSL https://aiti.pw/install.sh | sh
```

**不需要 npm**：脚本从 [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) 下载预构建产物（含全部依赖，~180MB）→ 安装到 `~/.aiti/aiti-web-<版本>` → 在 `~/.local/bin` 创建 `pi-web` 启动器。下载经 sha256 校验；安装到用户目录，不 sudo、不碰系统文件，[脚本源码](https://aiti.pw/install.sh)可先审再跑。

固定版本：

```bash
curl -fsSL https://aiti.pw/install.sh | sh -s -- --ref v0.15.7
```

环境变量覆盖：`AITI_RELEASE_REPO`（镜像仓）、`AITI_INSTALL_DIR`、`AITI_BIN_DIR`：

```bash
curl -fsSL https://aiti.pw/install.sh | AITI_INSTALL_DIR=~/apps/aiti sh
```

@tab Docker

镜像发布在 Docker Hub（推 `v*` tag 随 GitHub Releases 自动构建）：

```bash
docker run -d -p 30142:30142 \
  -v aiti-data:/opt/aiti -v ~/workspace:/workspace \
  aitiai/pi-web:core
# 浏览器开 http://localhost:30142（工作目录 /workspace，数据独立于 ~/.pi）
```

- `core`（约 3GB）：fork pi-web + 全部扩展 + node/git + justget 工具市场；
- `full`（约 8.6GB）：加 GUI/语音（funasr）/Chrome/隧道等全功能；
- 版本 tag：`aitiai/pi-web:v<版本>-{core,full}`，滚动 `core`/`full`/`latest`；
- docker compose 一键与手册见仓库 [`docker/`](https://github.com/aiti-ai/aiti-ai/tree/main/docker)（compose.yaml / MANUAL.md）。

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

需要 PowerShell 5.1+（Windows 10/11 自带）。等价写法 `iwr -useb https://aiti.pw/install.ps1 | iex`。**不需要 npm**：脚本从 [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) 下载预构建 zip（含全部依赖）→ 安装到 `%LOCALAPPDATA%\aiti\aiti-web-<版本>` → 写入 `pi-web.cmd` 启动器，下载经 sha256 校验，[脚本源码](https://aiti.pw/install.ps1)。

固定版本与环境变量覆盖：

```powershell
$env:AITI_RELEASE_TAG = "v0.15.7"; irm https://aiti.pw/install.ps1 | iex
```

`AITI_RELEASE_REPO`（镜像仓）、`AITI_INSTALL_DIR` 同理可覆盖。

国内网络加速：脚本默认先走 GitHub Releases，失败自动回退 Gitee 镜像仓（[aiti-ai/aiti-ai](https://gitee.com/aiti-ai/aiti-ai/releases)，资产与校验和一致；超出 Gitee 单文件 100 MB 上限的归档以 `.part-N` 分片 + `.split` 清单发布，脚本自动拼接）。可用 `AITI_MIRROR=gitee`（或 `github`）强制指定源、`AITI_GITEE_REPO` 覆盖镜像仓。

::::

## 系统要求

| 项 | 要求 |
|---|---|
| 操作系统 | macOS / Linux / Windows |
| Node.js | ≥ 22.19.0（`node --version`） |
| 会话引擎 | [pi coding agent](https://github.com/earendil-works/pi) CLI（安装脚本会自动检测；缺失时提示 `npm install -g @earendil-works/pi-coding-agent`） |
| 模型 | 首启后在 **Models** 面板登录或填 API key |

## 启动

```bash
pi-web
```

CLI 在服务就绪后自动打开浏览器；未打开则访问 [http://127.0.0.1:30141](http://127.0.0.1:30141)。默认只监听 `127.0.0.1`，监听其它地址请用 `pi-web start -H <host>` 并自行保证传输安全（HTTPS / 可信内网）。

## 常用命令

| 命令 | 作用 |
|---|---|
| `pi-web` | 启动服务（`--help` 看全部选项） |
| `pi-web status` | 列出运行中的服务 |
| `pi-web stop [--port N]` | 停止服务 |
| `pi-web open [--port N]` | 在浏览器打开运行中的服务 |
| `pi-web update [--check]` | 更新全局安装 |

更新步骤详见[更新](./update.md)。卸载：`npm uninstall -g @aiti-ai/pi-web`。

## 脚本透明性

一键脚本没有任何隐藏动作——核心只是「查 GitHub API → 下载 release 产物 → sha256 校验 → 解压 + 创建启动器」：

| 脚本 | 直链 |
|---|---|
| install.sh | https://aiti.pw/install.sh |
| install.ps1 | https://aiti.pw/install.ps1 |

产物由 [release 工作流](https://github.com/aiti-ai/aiti-ai/blob/main/.github/workflows/release.yml)在推 `v*` tag 时自动构建：4 平台（linux-x64 / darwin-x64 / darwin-arm64 / win-x64）各自打包「npm 包内容 + 生产依赖闭包」，每平台产 sha256，install 脚本按系统/架构自动选择并校验。

升级：见[更新](./update.md)（一键脚本渠道可重跑安装器，先 `pi-web stop`）。

## 下一步

- [更新](/guide/update.md) —— 版本号方案与各安装形态的更新步骤
- [aiti-agent · 产品总览](/products/aiti-agent.md) —— 能力全景与定位
- [项目起源](/guide/origin.md) —— pi-web → aiti 的来龙去脉
- [快速开始（aiti-agent 工作台）](/guide/quick-start.md) —— 装好后的第一步上手
- [devtools 快速开始](/devtools/quick-start.md) —— 如果你想要的是「AI 操作页面」调试工具链
