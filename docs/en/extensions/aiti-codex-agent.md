---
title: Codex Session Backend (aiti-codex-agent)
icon: 🟦
description: OpenAI Codex CLI driver — exec --json + resume integrated into All Sessions; dual-track auth (auth.json OAuth / openrouter env), live streaming and cold replay render identically-shaped native tool cards
---

# aiti-codex-agent

> ❝ **Wherever Codex runs, the panel watches.** ❞

OpenAI Codex CLI session backend: drives the codex CLI with `exec --json`, supports resume, and plugs into the All Sessions multi-agent frontend.

## Mechanism

- Protocol: `codex exec --json` (verified on codex-cli 0.149)
- Event stream: `thread.started` → `item.completed` (agent_message / command_execution etc.) → `turn.completed` (with usage) or `turn.failed`
- Resume support: restores an existing session from thread_id
- **Takeover / cold-restore replay**: history is parsed from the rollout by the session-manager codex adapter (`function_call` and `function_call_output`
  paired into structured tool rows by `call_id`) → `seedHistory` is replayed into pi-native tool cards via the shared layer `@aiti-ai/ext-shared/seed-tool` (v0.1.1);
  the session root can be overridden with `AITI_CODEX_HOME`; the real model source is `turn_context.payload.model` (codex has no init frame)
- **Live and replay share one shape (plan X landed)**: live tool items emit native `assistant.toolCall`+`toolResult` (collapsed by callID) — no more 🛠 custom cards; cold replay and live streaming render identically
- **Capability surface**: prompt/abort/contextUsage/getMessages/followUp/queueManage/setModel (next turn `-m`)/getUsage/listModels/fileAttachments (`-i --image`) ✅; steer ❌

## Dual-track auth

`~/.codex/auth.json` (ChatGPT OAuth) and third-party providers (`model_providers.*` in `~/.codex/config.toml` decides the actual routing, e.g. openrouter, with the key via env) coexist — **auth.json being present ≠ effective credentials**. Login-state probing order: auth.json → env `OPENAI_API_KEY` → env `OPENROUTER_API_KEY` (ready on first hit). The account quota panel reads the auth.json token (`chatgpt.com/backend-api/wham/usage`).

## 🔑 Controlled login (ext-controlled-login standard, 2026-09-08)

The toolbar **🔑 Login** (initiated via the aiti-agent-manager panel) in one click: the backend spawns the official CLI device-code login (`codex login --device-auth`); **just open the authorization page in a browser on any device and complete authorization** — credentials are written to disk automatically by the official CLI, and the extension's existing credential chain picks them up automatically.

- API: `POST /api/extensions/aiti-codex-agent/login/start` (idempotent) · `GET /login/status` · `POST /login/cancel`
- State machine: waiting (spinner) → success ✅ / failed / timeout / cancelled, all with retry; while the dialog is open it polls status every 2s and stops on close
