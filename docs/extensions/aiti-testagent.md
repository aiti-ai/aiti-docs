---
title: TestAgent（aiti-testagent）
icon: 🧪
ext:
  id: aiti-testagent
  name: TestAgent
  description: Java 后端 AI 调试 MCP server —— 给 AI 用的 Arthas++：JVM 内任意修改/Mock·SQL 拦截模拟/热更新/诊断采样，40 工具 8 组按需暴露，全可逆
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
    # 1) 目标 JVM 挂载 agent（httpPort 开出 HTTP API；也可运行后用 ta_attach 动态挂载）
    java -javaagent:testagent.jar=conf-dir -Dtestagent.httpPort=8564 -jar app.jar
    # 2) MCP 客户端（~/.config/mcp/mcp.json）加：
    "aiti-testagent": { "command": "node", "args": ["<dev-repo>/aiti-testagent/mcp-testagent.cjs"] }
    # 3) 按组过滤暴露面（可选）：--tools "lifecycle observe jvm" --exclude ta_heapdump
    # 开关多时不必堆 -D：项目根放 testagent.properties（testagent.* 前缀），从子目录启动自动向上发现
  license: MIT
  tags: [java, jvm, debug, hotswap, mcp, testagent, spring-boot, solon, arthas, mock, hot-reload]
---

# aiti-testagent

> ❝ **所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。** ❞

TestAgent 2.0 —— **给 AI 用的 Arthas++**：教 AI 怎么调试运行中的 Java 后端（Spring Boot / Solon 一等支持，任意 JVM 皆可挂）。stdio MCP server（`mcp-testagent.cjs`）把 TestAgent 的 HTTP JSON API 暴露为标准 MCP 工具：进程内表达式求值、诊断（threads / sc / sysprop / classloader / logger…，持续对齐 Arthas 能力面）、性能采样。**比 Arthas 强的一档在「改」：热更新 + JVM 内任意修改 + 拦截模拟**——写代码热更新、方法热更新、新建 controller、Mock/SQL 拦截模拟、Bean·XML/声明式 Conf、属性热刷新、组件热操作；且所有操作可逆（delete/stop 还原），AI 放心在运行中的 JVM 里做实验。

除 MCP 外，TestAgent 自带 **Web 操作台**（React，与 API 同端口同源）：方法/代码热更新、声明式 Conf、Eval、Mock、SQL 拦截、Bean·XML、Arthas 诊断、Profiling、实时监控、ClassWatch、Terminal、配置历史——人看同一个端口，类名/方法名/URL/bean 全量输入补全。

## 40 个工具，8 组

| 组 | 工具 | 干什么 |
| --- | --- | --- |
| `lifecycle` | ta_run / ta_ping / ta_attach / ta_discover | 起停应用、探活、动态挂载 agent、发现实例 |
| `observe` | ta_watch / ta_monitor / ta_tt / ta_trace | 观察参数/返回值/异常、调用统计、时空隧道录参、耗时链路子调用树 |
| `jvm` | ta_metrics / ta_threads / ta_profile / ta_heapdump / ta_vmtool / ta_classloader / ta_mbean / ta_vmoption / ta_perfcounter / ta_dump | 线程栈（死锁检测/CPU 排序）、火焰图（cpu/alloc/wall）、堆转储、JVM flags、类加载器树 |
| `inspect` | ta_sc / ta_sm / ta_jad / ta_fs | 类搜索、方法清单、CFR 反编译、容器内文件查看 |
| `write` | ta_code / ta_restore / ta_method / ta_eval / ta_conf / ta_xml / ta_classwatch / ta_bean / ta_logger | **写代码热更新、新建 controller**、方法级改行为、表达式求值、声明式 Conf、Bean·XML、改代码自动热替换、Spring bean 注入 mock、日志级别热调 |
| `mock` | ta_mock_url / ta_mock_method / ta_mock_results / ta_capture / ta_sql | URL/方法级 mock、返回值篡改、流量捕获、**SQL 拦截模拟** |
| `startup` | ta_startup / ta_lazy_module | 启动耗时报告（慢 bean 直指）、模块级懒加载 |
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
| 不知道挂了几台、怎么连 | `ta_discover` / `ta_attach`（动态挂载） |
| 改过什么、想回滚 | `ta_history` / `ta_restore` |

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

自动化回归：核心功能 29 断言 + Arthas 差距补齐 26 断言（JDK8+spring2 与 JDK21+mybatis 双基线全绿）+ 自动登录 13 断言 + lazy-module/solon 专项 e2e。完整教程与 API 参数 Schema 见 TestAgent 仓 `docs/testagent-user-guide.md`（MCP 工具映射见其附录 B）。

## 前置

- 目标 JVM 已挂载 TestAgent（启动 `-javaagent` 或 `ta_attach` 动态挂载），HTTP API 默认 `http://127.0.0.1:8564`（env `TESTAGENT_URL`）
- 编译基线 Java 11，运行 Java 8+（Spring Boot 2/3、javax/jakarta 通吃；Solon 2.x/3.x 双兼容）
