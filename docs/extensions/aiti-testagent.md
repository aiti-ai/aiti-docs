---
title: TestAgent（aiti-testagent）
icon: 🧪
ext:
  id: aiti-testagent
  name: TestAgent
  description: Java 后端 AI 调试 MCP + IDE —— 扫描 Java 进程/attach 一键连桥/Tunnel 桥多端点纳管，JVM 内任意修改/Mock·SQL 拦截模拟/热更新/诊断采样，57 工具 10 组按需暴露，全可逆
  soul: 所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。
  type: bridge
  category: 调试
  version: "0.1.7"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  install: |
    # 1) 目标 JVM 挂载 agent（httpPort 开出 HTTP API；也可运行后用 ta_attach 动态挂载）
    java -javaagent:testagent.jar=conf-dir -Dtestagent.httpPort=8564 -jar app.jar
    # 2) MCP 客户端（~/.config/mcp/mcp.json）加：
    "aiti-testagent": { "command": "node", "args": ["<dev-repo>/aiti-testagent/mcp-testagent.cjs"] }
    # 3) 按组过滤暴露面（可选）：--tools "lifecycle observe jvm" --exclude ta_heapdump
    # 开关多时不必堆 -D：项目根放 testagent.properties（testagent.* 前缀），从子目录启动自动向上发现
  license: MIT
  tags: [java, jvm, debug, hotswap, mcp, testagent, spring-boot, solon, arthas, mock, hot-reload, tunnel, bridge, multi-endpoint]
---

# aiti-testagent

> ❝ **所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。** ❞

TestAgent 2.0 —— **给 AI 用的 Arthas++**：教 AI 怎么调试运行中的 Java 后端（Spring Boot / Solon 一等支持，任意 JVM 皆可挂）。stdio MCP server（`mcp-testagent.cjs`）把 TestAgent 的 HTTP JSON API 暴露为标准 MCP 工具：进程内表达式求值、诊断（threads / sc / sysprop / classloader / logger…，持续对齐 Arthas 能力面）、性能采样。**比 Arthas 强的一档在「改」：热更新 + JVM 内任意修改 + 拦截模拟**——写代码热更新、方法热更新、新建 controller、Mock/SQL 拦截模拟、Bean·XML/声明式 Conf、属性热刷新、组件热操作；且所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。

除 MCP 外，TestAgent 自带 **Web 操作台**（React，与 API 同端口同源）：方法/代码热更新、声明式 Conf、Eval、Mock、SQL 拦截、Bean·XML、Arthas 诊断、Profiling、实时监控、ClassWatch、Terminal、配置历史——人看同一个端口，类名/方法名/URL/bean 全量输入补全。

## 57 个工具，10 组

| 组 | 工具 | 干什么 |
| --- | --- | --- |
| `lifecycle` | ta_run / ta_ping / ta_attach / ta_discover / **ta_bridge** | 起停应用、探活、动态挂载 agent（自动等就绪）、发现实例、**一键连桥（扫描→attach→接通）**；ta_tunnel 恒暴露不入组（隧道管理 status/connect/disconnect） |
| `observe` | ta_watch / ta_monitor / ta_tt / ta_trace / ta_job | 观察参数/返回值/异常、调用统计、时空隧道录参、耗时链路子调用树、后台常驻观测任务（watch/tt，TTL 到期自动摘除，since 游标拉增量） |
| `jvm` | ta_metrics / ta_memory / ta_threads / ta_profile / ta_heapdump / ta_download / ta_vmtool / ta_classloader / ta_mbean / ta_vmoption / ta_perfcounter / ta_dump / ta_sysprop / ta_sysenv | 线程栈（死锁检测/CPU 排序）、火焰图（cpu/alloc/wall）、堆转储、内存分池明细、大文件取回、JVM flags、类加载器树、系统属性/环境变量 |
| `inspect` | ta_sc / ta_sm / ta_jad / ta_fs / ta_urls | 类搜索、方法清单、CFR 反编译、容器内文件查看、REST 端点清单 |
| `write` | ta_code / ta_restore / ta_method / ta_eval / ta_conf / ta_xml / ta_classwatch / ta_bean / ta_logger / ta_props / ta_spring / ta_solon / ta_addr | **写代码热更新、新建 controller**、方法级改行为、表达式求值、声明式 Conf、Bean·XML、改代码自动热替换、Spring bean 注入 mock、日志级别热调、Spring/Solon 组件热操作（springboot/solon 聚合开关配套）、地址透明替换 |
| `mock` | ta_mock_url / ta_mock_method / ta_mock_results / ta_capture / ta_sql | URL/方法级 mock、返回值篡改、流量捕获、**SQL 拦截模拟** |
| `startup` | ta_startup / ta_lazy_module | 启动耗时报告（慢 bean 直指）、模块级懒加载 |
| `auth` | ta_login | 自动登录：进程内登录拿 token/cookie → 401 原请求自动重放（人/机免登录墙） |
| `native` | ta_native_modules / ta_native_watch / ta_native_stack / ta_native_detach | testagent-native 薄代理——Windows 进程 native 层（模块枚举/Detours 挂钩/线程栈/卸载还原） |
| `history` | ta_history / ta_status | 配置历史审计、实例状态 |

