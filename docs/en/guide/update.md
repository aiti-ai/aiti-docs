---
title: Update
icon: arrows-rotate
description: Update aiti Web (@aiti-ai/pi-web) — version scheme and update steps for every install shape (pi-web update / installer / Docker / source)
tags: [guide, update]
---

# Update

Updating aiti Web always follows the same rhythm: **stop the server → update → start the server**. The exact command depends on your install shape — see below.

<LatestVersion />

## Version scheme

Versions look like `0.16.0` or `0.16.0-aiti.1` (Debian/Ubuntu style):

| Shape | Meaning |
|---|---|
| `X.Y.Z` | Upstream core version (the pi-web baseline) |
| `X.Y.Z-aiti.N` | aiti distribution build based on upstream `X.Y.Z`; rebuilds of the same baseline increment `N` (`-aiti.2`, `-aiti.3` …) |

Ordering follows dpkg semantics, not strict semver: the upstream `X.Y.Z` core dominates, and the fork suffix only breaks ties within the same baseline — `0.16.0-aiti.1` > `0.16.0` (strict semver would treat the suffix as a prerelease and sort it the other way; here it does not). Git tags are `v<version>` and the npm `latest` dist-tag carries the same string.

Past versions and changelogs live in [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases).

## Check for updates

```bash
pi-web update --check   # queries the latest version only, no update
```

The workbench also shows an update notice on the new-session page whenever a newer version is available.

## Update steps (per install shape)

:::: tabs#update

@tab npm global

```bash
pi-web stop
pi-web update
pi-web start
```

`pi-web update` is equivalent to `npm install -g @aiti-ai/pi-web@latest --allow-scripts`.

@tab release archive (macOS / Linux / Windows one-liner)

```bash
pi-web stop
pi-web update
pi-web
```

`pi-web update` downloads the new archive from GitHub Releases, verifies sha256 (with automatic Gitee mirror fallback), and switches to the new version directory.

You can also re-run the installer (run `pi-web stop` first):

```bash
curl -fsSL https://aiti.pw/install.sh | sh        # macOS / Linux
irm https://aiti.pw/install.ps1 | iex             # Windows (PowerShell)
```

@tab npx

Nothing is installed to disk and every run pulls the latest — just run the new version:

```bash
npx @aiti-ai/pi-web@latest
```

@tab Docker

```bash
docker pull aitiai/pi-web:latest
# then recreate the container the same way it was originally started
```

Version tags look like `aitiai/pi-web:v<version>-{core,full}`, with rolling `core` / `full` / `latest` tags.

@tab source checkout

```bash
git pull
# then rebuild and restart as usual (dev mode picks changes up automatically)
```

@tab custom deployment

Follow the same rhythm:

```bash
pi-web stop        # stop the server
pi-web update      # try the built-in updater (works for npm / release channels)
pi-web start       # start the server
```

If `pi-web update` does not fit your setup (e.g. a self-maintained package channel), update the package manually following the docs of your deployment method, then restart the server.

::::

## Servers managed by a process manager

If the server is managed by systemd / launchd / similar, use the manager's commands to stop and start (e.g. `systemctl restart <unit>`) — **the update itself is still `pi-web update`**; the manager only handles the stop/start around it.

## See also

- [Install](install.md) — first-time setup and the three install shapes
- [GitHub Releases](https://github.com/aiti-ai/aiti-ai/releases) — past versions and changelogs
