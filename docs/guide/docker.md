---
title: Docker 部署（官方镜像）
icon: container
description: 基于官方镜像 aitiai/pi-web 的 docker run 部署指南——core/full 选择、卷持久化、端口与环境变量、反向代理、升级与运维
tags: [guide, docker, deploy, pi-web]
---

# Docker 部署（官方镜像）

不想装 Node/npm？直接用官方镜像把整套工作台跑起来：一个容器装下 **pi-web + 全部内置扩展 + pi 引擎 + Node/git + aiti-bridge**；`full` 版再加网页桌面（noVNC、Chrome/CDP）、语音与隧道。镜像发布在 [Docker Hub](https://hub.docker.com/r/aitiai/pi-web)（推 `v*` tag 随 GitHub Releases 自动构建），并逐 tag 同步一份到阿里云 ACR（国内拉取加速）：`registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web`。

## 1. 快速开始（docker run）

```bash
docker run -d --name aiti --init \
  -p 30142:30142 \
  -v aiti_data:/opt/aiti/data \
  -v aiti_agent:/opt/aiti/agent \
  -v ~/my-project:/workspace \
  -e PUID=$(id -u) -e PGID=$(id -g) \
  -e TZ=Asia/Shanghai \
  aitiai/pi-web:core
# 浏览器打开 http://localhost:30142
```

> **国内拉取慢？** 把镜像名换成阿里云仓即可，tag 与 Docker Hub 完全一致：
> `registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web:core`（ACR 镜像随每次发布自动同步）。

- 两个命名卷携带全部状态：`aiti_data`（扩展运行时数据）与 `aiti_agent`（pi 会话 / 模型配置）——**升级镜像不丢数据**；
- `-v ~/my-project:/workspace` 挂载宿主项目目录，容器以它为启动默认工作区；
- `PUID`/`PGID` 与宿主用户对齐，挂载目录读写不踩权限；
- 首次启动：侧边栏「选择项目 → 使用默认目录」（即 /workspace）→「新建会话」→ 底部「设置」配置模型密钥 → 开始对话。

## 2. 选择镜像

| | `core` | `full` |
|---|---|---|
| 体积 | ~2.1GB | ~7.8GB |
| pi-web + 内置扩展 + pi 引擎 + justget + bridge | ✅ | ✅ |
| GUI（Xvfb/VNC/noVNC/Chrome+CDP） | — | ✅ |
| ASR 语音识别（funasr，:8767） | — | ✅ |
| TTS edge-tts / 网页终端 ttyd（:7681） | — | ✅ |
| 隧道 cloudflared/ngrok/frpc | — | ✅ |
| 内存下限 | 1GB | **8GB**（full + 语音；2–6GB 会 OOM） |

- 版本 tag：`aitiai/pi-web:v<版本>-{core,full}`；滚动 tag：`core` / `full` / `latest`；
- 阿里云 ACR 同 tag 镜像：`registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web:v<版本>-{core,full}`（与 Docker Hub 逐 tag 同步）；
- `full` 的额外阶段由 `AITI_PHASES` 控制（见 §5）。

## 3. 数据持久化（卷）

| 挂载 | 内容 | 建议 |
|---|---|---|
| `/opt/aiti/data` | 扩展运行时数据（配置仓 / 索引 / 缓存） | 命名卷 |
| `/opt/aiti/agent` | pi 会话 JSONL / models.json / mcp-cache | 命名卷（**命脉——务必持久化**） |
| `/workspace` | 工作区（启动默认 cwd；pi 会话按项目分组） | 绑定挂载宿主项目目录 |
| `/home/aiti/.pi` | **可选**：继承宿主 pi 配置 | 首次运行采纳 auth.json/models.json；settings.json 与内置默认合并（用户键优先） |
| `/opt/aiti/extensions` | 扩展代码 | **不要挂载**——归镜像层所有；升级随镜像刷新 |

> ⚠ **只挂载 `/opt/aiti` 的子路径，永远不要挂载整个 `/opt/aiti` 根**：命名卷只在首次使用时填充，之后旧卷会遮蔽新镜像——挂根意味着镜像升级后扩展永不更新。

## 4. 端口

| 端口 | 服务 | 默认 |
|---|---|---|
| 30142 | pi-web 主界面 | 必须映射 |
| 8777 | aiti-bridge（页面注入 / MCP / agent REST） | 使用外部 agent / 注入时映射 |
| 8767 | ASR WS/HTTP（full） | full 默认开启；按需映射 |
| 6080 | noVNC 网页桌面（full） | 仅回环，按需映射 |
| 5900 | VNC（full） | 仅回环 |
| 9222 | Chrome CDP（full） | 仅回环 |
| 7681 | ttyd 网页终端（full） | 仅回环 |

`AITI_PIWEB_PORT` / `AITI_BRIDGE_PORT` 可改容器侧端口（少用）。GUI/CDP/RDP/隧道端口默认不映射（安全默认），需要时再加 `-p`。

## 5. 常用环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `AITI_PHASES` | `piweb,bridge` | 逗号分隔：`piweb,bridge,gui,asr,term`。gui/asr/term 仅在 full 实现（core 记日志跳过） |
| `PUID`/`PGID` | 1000 | 运行 uid/gid（与宿主用户对齐）。⚠ 不要用 `UID`（bash 只读内建） |
| `TZ` | UTC | 如 `Asia/Shanghai` |
| `AITI_MODE` | auto | `core`/`full`/`auto`（按镜像层标记）；在 full 镜像上设 core 会降级为基础阶段 |
| `AITI_DEV` | 0 | `1` = 挂载源码并跑 `next dev` 热重载（开发模式） |
| `AITI_GUI_SIZE` | 1920x1080x24 | 虚拟显示分辨率（full） |

### 域名 / 反向代理

| 变量 | 说明 |
|---|---|
| `PI_WEB_ALLOWED_HOSTS` | 可信主机名（逗号分隔）——代理域名**必须**列入否则 403 |
| `PI_WEB_BASE_DOMAIN` | service-tunnels 暴露 URL 的构建域（`host:port`） |
| `AITI_BASE_URL` | aiti-devtools 注入页 / MCP 的公网基础 URL（设为你的代理 URL） |
| `API_ALLOW_ORIGINS` | 桥 CORS（`*` 或显式来源；代理域与源站域不同时需要） |
| `PI_WEB_EXTRA_EXTENSIONS_DIRS` | 额外扩展目录（容器内路径，逗号分隔；配合 `-v` 挂载用户扩展） |

反向代理示例（域名 → `127.0.0.1:30144`，桥 → `18777`）：

```bash
docker run -d --name aiti --init \
  -p 127.0.0.1:30144:30142 -p 127.0.0.1:18777:8777 \
  -e PI_WEB_ALLOWED_HOSTS="pi.example.com,aiti.pi.example.com" \
  -e PI_WEB_BASE_DOMAIN="pi.example.com:8443" \
  -e AITI_BASE_URL="https://aiti.pi.example.com:8443" \
  -e API_ALLOW_ORIGINS="*" \
  -v aiti_data:/opt/aiti/data -v aiti_agent:/opt/aiti/agent \
  aitiai/pi-web:core
```

在 `*.pi.example.com` 通配符 + 通配符证书下，加子域无需额外操作；未列入 `PI_WEB_ALLOWED_HOSTS` 的 Host 保持 403 拒绝（Host 门禁仍在）。

## 6. docker compose 一键

偏好编排文件？仓库 [`docker/compose.yaml`](https://github.com/aiti-ai/aiti-ai/tree/main/docker) 等价实现上述配置：

```bash
git clone https://github.com/aiti-ai/aiti-ai
cd aiti-ai && docker compose -f docker/compose.yaml up -d
```

compose 默认跑 `full` 镜像（`AITI_MODE: full`），只映射 30142/8777（GUI 等端口注释掉按需开），卷与上面 docker run 一致。

## 7. full 版功能速览

| 功能 | 入口 |
|---|---|
| 网页桌面 | noVNC `:6080/vnc.html`（RFB 经 websockify→x11vnc→Xvfb） |
| CDP 调试 | Chrome `:9222`（headful，profile 在 `/opt/aiti/data/chrome-profile`） |
| 语音输入 | ASR `ws://<host>:8767/ws/stream`（实时）/ `/voice/quick`（快捷）/ `/voice/transcribe`（精转）——aiti-ai-input 扩展自动接线 |
| 语音朗读 | 已装 edge-tts；在 aiti-ai-speek 扩展启用 `tts.edge` feature |
| 网页终端 | ttyd `:7681` |
| 隧道 | 容器内可用 `cloudflared` / `ngrok` / `frpc`（ngrok 需自带 authtoken） |
| 下载工具 | `justget <url> -o <file> -m <mirror-url>` 多源竞速 |

## 8. 升级与运维

```bash
docker pull aitiai/pi-web:latest        # ① 拉新镜像（国内可换 registry.cn-hangzhou.aliyuncs.com/aiti-ai/pi-web:latest）
docker stop aiti && docker rm aiti      # ② 删旧容器（卷保留）
# ③ 按原命令重建容器 → 数据由同名卷携带，扩展随镜像刷新
```

```bash
docker logs -f aiti                     # 日志（扩展就绪 / 桥 / 横幅都在这）
docker exec -it aiti bash               # 进容器（用户 aiti，免密 sudo）
docker stats aiti                       # 资源
docker inspect aiti --format '{{.State.Health.Status}}'   # healthy = 正常
docker volume rm aiti_data aiti_agent   # 连数据一起删（谨慎）
```

- **优雅停止**：`docker stop` 约 1s 内退出（entrypoint 把信号转发给各服务）；
- 维护者构建/冒烟/E2E 见仓库 [`docker/`](https://github.com/aiti-ai/aiti-ai/tree/main/docker) 手册 §8。

## 9. 故障排查

| 症状 | 原因 / 处理 |
|---|---|
| 容器重启循环 | `docker logs` 看首个报错；通常是端口冲突 / 卷权限（对齐 PUID） |
| 反向代理 403 | 域名不在 `PI_WEB_ALLOWED_HOSTS` |
| `/api/models` 403 | 正常——只放行既有会话 cwd；健康检查走 `/api/home` |
| x11vnc 连上但无画面 / 极慢 | NOFILE 死锁——勿调大 `AITI_GUI_NOFILE`，用镜像自带 50-gui-start |
| CDP 9222 不可达 | Chrome 启动 flag 需 `--user-data-dir`（136+ 默认 profile 忽略 CDP）+ 首启 EULA 已跳过 |
| ASR 首响慢 | 模型懒加载（full 已预下载，切模型增量下载） |
| OOM | full + 语音需 ≥8GB 内存（2–6GB 实测会 OOM） |
| arm64 | 无官方 Chrome（缺 CDP；其余下载层就绪） |

## 深入阅读

- 镜像完整手册（多语言）：仓库 [`docker/README.md`](https://github.com/aiti-ai/aiti-ai/tree/main/docker)（[中文](https://github.com/aiti-ai/aiti-ai/blob/main/docker/README.zh-CN.md)）；
- compose 一键：[`docker/compose.yaml`](https://github.com/aiti-ai/aiti-ai/blob/main/docker/compose.yaml)；
- 安装方式总览见 [安装](./install.md)，更新节奏见 [更新](./update.md)。
