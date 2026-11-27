---
title: aiti-sysmon
icon: 🖥️
ext:
  id: aiti-sysmon
  name: aiti-sysmon
  nameEn: "Server Status Viewer"
  description: 服务器状态查看器——左栏停靠面板实时查看 pi-web 所在主机的 CPU / 内存 / 磁盘 / 网络 / 温度 / 传感器，面板打开才采样、折叠即停，服务端零常驻开销
  descriptionEn: "Server status viewer — sidebar dock panel for the pi-web host machine: CPU / memory / disk / network / temperature (systeminformation based)"
  soul: 服务器忙不忙，开左栏看一眼就知道。
  iconUrl: "/ext-icons/aiti-sysmon.svg"
  soulEn: "How busy is the server? One glance at the left sidebar tells you."
  type: aiti-ext
  category: 系统工具
  version: "0.2.2"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/aiti-sysmon"
  install: |
  license: MIT
  tags: [server, monitor, cpu, memory, disk, network, temperature, sensors, systeminformation, sidebar-dock, i18n]
---

# aiti-sysmon（服务器状态查看器）

> ❝ **服务器忙不忙，开左栏看一眼就知道。** ❞

pi-web 所在服务器的实时状态面板：左栏停靠块「系统状态」，一眼看到 **CPU / 内存 / 磁盘 / 网络 / 温度 / 传感器**。数据来自
[`systeminformation`](https://www.npmjs.com/package/systeminformation)（纯 JS、零原生编译、跨 Linux / Windows / macOS）。
npm 包：[`@aiti-ai/aiti-sysmon`](https://www.npmjs.com/package/@aiti-ai/aiti-sysmon)。

## 能力

- **OS 头行**：主机名 · 发行版 · 内核 · 运行时长
- **CPU**：总占用大数字 + 60 点迷你历史条 + 每核小条 + loadavg + 温度（读不到显示 N/A + 配置指引链接）
- **传感器**：全芯片温度列表（lm-sensors 风格，Linux 直读内核 `/sys/class/hwmon`，无需用户态工具）——k10temp/nvme/amdgpu/acpitz 等全部列出；温度值按阈值变色（≥70 琥珀、≥90 红）；非 Linux 平台无此区
- **内存**：RAM 已用/总量条 + swap 条
- **磁盘**：各挂载点已用/总量条（≥80% 琥珀色、≥90% 红色；自动滤掉 squashfs/loop/efivarfs 等噪音挂载）
- **网络**：各真实网卡（自动滤掉 lo / docker 桥 / veth）↓/↑ 实时速率 + 累计流量，非 up 状态半透明
- **底部工具行**：暂停/恢复 + 手动刷新 + 间隔快捷切换（2s / 5s / 15s）；面板文案全量中英双语（宿主语言跟随）
- **顶栏会话信息 CPU/内存指示**：顶部「会话信息」按钮内容尾部常驻两枚紧凑芯片——`C8%`（CPU 负载）、`M89%`（内存占用），与宿主 in/out/cache/cost/context 同一行、同一文本流（默认灰色，≥70% 琥珀、≥90% 红）。hover 该按钮时 tooltip 多出一行 `system: CPU 12% · MEM 89% · 51.9 GB / 58.6 GB · swap 17.0 GB / 34.0 GB`（由 `meta.tooltip` 契约注入，全称含义与内存明细都在这里；采样超过 90s 未更新则不显示，避免旧值误导）。仅宽屏档显示（compact/移动档自动隐藏）；扩展管理器 `topbarChips` 可整体关闭（关即零渲染零采样、tooltip 也不再出现该行）

## 工作方式（零常驻开销）

- **服务端**：只读快照 API `GET /api/extensions/aiti-sysmon/snapshot`（面板）与轻量 API `GET …/brief`（顶栏芯片，仅 cpu/mem 两次廉价读 + 2s TTL 去重，芯片与面板并行轮询时合并采样），**无后台定时器**——速率类数值
  （CPU 占用 %、网卡每秒速率）由 systeminformation 在相邻两次调用间做 delta，客户端轮询节奏即采样窗口；
  慢变数据（磁盘 30s / OS 信息 10min / 温度 5s）服务端 TTL 缓存，单次轮询开销极低。
- **客户端**：仅当面板**展开、页面可见、未暂停**时才轮询（顶栏芯片：页面可见 + `topbarChips` 开启时轮询 `brief`）；折叠或切到后台标签页立即停止采样（keep-alive
  下也一样）；首帧渲染布局镜像骨架屏（pulse 动画尊重 `prefers-reduced-motion`）；CPU 迷你历史条为客户端内存内最近 60 点，不落盘。
- **入栈语义**：与「任务」区块同款——刷新页面恢复默认存在（折叠态），用户 ⋮ 关闭本会话不回弹。

## 设置（扩展管理器）

| id | 类型 | 默认 | 含义 |
|---|---|---|---|
| `interval` | string | `3` | 面板展开时的轮询间隔秒数（面板折叠/页面隐藏时不采样）；顶栏芯片同一节拍 |
| `showSensors` | boolean | 开 | 显示 CPU 温度行 + 传感器芯片列表（读不到时显示 N/A + 配置指引链接） |
| `topbarChips` | boolean | 开 | 顶栏会话信息尾部 CPU/内存芯片总开关（关即零渲染零采样；仅宽屏档显示） |

## 温度显示 N/A？——温度传感器说明

CPU 温度与传感器列表读内核 hwmon 子系统（`/sys/class/hwmon`，sysfs）——AMD `k10temp` / Intel `coretemp`
等驱动内核自带，**通常无需额外安装**。若 CPU 温度仍为 N/A（内核驱动未加载/老内核），安装 lm-sensors
探测并启用驱动：

```bash
# Debian / Ubuntu
sudo apt install lm-sensors && sudo sensors-detect

# RHEL / Fedora / CentOS
sudo dnf install lm_sensors && sudo sensors-detect

# Arch
sudo pacman -S lm_sensors && sudo sensors-detect
```

`sensors-detect` 一路 `YES` 即可（探测内核可用的温度驱动），完成后验证：

```bash
sensors
# 期望出现 k10temp（AMD）或 coretemp（Intel）等核心温度条目
```

无需重启 pi-web——下一个轮询周期（≤5s 温度缓存过期）面板即显示温度。传感器列表区（传感器全芯片）
不依赖 lm-sensors 用户态工具，仅由内核驱动决定可读条目。

> **Windows**：多数主机无法直接读取核心温度（systeminformation 在 Windows 上常返回空），面板按 N/A
> 降级处理；部分机型可用厂商工具（如 Lenovo Vantage / HWiNFO）确认实际温度。CPU/内存/磁盘/网络
> 在 Windows 上不受影响。

## 构建与部署（开发者）

```bash
cd extensions/aiti-sysmon
npm install                 # client 构建用 vite
node tools/deploy.mjs       # 构建 → 拷贝双实例 → 依赖 reconcile → 热重载
node --test test/core.test.mjs
```

服务端运行时依赖 `systeminformation` 声明在 `package.json` `dependencies`，由 aiti-extman reconcile
装入共享 web-root `node_modules`。
