---
title: aiti-video-studio（视频工作室）
icon: 🎬
ext:
  id: aiti-video-studio
  name: aiti-video-studio 视频工作室
  nameEn: "Video Studio"
  description: 把 scene.json 脚本确定性回放成演示视频——浏览器/桌面录制、TTS 旁白、光标与覆盖层、转场、字幕、多格式导出
  descriptionEn: "Video Studio — deterministic replay recording (CDP jpeg-stitch), cursor/overlays/effects/camera/transitions/speed-ramp/frame polish, edge-tts or OpenAI-compatible narration, ffmpeg subtitles/chapters/formats, generative media with dependency scheduling, subtitle review; produces demo videos (mp4/srt/vtt/report)"
  soul: 写好脚本，一键出片。
  type: extension
  category: 媒体
  version: "0.13.2"
  status: active
  author: aiti-ai
  publisher: aiti-ai
  website: https://aiti.pw
  repo: https://github.com/aiti-ai/aiti-ai/tree/main/extensions/aiti-video-studio
  npm: "@aiti-ai/aiti-video-studio"
  license: MIT
  tags: [video, demo, recording, playwright, tts, desktop, overlay, ffmpeg]
---

# aiti-video-studio（视频工作室）

> ❝ **写好脚本，一键出片。** ❞

用 `scene.json` 描述操作 → 确定性录制 → TTS 旁白 → 合成 `final.mp4`。AI 只参与创作期；
录制和合成阶段零 AI，可重复回放。

## 安装

在 pi-web 的扩展管理器中启用 **aiti-video-studio**，或安装 npm 包/源码部署后重启 pi-web。

首次使用需要：

- `ffmpeg` / `ffprobe`：优先使用系统 PATH；缺少时可走扩展内的便携下载（Linux/Windows）。
- Chromium：Playwright 浏览器（桌面录制可选）。
- TTS：`edge-tts`、本地 OpenAI-compatible 服务，或 OpenSSL/厂商 key。

## 系统音频（应用声音 / 系统声音）

默认 `system.audio.system: false`，只录画面 + 后期 TTS，不需要系统回环设备。

需要录制真实应用声音时，先准备虚拟音频设备：

### Windows：VoiceMeeter（已实测安装路径）

**2026-11-22 实测（Windows 11 26200 x64）**：VoiceMeeter 1.1.3.0 安装成功，音频驱动注册为 `VB-Audio Voicemeeter VAIO`，ffmpeg 可枚举 `Voicemeeter Out 1..8`；dshow 实采 44.1kHz stereo WAV 正常。默认输出/B1 路由仍需按下面步骤配置，安装驱动后需重启。

> **SSH-only 主机注意**：Windows OpenSSH 会话运行在 session 0，没有登录桌面；VoiceMeeter 应用与默认输出/B1 路由都需要交互桌面会话。若机器无人值守，需先 RDP/本地登录一次再配置路由。

官方安装包：`VoicemeeterSetup_v1130.zip`（VB-Audio 官网下载）。

1. 解压后以管理员身份运行 `voicemeetersetup.exe`。
2. 安装完成后重启 Windows（音频驱动需要重启生效）。
3. 启动 **VoiceMeeter x64**。
4. Windows 设置 → 系统 → 声音 → 输出：
   - 选择 **VoiceMeeter Input (VB-Audio VoiceMeeter VAIO)**
5. VoiceMeeter 内：
   - **A1** 选择真实扬声器/耳机（用于监听）
   - 虚拟输入条（VoiceMeeter Input）打开 **B1**
   - 确认该条未静音、Gain 正常
6. 验证 ffmpeg 能枚举设备：

```powershell
ffmpeg -hide_banner -list_devices true -f dshow -i dummy
```

应看到：

```text
"Voicemeeter Out 1 (VB-Audio Voicemeeter VAIO)" (audio)
```

7. scene 配置：

```json
"system": {
  "audio": {
    "system": true,
    "device": "Voicemeeter Out 1 (VB-Audio Voicemeeter VAIO)"
  }
}
```

8. CLI 可先用：

```bash
node cli/aiti-video-studio.mjs audio-devices --json
```

确认设备名后再录制。

#### 排查

- 只有麦克风、没有 `Voicemeeter Out`：VoiceMeeter 驱动未安装成功/未重启。
- 有设备但录到静音：检查默认输出是否为 `VoiceMeeter Input`，虚拟输入条 B1 是否打开，VoiceMeeter 是否正在运行。
- 声音有回声：VoiceMeeter 的 A1 监听和 B1 录制同时开启时，避免再把系统输出接到其他虚拟设备。

#### 更简单的替代：VB-CABLE

只想要一条虚拟线时，可安装 **VB-CABLE**：

- 播放默认设备设为 `CABLE Input`
- ffmpeg 捕获 `CABLE Output`
- scene 使用 `system.audio.device: "CABLE Output (VB-Audio Virtual Cable)"`

VoiceMeeter 适合需要同时监听、调音、多路输入的场景；VB-CABLE 适合单路系统声音采集。

### macOS：BlackHole 2ch

1. 安装：

```bash
brew install blackhole-2ch
```

2. 打开 **Audio MIDI Setup**，创建 **Multi-Output Device**：
   - 勾选 `Built-in Output`
   - 勾选 `BlackHole 2ch`
3. 系统声音输出切到该 Multi-Output Device。
4. scene：