暴露面可用 `--tools` / `--exclude`（组名/单名/通配，参数或 `TESTAGENT_TOOLS/EXCLUDE`）按组裁剪——只读调试场景排除 `write,mock` 两组即可，隐藏的工具直接从 tools/list 消失且服务端拒绝调用。

## 场景速查：遇到什么，用什么

不用记 40 个工具名——遇到以下情况翻这一行：

| 场景 | 用 |
| --- | --- |
| 联调时想改返回假数据 / 模拟失败 | `ta_mock_method`（json/bean/code 四种内容型，按过滤器命中） |
| 后端还没好，前端等着联调 | `ta_mock_url` / `ta_mock_method` 直接发假响应 |
| 想模拟慢 SQL / 特定 SQL 结果 | `ta_sql`（SQL 拦截模拟）+ 过滤器 |
| **调试被登录墙拦住** | **`ta_login`：配一次调试密码，人和 AI 都免登录** |
| 改了 bug 不想重启 | `ta_code` 写代码热更 / `ta_classwatch` 本地改完自动热替换 |
| 只想观察不动手（线上只读） | observe + jvm 组，`--exclude write,mock` 一刀切 |
| 接口慢，想找卡在哪 | `ta_trace`（子调用树逐层耗时） |
| 启动慢，想先看谁慢 | `ta_startup`（per-bean 报告，byPkg 聚合）→ `ta_lazy_module` |
| 连的是哪个环境？想偷梁换柱 | `ta_addr`（addr-redirect 透明替换 Redis/JDBC 地址） |
| 定时任务想立刻跑一次 | `ta_spring` / `ta_solon`（jobs / job_trigger，Quartz、@Scheduled） |
| 连接池满了 / 线程池炸了 | `ta_spring` / `ta_solon`（pool_set / executor_set 热调参） |
| 这方法到底怎么写的？ | `ta_jad`（CFR 源码级反编译） |
| 线程卡死 / 想找死锁 | `ta_threads`（死锁检测、CPU 排序） |
| 日志不起眼，先放大 | `ta_logger` 热调日志级别，不用重启 |
| 不知道挂了几台、怎么连 | `ta_discover` / `ta_attach`（动态挂载）/ **`ta_bridge`（扫描+attach+接通一步到位，省略 pid 时自动选唯一候选）** |
| **多进程/跨机器统一纳管调试** | **TaBridge 桥**：被调服务带 `-Dtestagent.bridge=ws://桥:8667` 全部自动上线；MCP `TESTAGENT_URL` 指桥 + `endpoint` 参数路由任意端点 |
| 端点启动时没连桥，事后想接入 | `ta_tunnel connect`（运行时补连；经桥带 endpoint 即远程补连） |
| 改过什么、想回滚 | `ta_history` / `ta_restore` |

## IDE 支持（pi-web 面板）

aiti-testagent 同时是 pi-web 扩展：工具条 ☕ Java 按钮 → 面板。**桥为中心的管理模式**：

