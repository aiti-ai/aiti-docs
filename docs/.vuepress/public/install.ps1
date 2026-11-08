# aiti Web (@aiti-ai/pi-web) one-line installer for Windows.
#
#   irm https://aiti.pw/install.ps1 | iex
#
# Installs the prebuilt archive from GitHub Releases — no npm involved on
# your machine. The archive bundles node_modules, so you only need the
# Node.js runtime itself (>= 22.19).
#
# Release sources: GitHub primary, Gitee mirror as fallback for CN networks
# (identical assets + checksums; archives above the Gitee 100 MB per-file cap
# are published as .part-N pieces + a .split manifest and reassembled here).
#
# Overrides:
#   $env:AITI_MIRROR       = "auto|github|gitee"   (default auto: GitHub, then Gitee)
#   $env:AITI_RELEASE_REPO = "owner/repo"          (default aiti-ai/aiti-ai)
#   $env:AITI_GITEE_REPO   = "owner/repo"          (default aiti-ai/aiti-ai)
#   $env:AITI_INSTALL_DIR  = "D:\aiti"             (default $env:LOCALAPPDATA\aiti)
#   $env:AITI_RELEASE_TAG  = "v0.15.7"             (pin a version, default: latest)
# Body wrapped in a scriptblock + `return` (never `exit`) so piping into iex
# cannot kill the caller's shell.

