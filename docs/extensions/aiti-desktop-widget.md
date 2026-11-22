---
title: aiti-desktop-widget（通用桌面悬浮窗）
icon: 🪟
ext:
  id: aiti-desktop-widget
  name: aiti-desktop-widget 桌面悬浮窗
  description: 与业务无关的原生桌面窗口壳——无框/透明/置顶/可点击穿透/可拖动，内容一律 URL 或本地 HTML；多显示器定位 + stdin JSONL 控制；供 aiti-video-studio 实时字幕、悬浮图标/桌面宠物使用
  soul: 窗口能力归壳，内容归调用方。
  type: integration
  installable: false  # 独立桌面壳/CLI，不是 pi-web 扩展：extman 不列出，extensions.json 归 integrations
  category: 桌面与系统
  version: "0.2.0"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: "https://github.com/aiti-ai/aiti-ai/tree/main/integrations/aiti-desktop-widget"
  npm: "@aiti-ai/aiti-desktop-widget"
  install: |
    npm install -g @aiti-ai/aiti-desktop-widget
    aiti-desktop-widget --help
  license: MIT
  tags: [desktop, widget, tauri, overlay, caption, always-on-top, multi-monitor]
---

# aiti-desktop-widget（通用桌面悬浮窗）

> ❝ **窗口能力归壳，内容归调用方。** ❞

一个跨平台（Tauri 2）的**业务无关桌面窗口壳**：不关心你是字幕、悬浮图标、状态卡还是桌面
宠物；只负责把 `http(s)` 页面（或本地 HTML）渲染成无框、透明、置顶、可拖动/可点击穿透的桌面
窗口，并暴露 CLI + stdin JSONL 控制。

## 安装

```bash
npm install -g @aiti-ai/aiti-desktop-widget
aiti-desktop-widget --help
```

