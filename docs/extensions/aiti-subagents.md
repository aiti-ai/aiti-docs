---
title: 子代理（aiti-subagents）
icon: 👥
ext:
  id: aiti-subagents
  name: 子代理
  description: 子代理舰队 Fleet 观测/运行控制/Agent 管理/并发配置——fork 引擎，工具归上游 pi-subagents
  soul: 主 agent 负责思考，脏活累活分给专职的它。
  type: aiti-ext
  category: AI 能力
  version: "0.4.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 部署到 ~/.pi/web/extensions/aiti-subagents/ 后 reload
  license: MIT
  tags: [subagent, delegate, fleet, parallel, chain]
---

# aiti-subagents

> ❝ **主 agent 负责思考，脏活累活分给专职的它。** ❞

子代理舰队扩展：**fork 引擎的 Fleet 观测 / 运行控制 / Agent 管理台**。子代理由上游 `@aiti-ai/pi-subagents` 包 fork spawn（subagent 工具由上游提供），本扩展零进程内状态、不注入任何 agent 工具（`agent: {}`）。

- **Fleet 监控面板**：Web UI 实时查看所有 fork 子代理运行状态（扫上游工件 + registry）；检查器看运行详情 / 日志 / 工具调用 / 输出，桥在线时附实时消息；左栏「子代理任务」区点击直达对应会话
- **运行控制**：abort / steer / prompt 即时桥控制（桥离线回退 control inbox 文件投递，协议照抄上游 control-channel）；单 run 停止
- **Agent 管理**：内置 / 自定义 agent（scout/worker/reviewer/oracle/researcher/delegate 等，定义归上游）增删改（`<agentDir>/agents/*.md` frontmatter 行级 merge，user scope 优先于 builtin）；外部 CLI agent 一键「接管」为 pi-web 后端执行（claude / codex / cursor 系 adapter → 同名 pi-web backend）
- **并发配置**：上游 `<agentDir>/extensions/subagent/config.json` 白名单键表单（单 run 并发 20、spawn 预算 64、parallel 批 8 × 并发 4 等），GET/PUT `/config` 保存即生效——只 merge 白名单键，磁盘未知键原样保留、白名单外键拒写
- **doctor 自检**：fork 包安装 / registry 可读 / 工件目录
- **进程内会话引擎已退役**：子代理由上游 fork spawn，零进程内状态；与手工安装的原版 pi-subagents 冲突（同名工具双注册），平台按 `conflicts` 声明自动禁用原版
