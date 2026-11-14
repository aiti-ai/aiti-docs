---
title: AI 集成
icon: 🤖
description: 扩展接入 AI 的三条路——invokeAI 通用调用、server.agent per-session 扩展点、ai-helper 技能自管理
tags: [ext-dev, ai, agent, invokeAI, skills]
---

# AI 集成

扩展接入 AI 的三条正道，按需选用（可叠加）：

| 路线 | 一句话 | 典型场景 |
|---|---|---|
| `ctx.invokeAI` | 一次性 AI 调用（无状态） | 摘要/翻译/分类/审阅建议 |
| `server.agent.*` | 注入工具 + 订阅会话生命周期 | 给 agent 会话加自定义工具、监控、回流 |
| ai-helper 技能自管理 | 把扩展的使用方法教给 AI | AI 能自主操作扩展功能 |

## 1. `ctx.invokeAI`（通用 AI 调用）

core 最低层模型能力：**零业务逻辑、零统计封装**——prompt 组装/上下文/项目状态/token 记账
全部是调用扩展的责任：

```ts
const { text, provider, model, usage } = await ctx.invokeAI({
  provider?, modelId?,  // 缺省 = 全局最便宜的非 reasoning 模型（⚠️ 非当前会话模型）
  system?: "你是摘要助手",
  messages: [{ role: "user", content: longText }],
  maxTokens?, temperature?, reasoning?,   // reasoning 如 "off"，仅 provider 支持时生效
  caller: "myext-review/summary",   // 记账维度：建议按场景细分（缺省 ext.id）
});
// usage: { input, output, cacheRead, cacheWrite }
```

真实样例：aiti-ai-schedule 的 `invokeAI` 轻量问答模式（与 session 注入/一次性会话两模式并列为三）。

## 2. `server.agent`（per-agent-session 扩展点）

进程内、零配置地注入到**每一个** agent 会话：

```ts
server: {
  agent: {
    // 注入自定义工具（SDK ToolDefinition：name + label(必填) + description +
    // parameters(TypeBox/JSON Schema) + execute；execute 闭包直调进程内资源）
    agentTools(info) {   // info: { sessionId, cwd }
      return [{
        name: "my_tool",
        label: "My Tool",
        description: "...",
        parameters: { type: "object", properties: { /* JSON Schema */ } },
        async execute(_id, params) { /* ... */ },
      }];
    },

    // 会话创建（wrapper 建立后）：注册 agent 身份 / 绑定推送通道
    onAgentSession(info) {
      // info: { sessionId, cwd, steer(text), subscribeEvent?(listener), abortBash?(), getModel?() }
      const off = info.subscribeEvent?.((event) => { /* 完整事件流，含 bash 滚动输出 */ });
    },

    // wrapper 销毁（≠ 会话文件被删！）
    onAgentSessionEnd(info) {
      // info.reason: "shutdown"（真结束）| "fork"（fork 换壳，文件还在）| "idle"（10 分钟 GC，文件还在，下次访问重建）
    },

    // 一个 turn 结束（agent_settled）——把最终答案回流到桥/IM 等
    onAgentSettled(info) { /* info: { sessionId, text } */ },
  },
}
```

### ⚠️ 幂等铁律（踩过事故的）

`onAgentSession` **可能被重复调用**：

1. **idle GC → wrapper 重建**：10 分钟空闲回收后，同 id 再次触发；
2. **扩展热重载**：宿主 reload 后自动对存活会话重新挂接。

因此实现必须幂等：表项覆盖式写入；`subscribeEvent` 先退旧订阅再订新的。
宿主会在重新挂接前回收上一轮**经 `info.subscribeEvent` 建立**的订阅（订阅纪元账本）——
绕过它直接挂 wrapper `onEvent` 的订阅不在账本里，必须扩展自己退订。
`reload` 不发 `onAgentSessionEnd`。

### subscribeEvent 与事件过滤

`subscribeEvent` 是进程内直feed（绕过 SSE 出口过滤器——agent events 路由会丢弃
`tool_execution_update`，即 bash 实时滚动输出；扩展经此原样拿到）。

### 工具与 feature 联动

工具级 feature（`tool.<工具名>`）被禁用时，宿主注入侧自动过滤、执行侧立即拒绝（含已有会话）——
不用自己写开关判断（见[feature 指南](/ext-dev/features.md)）。整组工具建议再配一个
`agentTools.enabled` 总开关（默认关，helper 🤖 临时启用或 extman 开）。

真实样例：aiti-git-review（`aiti_review_*` 工具按会话门控注入评审任务会话）、
aiti-ai-usage（`subscribeEvent("message_end")` 实时摄入）。

## 3. ai-helper 技能自管理（扩展间约定）

> 这一条**不是宿主契约**——是 aiti-helper 扩展消费的约定（helper 聚合所有扩展的帮助点）。

在 entry 声明：

```ts
export default {
  id: "my-ext",
  ai: {
    manage: true,        // 出现「管理本扩展」帮助点
    intro: "一句话介绍", // 帮助点文案
    skills: "skills",    // 技能目录名（缺省 "skills"）
  },
};
```

目录组织（pi skills 标准）：

```
my-ext/
  skills/
    index.json          # 只列 skill 名（避免全目录扫描）
    do-thing/SKILL.md   # frontmatter = 元数据与 action；正文 = 操作指引
```

helper 聚合时遍历各扩展的 skills 目录 → index → 各 SKILL.md frontmatter 组装；
AI 按需读取 SKILL.md 学会操作你的扩展（AI 只注入一行 skill 路径，用 read 工具阅读）。
详见 [aiti-helper](/extensions/aiti-helper.md)。
