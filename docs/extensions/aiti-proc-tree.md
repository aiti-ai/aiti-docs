---
title: aiti-proc-tree
icon: 🌳
ext:
  id: aiti-proc-tree
  name: aiti-proc-tree
  nameEn: "Process Tree"
  description: 子进程管理——树形列出 pi-web 生态派生的子进程（终端/隧道/子代理/外部 Agent），实时 CPU/内存，可结束单进程或整棵子树；面板打开才采样，折叠即停
  descriptionEn: "Child-process tree manager — every process the pi-web ecosystem spawns (terminals, tunnels, subagents, external agents) with live CPU/memory and subtree stop; samples only while the panel is open"
  soul: 谁在跑、吃多少、从哪来——一棵树看全，点一下就能停。
  soulEn: "Who is running, how much it eats, where it came from — one tree, one click to stop."
---

# 子进程管理（aiti-proc-tree）

以 pi-web 宿主为根，把生态派生的子进程按父子关系树形列出：终端（aiti-cmd）、隧道（service-tunnels）、子代理（pi-subagents，含 attached 活动 run）、外部 Agent（agent-starter / ACP 后端 / 桥接 TUI）以及宿主后代进程。

## 功能

- **五列表格**：名称（树形缩进）/ PID / CPU / 内存 / 运行时长；列头点击排序（再点翻转升降序）。
- **分组折叠**：宿主 / 终端 / 外部 Agent / 子代理 / 隧道；无关注程默认不采集、不显示。
- **详情抽屉**：点击行查看完整命令行、工作目录、白名单环境变量、Socket/Unit、TCP 监听端口、父/子进程；可结束单进程或整棵子树（TERM→KILL，二次确认 + 审计）。
- **监听端口识别**：每个监听端口标注协议（http/https/tcp 徽标 + 页面标题探测）；装了 service-tunnels 时还会对齐隧道配置（隧道名/类型/协议/对外 URL）。端口按需查询（打开抽屉才请求一次，采样循环零开销）；探测工具缺失/超时降级为可见提示，绝不阻塞。
- **联动**：终端行「打开终端」弹出对应 aiti-cmd 终端；外部 Agent 行「打开会话」直达其会话；隧道行打开服务面板。
- **打开才采样**：dock 折叠 / 浮窗关闭 / 页面隐藏即停止采样，服务端零定时器（与 aiti-sysmon 同款纪律）。

## 数据来源

aiti-cmd-host / agent-starter / bridge-registry 注册表、service-tunnels pid 注册文件、pi-subagents async 目录，以及四个扩展提供的只读 `ctx.services`（`aiti-cmd.procs` 等）。Linux 走 `/proc` 两阶段采样（全量 stat 建树 + 仅可见集合读详情）；macOS `ps`（CPU 为均值，标 ≈）；Windows 降级（CPU 显示 —，kill 走 taskkill）。

## 选项

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| 刷新间隔（秒） | 2 | 面板展开时的采样间隔（1~30） |
| 单次返回上限（条） | 200 | 按 CPU 排序截断；0 = 不截断 |
| 显示未归属进程（只读） | 关 | 调试用 |
| 显示其它 pi-web 实例 | 关 | 调试用 |

## 安全

kill 前服务端重算子树并校验：同 uid、保护名单（init / 扩展宿主 / pi-web CLI / 其它实例）、仅已识别归属；每次 kill 写入 `state/kill-audit.jsonl` 审计。