- **桥管理卡片**：默认**自建桥**（同 jar 双角色，保存即自动拉起/幂等探活；端口 + 注册/access token 可配），也可切**外部桥**（地址 + ws + token）；[🖥 打开操作台] 经 service-tunnels proxy（无认证 open binding）把桥端口挂到 pi-web 域（`https://<桥端口>.your-pi-web.example.com/dev` 前缀/根）直接开完整操作台，右上角端点下拉切目标；🎟 邀请票据签发保留
- **JAVA_OPTS 自动挂载开关**：一键写 `~/.bashrc` + `~/.profile` 标记块（`JAVA_TOOL_OPTIONS=-javaagent:…-Dtestagent.bridge=ws://…-Dtestagent.httpPort=0`）——**所有新启动的 Java 进程自动挂 agent 并连桥**，设好后等 ta client 自动注册即可；关掉即移除块。注意影响所有新 Java 进程（含 maven/gradle），自担开销
- **⇄ 桥端点区**：endpointId/pid/port/remoteIp/在线点；每行 [🖥] 打开桥操作台（选端点）/ 隧道状态 / 离线移除
- **已挂载会话表**：每行 **[🖥 打开操作台]**（service-tunnels proxy no-auth 挂该端点自己的 httpPort，URL 保留 TA basePath 1:1 透传；双实例自动同步登记）+ ⛓✕ 取消挂载；未挂载 Java 进程一键 Attach（配置桥后自动上桥）
- **MCP 打通**：桥配置存 `~/.cache/testagent/bridge.json`（扩展写/MCP 读），mcp-testagent.cjs 的 BASE 自动跟随——AI 侧 `ta_discover` 直接桥模式列全部端点，`ta_*` 工具 `endpoint` 参数路由任意端点，AI 可操作全部桥上进程

服务端与 MCP 共享 `lib/testagent-core.cjs`（发现/挂载/探活/桥配置/JTO 开关唯一实现）。

## Tunnel/Bridge：多端点纳管（TaBridge）

多进程/子进程/跨机器调试统一纳管——**同一个 jar 双角色**：

```bash
# ① 桥（HTTP 8666 操作台+转发 / WS 8667 端点隧道；token 全可选）
java -cp testagent.jar com.teesoft.testagent.bridge.TaBridge --reg-token reg-1 --use-token use-1
# ② 被调服务（JAVA_TOOL_OPTIONS 全继承——主进程+子进程一网打尽）
JAVA_TOOL_OPTIONS="-javaagent:testagent.jar=conf -Dtestagent.bridge=ws://桥:8667" ./run.sh
# ③ 调用（与直连完全一致 + X-TA-Endpoint；token 见下）
curl -H 'X-TA-Endpoint: <id>' http://bridge:8666/api/status
```

- **端点自动上线**：`-Dtestagent.bridge=ws://桥:8667`（或 ta_attach bridge 参数、env TESTAGENT_BRIDGE、运行时 `POST /api/tunnel connect` 补连）；endpointId=cmdline hash 派生（跨重启/跨桥稳定，同 cmdline 冲突随机后缀）
- **调用零漂移**：与直连完全一致只多 `X-TA-Endpoint` header；MCP 桥模式（`TESTAGENT_URL` 指桥）下所有工具自动带 endpoint 路由，`ta_discover` 列全部端点（pid/cmd/remote ip 供识别）
- **token 三分离**（全可选，默认零 token）：

| token | 谁校验 | 传递 | 铁律 |
| --- | --- | --- | --- |
| 注册 token | 桥（hello 一次） | TA `testagent.bridge.token` ↔ 桥 `--reg-token` | 不匹配拒连；通道内永不再现 |
| 桥使用 token | 桥（每个 /api 请求） | `X-TA-Bridge-Token` header | 校验后**剥离，绝不下发 TA** |
| 端点 token（X-TA-Token） | TA | 直连：header/`?token=`；经桥：`X-TA-Endpoint-Token` 转换（仅 TA 声明 `needToken=true`） | 桥零感知；默认信任桥 WS 请求 |

- **WS 通道进程内直调**：桥转发的请求在 TA 内直调路由（不经 HTTP token 校验层——注册即信任）；needToken=true 时由隧道入口自行校验
- IDE 面板：桥地址/token 配置后显示全部桥端点（⇄ 区段）+ 一键把本机进程挂到桥

## 诊断面：对齐 Arthas

Arthas 主流命令均有对应端点：`sc`/`sm`/`jad`（CFR 源码级反编译）/`watch`（含调用栈）/`trace`（子调用树 cost+maxDepth）/`monitor`/`tt`（录制）/`heapdump`/`profiler`（cpu+alloc+wall）/`mbean`/`vmoption`（白名单可写 flags + 审计）/`logger`/`classloader`/`ognl`（ta_eval）/`getstatic`/`thread`（死锁检测、CPU 排序、状态过滤、利用率）——差异对照见 TestAgent 仓 `docs/testagent-vs-arthas.md` 与 `docs/arthas-parity-plan.md`。

