# aiti Web (@aiti-ai/pi-web) one-line installer for Windows.
#
#   irm https://aiti.pw/install.ps1 | iex
#
# Installs the prebuilt archive from GitHub Releases — no npm involved on
# your machine. The archive bundles node_modules, so you only need the
# Node.js runtime itself (>= 22.19).
#
# Overrides:
#   $env:AITI_RELEASE_REPO = "owner/repo"        (default aiti-ai/aiti-ai)
#   $env:AITI_INSTALL_DIR  = "D:\aiti"           (default $env:LOCALAPPDATA\aiti)
# Body wrapped in a scriptblock + `return` (never `exit`) so piping into iex
# cannot kill the caller's shell.

& {
    $ErrorActionPreference = "Stop"

    function Say([string]$m)  { Write-Host $m }
    function Good([string]$m) { Write-Host "[+] $m" -ForegroundColor Green }
    function Bad([string]$m)  { Write-Host "[x] $m" -ForegroundColor Red }

    $needMajor = 22
    $needMinor = 19
    $repo = if ($env:AITI_RELEASE_REPO) { $env:AITI_RELEASE_REPO } else { "aiti-ai/aiti-ai" }
    $installRoot = if ($env:AITI_INSTALL_DIR) { $env:AITI_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "aiti" }
    $tag = $env:AITI_RELEASE_TAG   # pin a version, e.g. "v0.15.7" (default: latest release)

    Say ""
    Say "aiti Web installer  (GitHub Releases · prebuilt · no npm)"
    Say "----------------------------------------"
    Say ""

    # ---- Node.js runtime check ----
    $nodeInfo = $null
    try {
        $raw = (& node --version) | Select-Object -First 1
        $v = ($raw -replace '^v', '').Trim()
        if ($v -match '^(\d+)\.(\d+)') {
            $nodeInfo = @{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Raw = $v }
        }
    } catch { $nodeInfo = $null }

    if (-not $nodeInfo) {
        Bad "Node.js not found. aiti Web needs the Node.js runtime >= $needMajor.$needMinor."
        Say ""
        Say "  Install Node.js first, then re-run this installer:"
        Say "    winget install OpenJS.NodeJS.LTS"
        Say "    or:  https://nodejs.org/en/download"
        Say ""
        return
    }
    if ($nodeInfo.Major -lt $needMajor -or ($nodeInfo.Major -eq $needMajor -and $nodeInfo.Minor -lt $needMinor)) {
        Bad "Node.js $($nodeInfo.Raw) is too old (need >= $needMajor.$needMinor)."
        Say "  Update Node.js (winget upgrade OpenJS.NodeJS), then re-run this installer."
        return
    }
    Good "Node.js $($nodeInfo.Raw)"

    # ---- resolve release ----
    $api = if ($tag) { "https://api.github.com/repos/$repo/releases/tags/$tag" } else { "https://api.github.com/repos/$repo/releases/latest" }
    Say "Querying release from $repo ..."
    try {
        $release = Invoke-RestMethod -Uri $api -UseBasicParsing
    } catch {
        Bad "cannot reach GitHub API ($api)."
        return
    }
    $tag = $release.tag_name
    if (-not $tag) { Bad "no tag_name in release."; return }
    $assetName = "aiti-web-$tag-win-x64.zip"
    $asset = $release.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1
    if (-not $asset) {
        Bad "asset $assetName not found in release $tag."
        Say "  check https://github.com/$repo/releases"
        return
    }
    Good "release $tag"

    # ---- download + verify ----
    $tmp = Join-Path $env:TEMP ("aiti-install-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
    New-Item -ItemType Directory -Path $tmp | Out-Null
    Say "Downloading $($assetName) ..."
    try {
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile (Join-Path $tmp $assetName) -UseBasicParsing
    } catch {
        Bad "download failed: $($asset.browser_download_url)"
        Remove-Item -Recurse -Force $tmp
        return
    }
    $checksumAsset = $release.assets | Where-Object { $_.name -eq "checksums.txt" } | Select-Object -First 1
    if ($checksumAsset) {
        try {
            Invoke-WebRequest -Uri $checksumAsset.browser_download_url -OutFile (Join-Path $tmp "checksums.txt") -UseBasicParsing
            $want = (Get-Content (Join-Path $tmp "checksums.txt") | Where-Object { $_ -match [regex]::Escape($assetName) }) -split '\s+' | Select-Object -First 1
            $got = (Get-FileHash (Join-Path $tmp $assetName) -Algorithm SHA256).Hash.ToLower()
            if ($want -and $got -eq $want.ToLower()) { Good "sha256 verified" }
            else { Bad "sha256 mismatch."; Remove-Item -Recurse -Force $tmp; return }
        } catch { Say "  (checksum check skipped: $($_.Exception.Message))" }
    }

    # ---- install ----
    $appDir = Join-Path $installRoot "aiti-web-$tag"
    Say "Installing to $appDir ..."
    $tmpExtract = Join-Path $tmp "extract"
    try {
        Expand-Archive -Path (Join-Path $tmp $assetName) -DestinationPath $tmpExtract -Force
    } catch {
        Bad "extract failed: $($_.Exception.Message)"
        Remove-Item -Recurse -Force $tmp
        return
    }
    if (Test-Path $appDir) { Remove-Item -Recurse -Force $appDir }
    New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
    Move-Item (Join-Path $tmpExtract "aiti-web") $appDir
    Good "installed aiti-web $tag"

    # ---- pi-web.cmd shim (WindowsApps dir is on PATH by default) ----
    $shimDir = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    $shim = Join-Path $shimDir "pi-web.cmd"
    try {
        New-Item -ItemType Directory -Path $shimDir -Force | Out-Null
        Set-Content -Path $shim -Value "@`"$appDir\bin\pi-web.js`" %*" -Encoding ASCII
        Good "shim written: $shim"
    } catch {
        Say "  (shim write failed: $($_.Exception.Message) - run with: node `"$appDir\bin\pi-web.js`")"
    }

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

    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue

    Say ""
    Say "Done! Start aiti Web with:"
    Say ""
    Say "    pi-web          # serves http://127.0.0.1:30141 and opens your browser"
    Say ""
    Say "Upgrade: re-run this installer (pi-web stop first)."
    Say "Docs:    https://aiti.pw/guide/install.html"
    Say ""
}