npm 包是启动器：平台二进制是 GitHub/Gitee Release 资产，首次运行用
[justget](https://www.npmjs.com/package/justget) 多源竞速下载（GitHub → Gitee → gh-proxy
等镜像），带 sha256 校验和按版本缓存。支持 Linux/Windows/macOS 的 x64 与 arm64。

也可以直接使用构建产物（[源码](https://github.com/aiti-ai/aiti-ai/tree/main/integrations/aiti-desktop-widget)）：

```bash
cargo build --release
# 或拷贝到视频工作室共享位置
mkdir -p ~/.pi/bin && cp target/release/aiti-desktop-widget ~/.pi/bin/
```

### 本地 / 离线安装

npm 包也可以从源码 checkout 打包安装，并预置二进制缓存（不依赖已发布的 Release）：

```bash
cd integrations/aiti-desktop-widget/npm && npm pack
npm install -g ./aiti-ai-aiti-desktop-widget-0.2.0.tgz --ignore-scripts
# Windows 上 npm 对本地 tarball 偶尔不建 shim：
npm rebuild -g @aiti-ai/aiti-desktop-widget
```

把构建好的二进制放进 `<cache>/<version>/<platform>/`，并在同目录写
`<sha256>  <release asset name>` 格式的 `checksums.txt`，启动器即完全离线运行。缓存路径：
Linux `~/.cache/aiti-desktop-widget/...`、macOS `~/Library/Caches/aiti-desktop-widget/...`、Windows
`%LOCALAPPDATA%\aiti-desktop-widget\cache\...`。详见 npm 包 README 的 “Local / offline install”。

## 常用命令

```bash
# 加载网页：900x140，透明、无框、点击穿透
aiti-desktop-widget http://127.0.0.1:8765/caption-bar.html --width 900 --height 140 \
  --click-through true

# 本地 HTML（壳内起 loopback 静态服务）
aiti-desktop-widget --html ./pet/index.html --root ./pet --width 220 --height 220 --draggable true

# 多显示器：选择 1 号屏并居中；x/y 是屏内相对坐标，缺省轴居中
aiti-desktop-widget http://127.0.0.1:8765/ --display 1 --center true

# stdin JSONL 控制（move / resize / center / displays / navigate / set / close）
echo '{"cmd":"move","display":1,"x":24,"y":800}' | aiti-desktop-widget http://...
```

完整参数、配置 JSON、stdin/stdout 事件、拖动/穿透/本地 HTML 的安全边界见
[README](https://github.com/aiti-ai/aiti-ai/tree/main/integrations/aiti-desktop-widget#readme)。

## 演示 Demo：透明歌词播放器

`demo/play/play.html` 是一个零依赖示例：播放音频 + LRC/SRT/VTT 歌词 + 当前行高亮 + 进度条 +
键盘控制，卡片默认半透明，`?bare=1` 去卡片，适合悬浮窗。

```bash
aiti-desktop-widget \
  --html '/abs/path/demo/play/play.html?file=assets/aiti-intro.mp3&lyrics=assets/aiti-intro.lrc' \
  --width 900 --height 320 --transparent true
```

参数：`file`（音频）、`lyrics`（`lrc|srt|vtt|subtitle`）、`title`、`artist`、`cover`、`theme=dark|light`、
`bg=transparent|none|颜色`、`bare=1`、`autoplay`（默认 1，打开即尝试播放）、`layout=auto|card|line`、`loop=1`、`volume`。
高度 ≤220px 或 `layout=line` 时自动切单行跑马灯：只显示当前行，长文按当前行进度横向滚动，歌词上叠与歌词等宽的当前行进度填充（karaoke 式覆盖歌词）。示例音频/字幕由
edge-tts + ffmpeg 合成，无第三方音频；`node demo/play/serve.mjs` 可本地预览。

## 页面控制与单行自适应（默认开）

loopback 页面默认获得 **窗口控制能力**（`capabilities/widget-page-control.json` +
`withGlobalTauri`）：可读写位置/尺寸/显示器、`setSize`/`setPosition`/`center`、尺寸约束、
`startDragging`/`startResizeDragging`、置顶/穿透/跨工作区/跳过任务栏/阴影/装饰/聚焦/标题、
hide/show/close 和 WebView zoom。能力只匹配 `127.0.0.1` / `localhost`；`--allow-remote true`
加载的外部页面不能调用。创建/销毁窗口、全屏/最大化、图标/徽标/进度、清数据/DevTools 等
破坏性能力不开。

`demo/play/play.html` 在单行模式下（`layout=line` 或高度 ≤220px）默认 `autosize=1`：按当前
歌词宽度调整窗口，**保持窗口中心不变**，长度自动伸缩；字号按高度固定以便测量。`autosize=0`
关闭。`--resizable false` 的 min=max 约束由页面先调用 `setMinSize`/`setMaxSize` 更新。
拖动仍是页面 DOM 的 `data-tauri-drag-region`，没有窗口级 `draggable` 属性。

## 与 aiti-video-studio 集成

**aiti-video-studio** 的桌面 `overlay` 字幕模式用
aiti-desktop-widget 打开 loopback 字幕页（`caption-bar.html?bubble=1`），通过 SSE 推送实时字幕；
窗口的透明/置顶/点击穿透归本壳，字幕内容与音画同步归视频工作室。`system.caption.style`
（字号/字重/颜色/背景/圆角，`background:"transparent"` = 纯文字）也通过本壳生效。

探测顺序：`AITI_WIDGET_BIN` → `~/.pi/bin/aiti-desktop-widget` → PATH；没有二进制时视频工作室会回退
GTK/Chrome 字幕。

## 平台说明

- **Linux**：需要 WebKitGTK 4.1 + GTK3；无 compositor 的 X11 可能把透明区渲染成黑色（壳本身
  仍可运行）。CI 在 Ubuntu 22.04/24.04 构建 x64/arm64。
- **Windows**：需要 WebView2 运行时（Win10/11 预装，含 ARM64）；二进制未签名。
- **macOS**：最低 **10.15（Intel）/ 11.0（Apple Silicon）**；可执行文件把 `Info.plist` 嵌入
  `__TEXT,__info_plist`（ATS localhost 例外 + `LSUIElement`），裸二进制可直接加载
  `http://127.0.0.1`，不必 `.app` bundle；实测在 11.7。

## 发布与测试

- GitHub Actions：tag `aiti-desktop-widget-vX.Y.Z` 构建 6 平台资产 + `checksums.txt`，创建 GitHub
  Release，镜像到 Gitee，并发布 npm 包。
- 本地：`cargo test`（定位/静态服务）、`node --test tests/shell.test.mjs`（GUI）、
  `node --test npm/test/download.test.mjs`（justget 下载/校验/缓存）。
- 设计/验证细节：工作区方案文档（`aiti-desktop-widget-overlay-shell-plan.md`）。
