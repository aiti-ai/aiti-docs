---
title: aiti-testagent
icon: 🧪
ext:
  id: aiti-testagent
  name: TestAgent
  description: Java 后端 AI 调试 MCP server —— 热更新/新建 controller/进程内表达式/诊断/性能采样，40 工具按组暴露
  soul: 所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。
  type: bridge
  category: 调试
  version: 2.0
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # ~/.config/mcp/mcp.json 加：
    "aiti-testagent": { "command": "node", "args": ["<dev-repo>/aiti-testagent/mcp-testagent.cjs"] }
  license: MIT
  tags: [java, jvm, debug, hotswap, mcp, testagent]
---

# aiti-testagent

> ❝ **所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。** ❞

TestAgent 2.0 —— 教 AI 怎么调试运行中的 Java 后端（Spring Boot / 任意 JVM）。stdio MCP server（`mcp-testagent.cjs`）把 TestAgent HTTP JSON API 暴露为标准 MCP 工具：写代码热更新、新建 controller、进程内表达式求值、诊断、性能采样。

- **前置**：目标 JVM 已挂载 TestAgent（启动 `-javaagent` 或 `ta_attach` 动态挂载），HTTP API 默认 `http://127.0.0.1:8564`（env `TESTAGENT_URL`）
- **工具暴露控制**：参数（`--tools/--exclude`）或环境变量（`TESTAGENT_TOOLS/EXCLUDE`）按组名/单名/通配筛选；隐藏的工具同时从 tools/list 消失且 tools/call 服务端拒绝
- **E2E 脚本族**：`e2e-*.sh`（jdk8/mybatis/spring2/sql/mcp/multi/attach…）+ `testagent-java/` agent 本体
