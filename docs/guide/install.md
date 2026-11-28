---
title: 安装
icon: download
description: 安装 aiti Web（@aiti-ai/pi-web）——npm、一键脚本（macOS/Linux）、PowerShell（Windows）、Docker，以及源码运行（开发者）
tags: [guide, install]
---

# 安装

aiti Web（npm 包名 **`@aiti-ai/pi-web`**）是自托管的 AI 开发工作台：一条命令启动，浏览器即用，自带 63+ 内置扩展，无需逐个安装。

## 安装（选一种）

:::: tabs#install

@tab npm

需要 Node.js ≥ 22.19（`node --version` 检查）：

```bash
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web
```

> npm ≥11.16 要求显式批准安装脚本：`--allow-scripts` 必须带 `=包名列表`，并写在包 spec 之后。裸写 `--allow-scripts` 在 npm 12 会拒绝全部安装脚本，导致安装不完整；旧版 npm 忽略该参数，无副作用。

默认使用本机 npm 配置的源（`npm config get registry` 查看）。需要临时换源时，在命令末尾追加 `--registry <源地址>`：

```bash
# npm 官方源——源配置异常时显式指定，排查问题最稳
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://registry.npmjs.org

# 国内镜像站（按自测速度选一个，以下均为完整 npm 镜像）
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://registry.npmmirror.com
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://mirrors.huaweicloud.com/repository/npm/
npm install -g @aiti-ai/pi-web@latest --allow-scripts=@aiti-ai/pi-web --registry https://mirrors.cloud.tencent.com/npm/
```

`--registry` 只对本次命令生效，不改动全局 `.npmrc`；要长期生效用 `npm config set registry <地址>`。镜像站同步官方发布通常有几分钟到数十分钟延迟，刚发布的版本可能还没同步，取不到时请改用官方源。

安装后启动：

```bash
pi-web          # 启动服务并打开浏览器（默认 http://127.0.0.1:30141）
```

不想全局安装？`npx --allow-scripts=@aiti-ai/pi-web @aiti-ai/pi-web@latest` 直接跑（不落盘、每次拉最新，同样需要上面的允许脚本参数，`--registry` 同理可加）。

@tab macOS / Linux

```bash
curl -fsSL https://aiti.pw/install.sh | sh
```

