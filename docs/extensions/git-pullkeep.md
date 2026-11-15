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

- **git pull 全选项透传**：`--rebase[=merges]` / `--no-ff` / `-X` / `-s` / `--set-upstream` / fetch 族全支持；
  `--autostash` 接受并忽略（保留改动本来就是它的全部工作）；未识别选项透传给 git（前向兼容）。
  `--rebase` 场景等价替代 `git pull --rebase --autostash`。
- **只挪最少**：无重叠时零文件被挪、原生拉取；staged 条目在 merge 模式自动一并收进（git merge 拒绝
  index≠HEAD）；未跟踪撞名文件挪 `.git/pullkeep-aside/<stamp>/` 保住本地版。
- **可审计可回滚**：操作前快照进 `refs/pullkeep/<stamp>`，`--undo -y` 精确还原（含 staged/未跟踪/
  staged≠工作区双层内容）；前后 `status --porcelain` 逐条核对并打印。
- **中断安全**：临时提交带标记（gc/重克隆后仍可识别），`--recover` / `--continue` 收敛；并发运行
  以 `mkdir` 原子锁串行（exit 35），不会在 index 上互踩。
- **AI 可采用**：随包分发 Agent Skills 格式技能（`skills/git-pullkeep/SKILL.md`）——`npx skills add
  aiti-ai/git-pullkeep` 装进 Claude Code / Codex / Cursor / OpenCode / pi，agent 自主判断何时替代
  `git pull --autostash`。

## 安装

```sh
npm install -g git-pullkeep
# 国内免 npm：
curl -fsSL https://gitee.com/aiti-ai/git-pullkeep/raw/main/install.sh | GIT_PULLKEEP_REPO=https://gitee.com/aiti-ai/git-pullkeep/raw sh
# Windows (PowerShell 5.1+)：irm https://gitee.com/aiti-ai/git-pullkeep/raw/main/install.ps1 | iex
```

要求 Git ≥ 2.23、bash ≥ 3.2；Windows 始终用 `git pullkeep` 子命令形式（Git for Windows 自带 bash
执行，免疫 WSL bash 抢占）。单文件零依赖，装好即被 git 发现（`git help -a | grep pullkeep`）。

## 用法速查

```sh
git pullkeep                 # merge；脏工作区下直接拉，挡路文件自动收进/拆回
git pullkeep --rebase        # 等价替代 pull --rebase --autostash（变基要求干净树，全部脏文件收进后还原）
git pullkeep --dry-run       # 只分析：上游进了什么、谁挡路，不改任何东西
git pullkeep --undo -y       # 精确回滚到操作前的工作区
git pullkeep --continue      # 冲突解决后拆掉临时提交层
git pullkeep --recover       # 收敛中断运行残留的临时提交
git pullkeep --check         # CI 门禁：需要挪文件则 exit 10
```

冲突（exit 20）时改动不会丢：解决后 `git add` + `git pullkeep --continue`，或 `git merge --abort` +
`--undo -y` 原地离场。完整动机 / 对比表 / 局限见仓库双语 README。

## 仓库

- GitHub: <https://github.com/aiti-ai/git-pullkeep>（CI 三平台矩阵 + npm provenance 发布）
- Gitee: <https://gitee.com/aiti-ai/git-pullkeep>（release 附带脚本与 man 页附件）
