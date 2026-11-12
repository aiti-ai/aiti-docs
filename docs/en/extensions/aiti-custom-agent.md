---
title: Custom Agent (aiti-custom-agent)
icon: 🧩
description: Register custom session backends with a UI form — launch command + args prefix + member env + bridge mode, hot effective on save; generic driver one-shot spawn (dockerized / command wrapping / multiple configs for the same CLI)
---

# aiti-custom-agent

> ❝ **One command line, one backend.** ❞

Custom agent registry: the toolbar 🧩 opens the management panel (list + form), registering "launch command + args prefix + env vars + bridge mode" as backends for new sessions — **no JSON writing at all**, hot effective on save (unregister/register hot update; on failure, fall back to an extension reload).

## Typical scenarios

- Claude Code running in docker (isolated from the host, `-v ${cwd}:${cwd} -w ${cwd}` same-path mount + `--add-host` to reach back to the bridge)
- Multiple configs for the same CLI side by side (work/personal accounts: two members with different env, each with its own label)
- One-shot tasks in docker (task text on stdin, stdout streamed into the session)
- Command wrapping (proxy/audit/init scripts: args prefix)

## Form fields

| Field | Description |
|---|---|
| Display name / id | Picker display name / provider type (auto-generated slug, editable) |
| Driver type | Generic command (generic one-shot) or protocol delegation (claude/codex/zcode/cursor/qoder/acp/codebuddy/pi — via the base extension's `ctx.services` `<extId>.launch` service; alias agentKey owned by the base extension, priority 5 claimed direct-connect first; if the service is absent it is not registered and fails loud). Protocol drivers can further pick a "delegated member" (multi-member families like ACP; default decided by the base extension); leaving "Command" empty = that driver's default CLI (claude/codex/zcode/cursor/qoder/acp/codebuddy/pi); filling it wraps the launch and hands it to the launch service |
| **Prefix command** (dropdown) | Default "None" = run "Command" directly; wrap the real CLI with docker / ssh / env / proxychains **etc.** — picking any option replaces `command` with that wrapper tool and expands the corresponding structured fields ("Custom" accepts any wrapper command: sudo / nix-shell / podman / timeout…); any change recomputes "Command + args prefix" on the spot, and the panel shows an "Actual execution: …" preview |
| Command + probe | Auto-filled by the wrapper type when chosen (`docker`/`ssh`/`env`/`runsocks`; editable, e.g. swap to podman); the probe button verifies executability on the spot (ENOENT = failure) |
| Args prefix | One arg per line, prepended before the driver's built-in args; supports `$VAR` / `${cwd}` (session working directory). Generated from the structured fields when a prefix command is active, still editable (editing a structured field rewrites it from the template) |
| Env vars | Member-level key-values, highest priority; secrets should reference the parent process env via `$VAR` |
| Bridge mode | Inherit / host.docker.internal (host replaced, port/path kept) / custom URL / off |
| Probe / order / enable | The probe command is pre-filled per wrapper type (`docker version` / `ssh -V` / `env` / tool name; manual entries are not overwritten); default = the command (exit code not judged; binary existing = alive); smaller order sorts first |

### Prefix commands: four wrapper families

| Prefix command | Structured fields | Generated result (`command` + args prefix) |
|---|---|---|
| docker | Run-mode dropdown (`run --rm -i` / `run --rm -it` / `run --rm -i --network host` / `compose run --rm` / `exec -i`), image or container name, in-container command, extra args (with a "＋ common options" dropdown: `--add-host=host.docker.internal:host-gateway`, `--network host`, `-v ${cwd}:${cwd} -w ${cwd}`, host `~/.claude` / `~/.codex` mounts) | `docker run --rm -i -v ${cwd}:${cwd} -w ${cwd} --add-host=… <image> claude` |
| ssh | Target `user@host`, port (auto-inserts `-p`), remote command, extra options (default `-t`) | `ssh -t -p 2222 wind@host claude` |
| env | Temp var lines (`KEY=VALUE`), wrapped command | `env FOO=bar HTTPS_PROXY=$HTTPS_PROXY claude` |
| Custom | Tool name goes in the "Command" box (any executable: sudo / nix-shell / podman / timeout / firejail…), extra args, wrapped command | `sudo -E claude` / `nix-shell --run claude` |
| runsocks | Proxy tool dropdown (runsocks / proxychains4 / proxychains), extra args (e.g. `-f` config file), wrapped command | `proxychains4 -f /etc/proxychains.conf claude` |

"Custom" is the fallback for the "etc.": wrapper commands outside the four presets all go through it; when a preset type is chosen the "Command" box is auto-filled with the tool name and stays read-only (it will not drift from the template); for podman and the like choose "Custom".

Storage is unchanged (still the two items `command` + `argsPrefix`), so old configs keep working; opening an old member reverse-derives the structured fields (docker's run mode/image/value-bearing options are all restored in order), and you never see the raw multi-line args.
Migration rule at selection time: the original "command + args prefix" string is moved wholesale into the "in-container/remote/wrapped command" field (original args included), losing nothing; when switching between wrappers this real CLI travels along (choosing "None" keeps the current command/args as-is and hands them back for manual editing).

## generic driver semantics

One-shot task type: `prompt` goes to stdin → stdout streams block by block (`message_update`) → process exit wraps up (`message_end` + `agent_settled`); abort kills the process (SIGTERM → 3s → SIGKILL). The capability surface is declared honestly: only the core four + getMessages; model/permission/fork/queue etc. are all false. History in local JSONL (`<configDir>/sessions/<id>.jsonl`); at P1 it does not enter All Sessions (provider carries no agentKey, host writes no placeholder file).

Launch resolution reuses the shared layer `dev-repo/_shared/agent-spawn-env.ts`'s `resolveCliLaunch` (same recipe for this extension and the 8 agent extensions: env merge order = base/governance passthrough → auto `AITI_BRIDGE_URL` → member env → bridge rewrite; `$VAR`/`${cwd}` expanded at spawn).

## Endpoints

- `GET /api/extensions/aiti-custom-agent/agents` → `{agents:[{...member, probe, registered, registryKey}], warnings}`
- `POST /agents` (create; duplicate id 409) / `PUT /agents/<id>` (update/rename) / `DELETE /agents/<id>`
- `POST /probe`: `{id}` re-probes a stored member / `{command, probe}` on-the-spot form probe
- `POST /reload`: rebuild the registry wholesale; `POST /selftest`: generic handle event-stream self-test

## Storage

`<configDir>/agents.json` (internal format, read/written by the UI; registered in `aitiConfigs.configFiles` into the backup whitelist). Advanced users can edit the file directly (`env` supports line-style KEY=VALUE / -NAME); invalid entries are skipped with a warning instead of failing wholesale.
