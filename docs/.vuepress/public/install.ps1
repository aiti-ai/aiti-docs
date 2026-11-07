# aiti Web (@aiti-ai/pi-web) one-line installer for Windows.
#
#   irm https://aiti.pw/install.ps1 | iex
#
# Custom npm registry (intranet / mirror):
#   $env:AITI_NPM_REGISTRY = "https://npm.example.com"; irm https://aiti.pw/install.ps1 | iex
#
# The script is read-only about your system: it checks Node.js, runs one
# `npm install -g`, and prints next steps. No admin rights, no file changes.
# Body wrapped in a scriptblock + `return` (never `exit`) so piping into iex
# cannot kill the caller's shell.

& {
    $ErrorActionPreference = "Stop"

    function Say([string]$m)  { Write-Host $m }
    function Good([string]$m) { Write-Host "[+] $m" -ForegroundColor Green }
    function Bad([string]$m)  { Write-Host "[x] $m" -ForegroundColor Red }

    $needMajor = 22
    $needMinor = 19

    Say ""
    Say "aiti Web installer  (npm package: @aiti-ai/pi-web)"
    Say "----------------------------------------"
    Say ""

    # ---- Node.js check ----
    $nodeInfo = $null
    try {
        $raw = (& node --version) | Select-Object -First 1
        $v = ($raw -replace '^v', '').Trim()
        if ($v -match '^(\d+)\.(\d+)') {
            $nodeInfo = @{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Raw = $v }
        }
    } catch { $nodeInfo = $null }

    if (-not $nodeInfo) {
        Bad "Node.js not found. aiti Web needs Node.js >= $needMajor.$needMinor."
        Say ""
        Say "  Install Node.js first, then re-run this installer:"
        Say "    winget install OpenJS.NodeJS.LTS"
        Say "    or:  https://nodejs.org/en/download"
        Say ""
        return
    }
    if ($nodeInfo.Major -lt $needMajor -or ($nodeInfo.Major -eq $needMajor -and $nodeInfo.Minor -lt $needMinor)) {
        Bad "Node.js $($nodeInfo.Raw) is too old (need >= $needMajor.$needMinor)."
        Say ""
        Say "  Update Node.js, then re-run this installer:"
        Say "    winget upgrade OpenJS.NodeJS"
        Say ""
        return
    }
    Good "Node.js $($nodeInfo.Raw)"

    # ---- install ----
    $npmArgs = @("install", "-g", "@aiti-ai/pi-web@latest")
    if ($env:AITI_NPM_REGISTRY) {
        $npmArgs += @("--registry", $env:AITI_NPM_REGISTRY)
        Say "  using registry: $($env:AITI_NPM_REGISTRY)"
    }

    Say "Installing @aiti-ai/pi-web (global) ..."
    & npm @npmArgs
    if ($LASTEXITCODE -ne 0) {
        Bad "npm install failed (see output above)."
        Say ""
        Say "  Hit EACCES / permission errors? Prefer a user-writable global prefix:"
        Say "    npm config set prefix ~\npm-global   # then add ~\npm-global to PATH"
        Say ""
        return
    }
    Good "Installed @aiti-ai/pi-web"

    # ---- pi engine hint ----
    Say ""
    $piCmd = Get-Command pi -ErrorAction SilentlyContinue
    if ($piCmd) {
        Good "pi coding agent (engine) found on PATH"
    } else {
        Bad "pi coding agent (engine) not found on PATH."
        Say "  aiti Web drives the pi CLI as its session engine. Install:"
        Say "    npm install -g @earendil-works/pi-coding-agent"
    }

    # ---- next steps ----
    Say ""
    Say "Done! Start aiti Web with:"
    Say ""
    Say "    pi-web          # serves http://127.0.0.1:30141 and opens your browser"
    Say ""
    Say "More commands:  pi-web status | stop | open | update"
    Say "Docs:           https://aiti.pw/guide/install.html"
    Say ""
}
