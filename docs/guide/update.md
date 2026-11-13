---
title: 更新
icon: arrows-rotate
description: 更新 aiti Web（@aiti-ai/pi-web）——版本号方案、各安装形态的更新步骤（pi-web update / 安装器 / Docker / 源码）
tags: [guide, update]
---

# 更新

aiti Web 的更新统一遵循一个节奏：**停止服务 → 更新 → 启动服务**。具体命令取决于安装形态，见下文。

<LatestVersion />

## 版本号方案

版本号形如 `0.16.0` 或 `0.16.0-aiti.1`（Debian/Ubuntu 风格）：

| 形态 | 含义 |
|---|---|
| `X.Y.Z` | 上游核心版本（pi-web 基线） |
| `X.Y.Z-aiti.N` | 基于上游 `X.Y.Z` 的 aiti 发行构建；同一基线重构建递增 `N`（`-aiti.2`、`-aiti.3` …） |

排序遵循 dpkg 语义而非严格 semver：上游 `X.Y.Z` 主导比较，fork 后缀只在同基线内分先后——`0.16.0-aiti.1` > `0.16.0`（严格 semver 会把后缀当预发布版排到前面，这里不是）。git tag 为 `v<版本>`，npm `latest` dist-tag 同名。

历史版本与变更日志见 [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases)。

## 检查更新

```bash
pi-web update --check   # 只查询最新版本，不执行更新
```

工作台新会话页也会在有新版本时自动提示。

## 更新步骤（按安装形态）

:::: tabs#update

@tab npm 全局包

```bash
pi-web stop
pi-web update
pi-web start
```

`pi-web update` 等效于 `npm install -g @aiti-ai/pi-web@latest --allow-scripts`。

@tab release 归档（macOS / Linux / Windows 一键脚本）

```bash
pi-web stop
pi-web update
pi-web
```

`pi-web update` 从 GitHub Releases 下载新版本归档并校验 sha256（Gitee 镜像自动兜底），更新后自动切换版本目录。

也可以重跑安装器（先 `pi-web stop`）：

```bash
curl -fsSL https://aiti.pw/install.sh | sh        # macOS / Linux
irm https://aiti.pw/install.ps1 | iex             # Windows (PowerShell)
```

@tab npx

不落盘、每次拉最新——直接运行新版本即可：

```bash
npx @aiti-ai/pi-web@latest
```

@tab Docker

```bash
docker pull aitiai/pi-web:latest
# 然后按原启动方式重建容器
```

版本 tag 形如 `aitiai/pi-web:v<版本>-{core,full}`，滚动 tag `core` / `full` / `latest`。

@tab 源码部署

```bash
git pull
# 然后按惯常方式重新构建并重启（dev 模式改码即生效）
```

@tab 自定义部署

按同样的节奏执行：

```bash
pi-web stop        # 停止服务
pi-web update      # 尝试内置更新（npm / release 渠道均适用）
pi-web start       # 重启服务
```

若 `pi-web update` 不适用于你的部署方式（如自维护的包管理渠道），请按所用部署方式的文档手动更新包本体，然后重启服务。

::::

## 进程管理器托管的服务

若服务由 systemd / launchd 等进程管理器托管，停止与启动请用管理器命令（如 `systemctl restart <unit>`）——**更新本身仍是 `pi-web update`**，管理器只需在更新前后完成启停。

## 相关页面

- [安装](install.md) —— 首次安装与三种安装形态
- [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) —— 历史版本与变更日志