**不需要 npm**：脚本从 [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) 下载预构建产物（含全部依赖，~180MB）→ 安装到 `~/.aiti/aiti-web-<版本>` → 在 `~/.local/bin` 创建 `pi-web` 启动器。下载经 sha256 校验；安装到用户目录，不 sudo、不碰系统文件，[脚本源码](https://aiti.pw/install.sh)可先审再跑。

固定版本：

```bash
curl -fsSL https://aiti.pw/install.sh | sh -s -- --ref v0.18.0-aiti.3
```

环境变量覆盖：`AITI_RELEASE_REPO`（镜像仓）、`AITI_INSTALL_DIR`、`AITI_BIN_DIR`：

```bash
curl -fsSL https://aiti.pw/install.sh | AITI_INSTALL_DIR=~/apps/aiti sh
```

@tab Docker

镜像发布在 Docker Hub（随 GitHub Releases 同版本发布），并逐 tag 同步一份到阿里云 ACR（国内加速，已公开）；另有 GHCR 源 [`ghcr.io/aiti-ai/aiti-ai`](https://github.com/aiti-ai/aiti-ai/pkgs/container/aiti-ai)（与 Docker Hub 同版本同内容，core/full 双变体，tag 完全一致）：

```bash
docker run -d --name aiti --init -p 30142:30142 \
  -v aiti_data:/opt/aiti/data -v aiti_agent:/opt/aiti/agent \
  -v ~/workspace:/workspace \
  aitiai/pi-web:core
# 浏览器开 http://localhost:30142（工作目录 /workspace，数据独立于 ~/.pi）
```

- `core`（约 2.1GB）：fork pi-web + 全部扩展 + node/git + justget 工具市场；
- `full`（约 7.8GB）：加 GUI/语音（funasr）/Chrome/隧道等全功能（需 ≥8GB 内存）；
- 版本 tag：`aitiai/pi-web:v<版本>-{core,full}`，滚动 `core`/`full`/`latest`；
- GHCR 源：`ghcr.io/aiti-ai/aiti-ai`——与 Docker Hub 同版本同内容（core/full 双变体），tag 完全一致（如 `v0.18.0-aiti.3-core` / `core` / `latest`）；
- ⚠ 卷只挂 `/opt/aiti` 子路径，勿挂整个 `/opt/aiti` 根（挂根会让镜像升级后扩展永不更新）；
- 三个镜像渠道（Docker Hub / ACR / GHCR）当前均为 linux/amd64 单架构；ARM 主机加 `--platform linux/amd64` 模拟运行（性能有折损）；
- 国内拉取慢？镜像名换 `registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web:core`（阿里云 ACR，tag 与 Docker Hub 一致）；
- 完整指南（端口/环境变量/反向代理/升级运维/compose）见 [Docker 部署](./docker.md)；compose 一键与手册见仓库 [`docker/`](https://github.com/aiti-ai/aiti-ai/tree/main/docker)。

@tab Windows

```powershell
irm https://aiti.pw/install.ps1 | iex
```

需要 PowerShell 5.1+（Windows 10/11 自带）。等价写法 `iwr -useb https://aiti.pw/install.ps1 | iex`。**不需要 npm**：脚本从 [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) 下载预构建 zip（含全部依赖）→ 安装到 `%LOCALAPPDATA%\aiti\aiti-web-<版本>` → 写入 `pi-web.cmd` 启动器，下载经 sha256 校验，[脚本源码](https://aiti.pw/install.ps1)。

固定版本与环境变量覆盖：

```powershell
$env:AITI_RELEASE_TAG = "v0.18.0-aiti.3"; irm https://aiti.pw/install.ps1 | iex
```

`AITI_RELEASE_REPO`（镜像仓）、`AITI_INSTALL_DIR` 同理可覆盖。

国内网络加速：脚本默认先走 GitHub Releases，失败自动回退 Gitee 镜像仓（[aiti-ai/aiti-ai](https://gitee.com/aiti-ai/aiti-ai/releases)，资产与校验和一致；超出 Gitee 单文件 100 MB 上限的归档以 `.part-N` 分片 + `.split` 清单发布，脚本自动拼接）。可用 `AITI_MIRROR=gitee`（或 `github`）强制指定源、`AITI_GITEE_REPO` 覆盖镜像仓。

@tab 源码运行

适合开发者：克隆仓库后一条命令跑起来，扩展原位加载、改完即生效（不需要部署）。

```bash
git clone https://github.com/aiti-ai/aiti-ai.git
cd aiti-ai
npm run local            # 开发模式（http://127.0.0.1:30141）
npm run local -- --prod  # 编译运行（next build + next start）
```

详见 [本地开发与一键启动](/guide/local-dev.md)。

::::

## 系统要求

| 项 | 要求 |
|---|---|
| 操作系统 | macOS / Linux / Windows |
| Node.js | ≥ 22.19.0（`node --version`） |
| 会话引擎 | 随包内置，开箱即用（默认本地引擎经 SDK 进程内运行，无需单独安装）。可选装全局 [pi coding agent](https://github.com/earendil-works/pi) CLI——仅在需要 TUI、attach/spawn 后端或终端共用配置时安装（`npm install -g @earendil-works/pi-coding-agent`） |
| 模型 | 首启后在 **Models** 面板登录或填 API key |

## 启动

```bash
pi-web
```

CLI 在服务就绪后自动打开浏览器；未打开则访问 [http://127.0.0.1:30141](http://127.0.0.1:30141)。默认只监听 `127.0.0.1`，监听其它地址请用 `pi-web start -H <host>` 并自行保证传输安全（HTTPS / 可信内网）。

## 内置 pi 插件（自动预配）

aiti Web 启动时自动把**第一方 pi 插件**预配进你的 pi 设置（经官方包管理器安装，TUI / Web / CLI 会话共用）：

| 插件 | 作用 |
|---|---|
| `@aiti-ai/pi-models-combo` | 模型列表治理 + 多 key 轮转防 429 + 模型聚合 |
| `@aiti-ai/pi-secret-mask` | **AI 脱敏**——贴进 prompt 的 token / 密钥发送模型前自动替换占位符，工具执行时自动还原（**随手贴，不泄密** · *Paste-safe by default.*） |
| `@aiti-ai/pi-git-trace` | AI 变更带外追踪与回滚 |
| `@aiti-ai/pi-web-bridge` | pi-web 桥接 |

细节：声明先行（安装失败时声明保留，pi 自身启动对账自动重试，离线自愈）；维护者机器手工管理本地副本、不经此流程；`AITI_SKIP_PI_PLUGINS=1` 可整体跳过。

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