## 「改」的面：Arthas 没有的

- **写代码热更新**：`ta_code` 直接提交 Java 源码，编译→retransform 即时生效；`ta_classwatch` 挂上后改本地源码自动热替换——代码+配置双不重启
- **方法级任意改行为**：`ta_method`/声明式 conf 改返回值、注入 sleep/异常、insertBefore/insertAfter/body（Javassist 语法）、加字段
- **拦截模拟**：URL/方法级 mock（json/bean/code/文件四种 content 型）、按过滤器命中、`ta_sql` SQL 拦截模拟、`ta_capture` 流量捕获——前后端联调不等后端、故障注入不用改代码
- **地址透明替换**（addr-redirect）：拦截 `Socket.connect` + `DriverManager.getConnection`，把连不上的 dev Redis/JDBC 地址热改指向任意可达地址，规则热增删、重启自动恢复、无规则零插桩开销
- **自动登录**（ta_login）：**配置一次调试密码，人和 AI 本地调试都不用操心登录**——`-Dtestagent.login.*` 启动预设，或 ta_login 现场给用户名密码（或自写登录代码，`{{username}}/{{password}}` 占位符注入）；server 在 401 时自动拦截 → 进程内登录拿 token/cookie → 原请求自动重放。裸 curl、MCP 工具、Web 操作台全通吃——AI 连着调二十个接口，不会再被登录墙打回

## 框架 dev mode：一个开关

**Spring Boot**（`-Dtestagent.springboot=true`）与 **Solon**（`-Dtestagent.solon=true`）各自一键融合整套开发体验，子项可单独退出：

- **启动加速**：`lazy-module`（模块级懒加载，首请求触发激活）+ `lazy-mybatis`（mapper SQL 生成延迟到后台，Spring/Solon 通吃）——实测 263 mappers 应用启动 33.3s → 29.0s；Solon 实测（neutrino-proxy，19 mappers）冷启动 **-42%**
- **改配置不重启**：propwatch 监听 `application*.yml` / `app.yml`，防抖后写属性源 + 重绑 `@Value`/`@ConfigurationProperties`/`@Inject`
- **组件热操作**（`ta_spring` / `ta_solon`，全部无需重启）：
  - HikariCP 连接池 / 线程池热调参（maxPoolSize、core/max）
  - `@Scheduled`、**Quartz** 任务清单与热改 cron、立即触发、暂停恢复
  - **Dubbo** 服务清单 + 进程内泛化调用；**XXL-Job** 直接触发（不进 admin 台）
  - Spring `@Cacheable` / Hibernate 二级缓存清单与清缓存（直改库后清掉旧读）
  - Solon 专属：bean/路由清单、URL→处理方法解析、配置热改 + bean 重注入、热注册 controller
- **启动报告**：per-bean 耗时聚合（byPkg），慢 bean 直指——扩懒加载集合前先看占比

## 可逆与安全

- 每次修改入配置历史（`ta_history`），`ta_restore` / 删 conf / `stop` 一键还原
- `ta_attach` 运行中动态挂载，不重启进程；httpPort 支持 TOKEN 鉴权与 basePath
- 惰性插桩：addr-redirect 无规则不装钩子；solon 适配检测到 `org.noear.solon` 才加载
- 只读场景：`--exclude write,mock` 一刀切掉全部写面

## 质量与文档

自动化回归：核心功能 29 断言 + Arthas 差距补齐 26 断言（JDK8+spring2 与 JDK21+mybatis 双基线全绿）+ 自动登录 16 断言 + lazy-module/solon 专项 e2e + **tunnel/bridge 48 断言**（端点纳管/token 三分离/wss/Origin/download/并发/MCP 桥模式）+ MCP 协议 6 断言；一键 run-all **120 + restmock 9 = 129 断言**。完整教程与 API 参数 Schema 见 TestAgent 仓 `docs/testagent-user-guide.md`（MCP 工具映射见其附录 B）。

## 前置

- 目标 JVM 已挂载 TestAgent（启动 `-javaagent` 或 `ta_attach` 动态挂载），HTTP API 默认 `http://127.0.0.1:8564`（env `TESTAGENT_URL`）
- 编译基线 Java 11，运行 Java 8+（Spring Boot 2/3、javax/jakarta 通吃；Solon 2.x/3.x 双兼容）