```json
"system": {
  "audio": {
    "system": true,
    "device": "BlackHole 2ch"
  }
}
```

macOS 11 上不要用 AVFoundation 直接抓屏幕音频；使用虚拟声卡 + screencapture/ffmpeg 组合。

### Linux

PulseAudio/PipeWire：

```json
"system": {
  "audio": {
    "system": true,
    "device": "auto"
  }
}
```

`auto` 会优先选择 `.monitor` source；也可用 `audio-devices` 查看后手填。

## AI 工具（ai-decide / ai-fix）

两个运行时 AI 介入点都能**先查现场再回答**：

```text
ai-decide → {"tool":"page.snapshot"} → tool-result → {"tool":"page.click",...} → {"value":"..."}
ai-fix    → {"tool":"page.snapshot"} → tool-result → {"patch":{"selector":"#real"}}
```

- 协议：JSON-in-text（宿主通道只有文本），pi-web / 导出端点 / CLI `--ai-url` 三入口一致。
- 工具在 runner 内执行（它持有 live page）；server 驱动循环：总预算 90s、最多 8 轮、单工具 10s、连续 2 次工具错误熔断。
- 浏览器工具：`page.info/snapshot/screenshot/assert/console/network/click/dblclick/hover/type/press/scroll/waitFor`、`cdp.snapshot`、`cdp.send`。
- 桌面工具：`desktop.windows/screenshot/assert/click/dblclick/type/key/scroll/focus/window`。
- CDP 默认白名单（`DOM.*`、`Page.getLayoutMetrics`、`Page.captureScreenshot`、`Runtime.getProperties`）；`Browser/Target/Network/Storage/Fetch/Debugger/Profiler/Security/Emulation` 与 `Page.navigate`、`Runtime.evaluate` 永禁。
- 隐私打码生效：scene `redact` 命中的元素文本在进入模型前被掩码（初始证据与 `page.snapshot` 都处理）。
- 诊断：console / pageerror 与失败请求（HTTP ≥400）进环形缓冲，**并进入决策/修复的初始证据**；也可用 `page.console` / `page.network` 主动查。
- 审计：`status.json` 的 `toolCalls`（名称/参数摘要/耗时/错误）+ `<runDir>/ai-tools.jsonl`（完整 args/result，可复盘）；面板概览有可折叠列表。
- 开关：`ai.tools.enabled`、`ai.tools.mutations`（默认开）、`ai.tools.vision`（默认关）、`ai.tools.maxCalls`、`ai.tools.allowAnyCdp`（默认关）。

### Vision（看图）

`ai.tools.vision: true` 时，决策/修复的截图作为图片附加给模型，模型自己 `page.screenshot` 截的图
也会在下一轮附上（单图 ≤2MB）。需要支持视觉的模型（实测 `zai-coding-cn/glm-5.3-flash`、
`opencode-go/hy4-flash-free`）。scene `redact` 打码在截图上天然生效（CSS filter 作用在渲染结果上），
所以开图不会绕过隐私规则。

### 结果校验回环（`until`）

```jsonc
{ "action": "ai-decide", "id": "fill", "output": "var:name",
  "prompt": "填表并提交",
  "until": { "selector": "#created", "state": "visible", "timeoutMs": 2000, "retries": 3 } }
```

AI 回答后 runner 会校验目标状态；不满足则把失败原因 + 重读的现场回灌，让模型继续操作，
默认最多重试 3 次（`retries: 0` 直接失败）。

- 浏览器：`{ selector, state: visible|hidden|attached|detached|text }`（`page.assert`）
- 桌面：`{ window: "标题", state: exists|absent|focused|title }`（`desktop.assert`，无 DOM）
- **可写数组**：`until: [{…}, {…}]` 全部成立才通过，失败会指明第几条（`#2/3`）

### 修复前验证（ai-fix）

模型提出的 patch 在**应用前**先用 `page.assert` 验证（`selector` 与 `fx[].selector` 是否存在），
不存在就回灌「patch rejected」+ 重读 DOM 让它在同一轮改——不会白耗一次 `heal.maxFixes`。

## 桌面捕获

```json
{
  "surface": "desktop",
  "system": {
    "capture": { "fps": 30 },
    "audio": { "system": true, "device": "auto" }
  }
}
```

桌面录制依赖 X11/Wayland 会话；Windows 需要登录的交互会话，macOS 需要屏幕录制权限。

## 生成式素材

- `ai-gen-image` / `ai-gen-video`
- `generation.provider`：`mock` / `zhipu` / `pollinations` / `cloudflare` / `openai`
- `generation.fallback` 可配置降级链
- provider key 支持 `generation.apiKeyVault` / `tts.apiKeyVault`（aiti-secret-vault alias，不落 scene）

## CLI

```bash
node cli/aiti-video-studio.mjs check  ./demo
node cli/aiti-video-studio.mjs record ./demo
node cli/aiti-video-studio.mjs compose ./demo --run <runId>
node cli/aiti-video-studio.mjs doctor
node cli/aiti-video-studio.mjs audio-devices
node cli/aiti-video-studio.mjs vault-list
```

`--ai-url` 可直接指向 pi-web 导出的：

```text
/api/extensions/aiti-video-studio/ai/chat/completions
```

无需外部 OpenAI 网关。

## 数据

- scene/run/资产：`~/.pi/web/data/aiti-video-studio/state`
- TTS 缓存：`.../cache`
- 生成素材：工程内 `assets/gen/`
