---
title: pi-secret-vault（加密密钥库）
icon: 🔐
ext:
  id: pi-secret-vault
  name: pi-secret-vault 加密密钥库
  description: pi 的加密持久密钥库——/vault add 掩码录入，模型只拿 rsec_<hash8> 稳定令牌（vault_list / vault_get），工具执行前自动还原真值；AI 只读、值 AES-256-GCM 加密落盘（keyfile / 系统钥匙串）、session JSONL 零真值
  descriptionEn: "Encrypted secret vault for pi: store credentials once (/vault add, masked input), let the model query aliases (vault_list / vault_get → opaque rsec_ tokens) and pass those tokens into any tool argument, where the runtime substitutes the real value. AI is read-only; values never enter the chat, the session file, or the wire payload. Superset of @aiti-ai/pi-secret-mask (same engine; same-session coexistence resolves to the vault)."
  soul: 库在你手，令牌给 AI。
  type: pi-plugin
  category: pi 插件
  version: 0.3.1
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: ""
  npm: "@aiti-ai/pi-secret-vault"
  install: |
    pi install npm:@aiti-ai/pi-secret-vault
  license: MIT
  tags: [pi, plugin, secrets, vault, encryption, security, keychain, credentials]
  installable: false  # pi 插件——装进 ~/.pi/agent，不进 aiti-agent/pi-web 扩展体系
---

# pi-secret-vault（加密密钥库）

> ❝ **库在你手，令牌给 AI。** ❞

pi 的**加密持久密钥库**，`pi-secret-mask` 的超集：值只进本机加密库，模型只拿到不可解的稳定令牌，工具执行前由运行时替换真值。

```text
你:        /vault add openai-key        （掩码输入——值不进对话）
模型:      vault_list()                 → openai-key — OpenAI 生产 key (llm)
模型:      vault_get("openai-key")      → rsec_a1b2c3d4   （挂载到本会话）
模型:      bash("curl -H 'Authorization: Bearer rsec_a1b2c3d4' …")
运行时:    执行前替换为真值；输出回显被反向脱敏
```

## 为什么不用 mask 的会话登记

`pi-secret-mask` 是纯会话级（重启即失、值只在进程内存）。需要**跨会话/跨重启**的密钥时：

- 令牌由别名派生（`fnv1a("vault:"+alias)`）→ 重启后 `/vault unlock` + `vault_get` **复活同一令牌**，历史引用继续有效
- 值 AES-256-GCM 加密落盘，session JSONL 只存令牌（`vault` landing 为默认）
- AI **只读**：没有写库/查看明文的工具，注入的模型改不了也读不到库

两个包共享 `@aiti-ai/secret-mask-core` 引擎；同一会话同时安装时**握手互斥，vault 优先**（mask 自动停用）。

## 命令（仅人类）

| 命令 | 说明 |
|---|---|
| `/vault add <alias> [desc] [--project] [--tags a,b]` | 掩码输入；首次写自动建库（keyfile，无口令）；同名 = 轮换（version+1） |
| `/vault set <alias>` | 轮换现有别名（令牌不变、值更新） |
| `/vault capture <alias> -- <command>` | 命令 stdout 直接入库（≤4KB、10s 超时、不回显） |
| `/vault import <file.env>` / `import-env` | 批量导入 / 扫描当前进程环境变量 |
| `/vault list [--global\|--project]` | 别名 + 元数据（零值） |
| `/vault get <alias>` | 挂载别名（只打印令牌） |
| `/vault reveal <alias>` | 弹窗 + 剪贴板，**绝不进对话/会话** |
| `/vault remove <alias>` / `forget` | 删除（需确认）/ 卸载本会话全部别名（占位符失效，guard 拦截） |
| `/vault scope` / `mode` / `lock` / `unlock` / `status` | 路径、解锁模式、锁态、统计 |
| `/secret …` | 会话级命令全集（landing/guard/strict/rules/save/load/audit） |

## AI 工具面（只读）

| 工具 | 返回 |
|---|---|
| `vault_list {tag?}` | 别名、scope、说明、标签、版本、最近使用——**永不含值** |
| `vault_get {alias}` | 稳定令牌 `rsec_<hash8>` + 使用约定（“这个令牌就是可用凭据，原样传进工具参数”）；库未初始化/锁定/别名不存在 → 可操作的错误提示 |

### 模型侧契约（防“自我怀疑”循环）

只要本会话挂载了令牌、或对话里出现过令牌形状，扩展就注入 `secret_masking` 系统提示段（与 pi-secret-mask 共用同一 key，只有生效方写入）。除“原样传参”外，明确交代三类诱导模型误判的场景：

- **令牌会出现在模型自己的历史里**：往上下文送的路上文本被改写成令牌，写入本身已带真值落盘——看到令牌=机制生效，不是模型写错、不是损坏、不是“随机生成器”。
- **禁止“修复”**：不要为令牌道歉、不要重读文件“核查”、不要用“干净文本”重写（再写一次令牌是幂等，换成别的内容就毁掉真值）；令牌是确定性的，同一值永远同一令牌。
- **guard 拒绝 ≠ 令牌坏了**：`unresolved placeholder` 只表示该值未挂载在本会话，令牌本身格式合法；用 `vault_get <alias>` 重新挂载或请用户解锁，别重打/猜/替换，也别因此“清理”文件。

## 存储、解锁与威胁模型

```text
~/.pi/agent/secret-vault/
  master.key            32 字节，0600（keyfile 模式）
  config.json           {mode:"keyfile"|"keychain"}
  global.json           全局桶（元数据明文，值密文）
  vault.<cwdHash8>.json 项目桶（同名遮蔽全局）
  session-state.json    零值会话记录（只含别名）
```

- **解锁**：keyfile（默认，首写自动创建）或系统钥匙串（macOS `security` / Linux `secret-tool` / Windows DPAPI，均 10s bounded subprocess）；`/vault mode` 切换 = 重新生成密钥 + 全库重加密
- **加密边界（如实）**：加密的价值在“库文件离开本机”（备份/同步/误 push/失窃）；同 uid 恶意进程仍可读 keyfile，prompt injection 仍可把还原后的值塞进外联命令——本方案防意外泄漏与越权读写，不防恶意 agent。真正的收益大头是**边界 + 台账**：值不进 session 这个“无限复制通道”，N 处散落明文收敛为 1 处受控引用
- **fail-closed**：keyfile 丢失但库存在时拒绝新建密钥（不会把旧条目变成不可解却看起来正常）

## pi-web 管理面

配套扩展 **`aiti-secret-vault`** 在 pi-web 提供密钥库管理弹窗（别名增删改查/查看/锁定/模式切换 + 会话挂载总览），值同样不经过 AI 对话。详见 [aiti-secret-vault](./aiti-secret-vault.md)。

## 验证

- `npm test`：核心引擎 + 双包装配 + mock pi 全钩子接线 + keychain 假后端
- 真实 pi 加载冒烟；npmjs 正式包安装冒烟（写入/读取）
- 线上审计：`/secret audit on` 每次发送的最终 payload 扫描（`leaks=0` + 令牌计数）
