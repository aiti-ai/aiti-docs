---
title: TestAgent Native（aiti-testagent-native）
icon: ⌖
ext:
  id: aiti-testagent-native
  name: TestAgent Native 面板
  nameEn: "testagent-native (Windows API/COM trace panel)"
  description: testagent-native（Windows 原生进程活体操控）可视面 —— broker 进程/会话/挂钩/事件流；原 aiti-wintrace（2026-11-07 改名）
  descriptionEn: "Visual panel for testagent-native (live Windows-native process control) — broker processes/sessions/hooks/event stream; formerly aiti-wintrace (renamed 2026-11-07)"
  soul: 任意 Windows 进程→AI 可编程工具面：API/COM 调用级追踪、原生求值、mock 覆写、函数体热替换，全可逆审计。
  soulEn: "Any Windows process becomes an AI-programmable tool surface: API/COM call-level tracing, native evaluation, behavior mocking, function-body hot-patching — all reversible and audited."
  type: aiti-ext
  category: 调试
  version: "0.1.12"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 1) 常驻 tan broker（155：Startup 文件夹 start-tan.vbs——broker 8765/8766 + MCP HTTP 8767）
    #    手动：D:\path\to\testagent-native\native\build\win64-release\bin\<current-broker.txt> --port 8765 --http-port 8766
    # 2) 本面板随 pi-web 扩展部署自动生效（工具条「Win」入口）；数据源 broker HTTP 8766（env TAN_BROKER_HTTP 可改）
    # 3) AI 侧走 testagent-native-mcp：node mcp/testagent-native-mcp/register.js（52 tan_* + 7 app_* 工具）
  license: MIT
  tags: [windows, native, win32, com, detours, injection, hook, trace, hotpatch, tan, testagent-native]
---

# aiti-testagent-native

> ❝ 任意 Windows 进程→AI 可编程工具面：API/COM 调用级追踪、原生求值、mock 覆写、函数体热替换，全可逆审计。 ❞

**testagent-native 面板**（原名 `aiti-wintrace`，2026-11-07 随项目改名）——IDE 内可视面：tan broker 状态/进程扫描+attach/会话+eject/挂钩表单/实时事件流。服务端代理 broker HTTP（`8766 /api/rpc` 全方法，= testagent-native-mcp 工具 1:1）。

能力模型 = TestAgent 六原语的 native 复刻：

- **A 接入**：两跳注入（NtCreateThreadEx→CRT 回退，位数匹配），attach 任意进程
- **B 看现场**：libclang 签名库参数具名解码 + COM 四层自发现 + proc.stack 导出符号具名帧
- **C 求值/覆写**：外部编译+远程执行（clang→COFF 重定位→arena→远程线程）；API 级 mock（skip/改返/last_error）
- **D 热更新**：函数体级 hotpatch（dll_bypass apply/revert）+ quickjs-ng 沙箱脚本（ACG 进程可用）
- **E 可逆审计**：hook/patch 登记强制度 + `tan_restore` 一键回滚 + history 审计

工具面 **59 项 = 52 `tan_*` + 7 `app_*`**（2026-11-19 快照；「任意应用→MCP」服务层 + 跨平台对象模型 OM 系列：`tan_dbus_*`×5 / `tan_gir_*`×2 / `tan_objc_*`×3 / `tan_vtable_*`×3）。**OM v2 已清账**：`tan_dbus_call`（⚠️ 写操作 danger 门——方法调用默认拒答 `write_gate_closed`，显式 `allow_write:true` 执行并落审计；签名取自 introspection，基础标量 marshal）+ ObjC observe-with-args 透传（`objc.watch` 规则 `through:true` → asm trampoline 记录后调原实现——变参/浮点/结构体签名全安全，原方法副作用连续）。旧名 `wintrace_*` 别名层已于 2026-11-18 退役（旧名现为 unknown fail-loud）。

## 数据源与配置

| 项 | 值 |
| --- | --- |
| broker HTTP | `http://127.0.0.1:8766`（env `TAN_BROKER_HTTP` 可改） |
| broker token | env `TAN_TOKEN`（broker `--token` 启动时必带） |
| MCP 注册 | `node mcp/testagent-native-mcp/register.js` → pi `mcpServers.testagent-native`（HTTP 8767） |
| Java 侧联动 | TestAgent `/api/tan/*` 代理（`TanOps.java`，`-Dtestagent.tanBroker` 可指跨机） |
