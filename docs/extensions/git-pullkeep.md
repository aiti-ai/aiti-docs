---
title: git-pullkeep（保留脏工作区的 pull）
icon: 🩹
ext:
  id: git-pullkeep
  name: git-pullkeep 保留脏工作区 pull
  description: git pull 被脏工作区挡住时，只把真正挡路的文件收进带标记的临时提交，拉完拆回未提交状态——staged 状态保留、未跟踪文件挪 aside 保住、其余脏文件全程不动；git pull 全选项透传的 drop-in 替代（--rebase 场景等价替代 pull --rebase --autostash）
  soul: 挪得最少、证明没动别的、每一步可回滚——stash 不再是拉代码的过路费。
  type: cli-tool
  category: 命令行工具
  version: 0.1.4
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: "https://github.com/aiti-ai/git-pullkeep"
  npm: "git-pullkeep"
  install: |
    # npm（Linux / macOS / Windows Git Bash）：
    npm install -g git-pullkeep
    # 国内镜像 raw 安装（免 npm）：
    curl -fsSL https://gitee.com/aiti-ai/git-pullkeep/raw/main/install.sh | GIT_PULLKEEP_REPO=https://gitee.com/aiti-ai/git-pullkeep/raw sh
    # AI agent 技能（Claude Code / Codex / Cursor / OpenCode / pi，Agent Skills 格式）：
    npx skills add aiti-ai/git-pullkeep
  license: MIT
  tags: [git, pull, autostash, stash, dirty-worktree, sync, cli, multi-machine]
  installable: false  # 独立 CLI 工具——不进 aiti-agent/pi-web 扩展体系：extman 不列出、extensions.json 归 integrations
---

# git-pullkeep（保留脏工作区的 pull）

> ❝ **挪得最少、证明没动别的、每一步可回滚——stash 不再是拉代码的过路费。** ❞

`git pull` 被脏工作区挡住（`Your local changes would be overwritten`）时，惯用解法是 stash / autostash：
整棵树收走、staged 状态丢失、恢复冲突时冲突标记撒满不相关文件、未跟踪文件与上游新文件同名直接中止。
**git-pullkeep** 换一种做法：只把真正挡路的文件收进一条带标记的临时提交（`wip: pullkeep temp commit` +
`pullkeep-temp:` trailer），拉取完成后拆回未提交状态——本地改动、暂存状态、未跟踪文件全部原样保留。

## 核心能力

- **git pull 全选项透传**：策略类（`--rebase[=merges]`/`--no-rebase`）、fetch 族（`--prune`/`--tags`/
  `--force`/`--depth`/`--unshallow`/`--recurse-submodules`/`--negotiation-tip`…）、merge 族（`--no-ff`/
  `-X`/`-s`/`--log`/`--stat`/`--signoff`/`--verify-signatures`）、`--set-upstream`、位置参数
  `<remote> <branch>`，未识别选项也透传（前向兼容，git 未来新参数照常可用）。`--autostash`/`--no-autostash`
  接受并忽略。`--rebase` 场景等价替代 `git pull --rebase --autostash`。
- **只挪最少**：无重叠时零文件被挪、原生拉取直接完成；merge 模式把重叠之外的 staged 条目一并收进
  （git merge 拒绝 index≠HEAD，staged 与挡路文件同等对待）；`--rebase` 模式收进全部脏文件（变基要求
  干净树）后原样还原。
- **未跟踪撞名保户**：上游新增文件与本地未跟踪文件同名时，autostash 直接中止拉取；pullkeep 把本地版
  挪进 `.git/pullkeep-aside/<stamp>/`、拉取继续、上游版本落地、本地版随时可取回。
- **可审计**：操作前快照进 `refs/pullkeep/<stamp>`（非 stash，分支不移动），索引树记录进
  `.git/pullkeep-meta/`；收尾时前后 `status --porcelain` 逐条 diff 并打印——"有没有动到别的东西"
  是核对出来的事实。