& {
    $ErrorActionPreference = "Stop"

    function Say([string]$m)  { Write-Host $m }
    function Good([string]$m) { Write-Host "[+] $m" -ForegroundColor Green }
    function Bad([string]$m)  { Write-Host "[x] $m" -ForegroundColor Red }

    $needMajor = 22
    $needMinor = 19
    $ghRepo = if ($env:AITI_RELEASE_REPO) { $env:AITI_RELEASE_REPO } else { "aiti-ai/aiti-ai" }
    $geRepo = if ($env:AITI_GITEE_REPO) { $env:AITI_GITEE_REPO } else { "aiti-ai/aiti-ai" }
    $mirror = if ($env:AITI_MIRROR) { $env:AITI_MIRROR } else { "auto" }
    $installRoot = if ($env:AITI_INSTALL_DIR) { $env:AITI_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "aiti" }
    $tag = $env:AITI_RELEASE_TAG   # pin a version, e.g. "v0.15.7" (default: latest release)

    Say ""
    Say "aiti Web installer  (prebuilt - no npm)"
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

    # ---- download helpers ----
    # Prefer curl.exe (ships with Windows 10 1803+; far more robust than
    # Invoke-WebRequest, which stalls on single throttled connections and has
    # no retry). IWR is the fallback.
    $curlExe = Get-Command curl.exe -ErrorAction SilentlyContinue
    function Fetch([string]$url, [string]$out) {
        if ($curlExe) {
            & $curlExe.Source -fsSL --retry 2 --connect-timeout 20 -o $out $url 2>$null
            return ($LASTEXITCODE -eq 0 -and (Test-Path $out))
        }
        try { Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; return $true } catch { return $false }
    }
    function FetchJson([string]$url) {
        try { return Invoke-RestMethod -Uri $url -UseBasicParsing } catch { return $null }
    }

    # ---- release sources (GitHub primary, Gitee mirror fallback) ----
    function ResolveRelease([string]$src) {
        # returns release object or $null (caller reads tag_name off it)
        $api = if ($src -eq "gh") { "https://api.github.com/repos/$ghRepo" } else { "https://gitee.com/api/v5/repos/$geRepo" }
        $url = "$api/releases/latest"
        if ($tag) { $url = "$api/releases/tags/$tag" }
        $rel = FetchJson $url
        if (-not $rel -or -not $rel.tag_name) { return $null }
        return $rel
    }
    function AssetUrl($rel, [string]$name) {
        if (-not $rel) { return $null }
        $a = $rel.assets | Where-Object { $_.name -eq $name } | Select-Object -First 1
        if ($a) { return [string]$a.browser_download_url }
        return $null
    }
    # handles split uploads (.split manifest with part count + .part-N pieces)
    function DownloadAsset($rel, [string]$name, [string]$dest) {
        $splitUrl = AssetUrl $rel "$name.split"
        if ($splitUrl) {
            $splitTxt = Join-Path $tmp ("split-" + [guid]::NewGuid().ToString("N").Substring(0,8) + ".txt")
            if (-not (Fetch $splitUrl $splitTxt)) { return $false }
            $parts = 0
            if (-not [int]::TryParse(((Get-Content $splitTxt -Raw) -replace '\D',''), [ref]$parts) -or $parts -lt 1) { return $false }
            Say "  split upload: $parts part(s)"
            $tmpParts = @()
            for ($i = 1; $i -le $parts; $i++) {
                $pUrl = AssetUrl $rel "$name.part-$i"
                if (-not $pUrl) { Bad "split part $i missing."; return $false }
                $pFile = Join-Path $tmp ("part-" + $i)
                if (-not (Fetch $pUrl $pFile)) { return $false }
                $tmpParts += $pFile
            }
            # binary-safe concat via cmd copy /b (PS string concat would mangle bytes)
            $concat = Join-Path $tmp "concat.out"
            $list = ($tmpParts -join "+")
            cmd /c copy /b "$list" "$concat" > $null
            if (-not (Test-Path $concat)) { return $false }
            Move-Item -Force $concat $dest
            $tmpParts | ForEach-Object { Remove-Item $_ -Force -ErrorAction SilentlyContinue }
            return $true
        }
        $url = AssetUrl $rel $name
        if (-not $url) { return $false }
        return (Fetch $url $dest)
    }

    $tmp = Join-Path $env:TEMP ("aiti-install-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
    New-Item -ItemType Directory -Path $tmp | Out-Null

    $sources = @()
    switch ($mirror) {
        "github" { $sources = @("gh") }
        "gitee"  { $sources = @("ge") }
        default  { $sources = @("gh", "ge") }
    }

    # ---- resolve + download + verify (first source that fully works wins) ----
    $rel = $null
    $assetName = $null
    $zip = $null
    $verified = $false
    foreach ($src in $sources) {
        $label = if ($src -eq "gh") { "GitHub ($ghRepo)" } else { "Gitee ($geRepo)" }
        Say "Querying release from $label ..."
        $rel = ResolveRelease $src
        if (-not $rel) { Say "  source unavailable, trying next ..."; continue }
        $tag = [string]$rel.tag_name
        $assetName = "aiti-web-$tag-win-x64.zip"
        $zip = Join-Path $tmp $assetName
        if (-not (DownloadAsset $rel $assetName $zip) -or -not (Test-Path $zip)) {
            Say "  download failed on $label, trying next ..."
            continue
        }
        $checksumUrl = AssetUrl $rel "checksums.txt"
        if ($checksumUrl) {
            $csum = Join-Path $tmp "checksums.txt"
            if (Fetch $checksumUrl $csum) {
                $want = ((Get-Content $csum) -match [regex]::Escape($assetName) | Select-Object -First 1) -split '\s+' | Select-Object -First 1
                $got = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
                if ($want -and $got -eq $want.ToLower()) {
                    Good "sha256 verified  ($label, release $tag)"
                    $verified = $true
                    break
                }
                Bad "sha256 mismatch on $label - trying next source ..."
                continue
            }
            Say "  checksums.txt unreachable on $label - skipping verification"
            $verified = $true
            break
        }
        Say "  no checksums.txt on $label - skipping verification"
        $verified = $true
        break
    }
    if (-not $verified -or -not (Test-Path $zip)) {
        Bad "all release sources failed. check:"
        Say "  https://github.com/$ghRepo/releases"
        Say "  https://gitee.com/$geRepo/releases"
        Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
        return
    }

    Good "release $tag"

    # ---- install ----
    Say "Installing to $(Join-Path $installRoot "aiti-web-$tag") ..."
    $tmpExtract = Join-Path $tmp "extract"
    try {
        Expand-Archive -Path $zip -DestinationPath $tmpExtract -Force
    } catch {
        Bad "extract failed: $($_.Exception.Message)"
        Remove-Item -Recurse -Force $tmp
        return
    }
    $appDir = Join-Path $installRoot "aiti-web-$tag"
    if (Test-Path $appDir) { Remove-Item -Recurse -Force $appDir }
    New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
    Move-Item (Join-Path $tmpExtract "aiti-web") $appDir
    Good "installed aiti-web $tag"

    # ---- pi-web.cmd shim (WindowsApps dir is on PATH by default) ----
    # MUST invoke node explicitly: cmd resolves a bare "...js" through the .js
    # file association, which is WSH (WScript.exe) on stock Windows — JScript
    # chokes on Node code and the command hangs forever on a modal error dialog.
    $shimDir = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    $shim = Join-Path $shimDir "pi-web.cmd"
    try {
        New-Item -ItemType Directory -Path $shimDir -Force | Out-Null
        # -Encoding Default (system ANSI/OEM codepage), not ASCII: install paths
        # may contain non-ASCII (CN-locale usernames), ASCII would corrupt them.
        Set-Content -Path $shim -Value ("@node `"" + $appDir + "\bin\pi-web.js`" %*") -Encoding Default
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
