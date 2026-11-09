---
title: TestAgent Native（aiti-testagent-native）
icon: ⌖
ext:
  id: aiti-testagent-native
  name: TestAgent Native 面板
  description: testagent-native（Windows 原生进程活体操控）可视面 —— broker 进程/会话/挂钩/事件流；原 aiti-wintrace（2026-11-07 改名）
  soul: 任意 Windows 进程→AI 可编程工具面：API/COM 调用级追踪、原生求值、mock 篡改、函数体热替换，全可逆审计。
  type: dev-repo
  category: 调试
  version: "0.1.8"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 1) 常驻 tan broker（155：Startup 文件夹 start-tan.vbs——broker 8765/8766 + MCP HTTP 8767）
    #    手动：D:\path\to\testagent-native\native\build\win64-release\bin\<current-broker.txt> --port 8765 --http-port 8766
    # 2) 本面板随 pi-web 扩展部署自动生效（工具条「Win」入口）；数据源 broker HTTP 8766（env TAN_BROKER_HTTP 可改）
    # 3) AI 侧走 testagent-native-mcp：node mcp/testagent-native-mcp/register.js（38 tan_* + 7 app_* 工具）
  license: MIT
  tags: [windows, native, win32, com, detours, injection, hook, trace, hotpatch, tan, testagent-native]
---

# aiti-testagent-native

> ❝ 任意 Windows 进程→AI 可编程工具面：API/COM 调用级追踪、原生求值、mock 篡改、函数体热替换，全可逆审计。 ❞

**testagent-native 面板**（原名 `aiti-wintrace`，2026-11-07 随项目改名）——IDE 内可视面：tan broker 状态/进程扫描+attach/会话+eject/挂钩表单/实时事件流。服务端代理 broker HTTP（`8766 /api/rpc` 全方法，= testagent-native-mcp 工具 1:1）。

能力模型 = TestAgent 六原语的 native 复刻（详见 testagent-native 仓 `docs/MCP-PLAN.md`）：

- **A 接入**：两跳注入（NtCreateThreadEx→CRT 回退，位数匹配），attach 任意进程
- **B 看现场**：libclang 签名库参数具名解码 + COM 四层自发现 + proc.stack 导出符号具名帧
- **C 求值/篡改**：外部编译+远程执行（clang→COFF 重定位→arena→远程线程）；API 级 mock（skip/改返/last_error）
- **D 热更新**：函数体级 hotpatch（dll_bypass apply/revert）+ quickjs-ng 沙箱脚本（ACG 进程可用）
- **E 可逆审计**：hook/patch 登记强制度 + `tan_restore` 一键回滚 + history 审计

工具面 **57 项 = 50 `tan_*` + 7 `app_*`**（2026-11-10 快照；「任意应用→MCP」服务层 + 跨平台对象模型 OM 系列：`tan_dbus_*`×4 / `tan_gir_*`×2 / `tan_objc_*`×3 / `tan_vtable_*`×3，随 OM 五期持续扩展）；旧名 `wintrace_*` 经 broker/MCP 双别名层过渡兼容（退役条件见 testagent-native 仓 rename-exec §P6）。

## 数据源与配置

| 项 | 值 |
| --- | --- |
| broker HTTP | `http://127.0.0.1:8766`（env `TAN_BROKER_HTTP` 可改） |
| broker token | env `TAN_TOKEN`（broker `--token` 启动时必带） |
| MCP 注册 | `node mcp/testagent-native-mcp/register.js` → pi `mcpServers.testagent-native`（HTTP 8767） |
| Java 侧联动 | TestAgent `/api/tan/*` 代理（`TanOps.java`，`-Dtestagent.tanBroker` 可指跨机） |