- **`--undo` 精确还原**：含未跟踪文件、staged 状态、乃至 staged≠工作区的双层内容。
- **中断安全**：临时提交带机器可读标记（`pullkeep-temp:` trailer，gc/重克隆/分支移动后仍可识别），
  下次运行拒绝叠层（exit 31）并指路 `--recover` / `--continue` / `--undo`；`--recover` 只在答案唯一时
  动手，已发布的临时提交只报告不重写。
- **并发锁**：写模式在公共 git 目录取 `mkdir` 原子锁（exit 35 = 等一等），同一仓库的多个 worktree
  也被串行化；持锁进程死亡自动回收。
- **AI 可采用**：随包分发 Agent Skills 格式技能（`skills/git-pullkeep/SKILL.md`）——`npx skills add
  aiti-ai/git-pullkeep` 装进 Claude Code / Codex / Cursor / OpenCode / pi，agent 自主判断何时替代
  `git pull --autostash`。

## 与 `git pull --autostash` 对比

| | git-pullkeep | `git pull --autostash` |
|---|---|---|
| 挪动的文件 | 只挪真正挡路的几个 | 整棵工作区 |
| 恢复冲突风险 | 未涉及的文件从未移动，不可能冲突 | 一次大三方合并，可能卡在 stash pop 中间态 |
| staged 状态 | 跨全流程保留 | 丢失（全部变未暂存） |
| 未跟踪 vs 上游新文件 | 挪 aside 保住本地版，拉取继续 | 拉取直接中止，需手动挪走 |
| 中断恢复 | 标记化临时提交 + `--recover`/`--undo` | 散落 stash 条目人工考古 |
| 并发运行 | 原子锁串行（exit 35） | 无协调，双跑互踩 index |
| 回滚 | `--undo` 精确还原操作前状态 | 无 |

## 工作原理（六步）

1. `git fetch`，计算 `incoming = base..upstream` 与 `dirty = HEAD..工作区`
2. `blocking = incoming ∩ dirty`；未跟踪撞名文件挪 aside；modify/delete 冲突提前告警
3. 脏工作区快照 → `refs/pullkeep/<stamp>`（同时记录索引树，`--undo` 据此精确还原）
4. `git commit --only -- <挡路路径>`：只含这些路径的临时提交（带标记）
5. `git pull <你的参数>`——这些路径已干净
6. `git reset --mixed <新上游>` 拆掉临时/合并提交层，重放 staged 状态；前后 status diff 核对

## 用法速查

```sh
git pullkeep                 # merge；脏工作区下直接拉，挡路文件自动收进/拆回
git pullkeep --rebase        # 等价替代 pull --rebase --autostash
git pullkeep --dry-run       # 只分析：上游进了什么、谁挡路，不改任何东西
git pullkeep --undo -y       # 精确回滚到操作前的工作区
git pullkeep --continue      # 冲突解决后拆掉临时提交层
git pullkeep --recover       # 收敛中断运行残留的临时提交
git pullkeep --check         # CI 门禁：需要挪文件则 exit 10
```

冲突（exit 20）时改动不会丢：解决后 `git add` + `--continue`，或 `git merge --abort` + `--undo -y`
原地离场。`--ff-only`/`--squash`/`--no-commit`/`--all`/`--rebase=interactive` 仅在确实需要收进文件时
拒绝（exit 21 附原因），无重叠的原生拉取原样透传、由 git 自己裁决。

## 延伸阅读

- GitHub: <https://github.com/aiti-ai/git-pullkeep>（双语 README：动机 / 对比表 / 安全性 / 并发 / 局限）
- Gitee: <https://gitee.com/aiti-ai/git-pullkeep>（release 附带脚本与 man 页附件）
- npm: <https://www.npmjs.com/package/git-pullkeep>（provenance 签名发布）
- AI 技能：`skills/git-pullkeep/SKILL.md`（Agent Skills 开放格式，随 npm 包分发）
