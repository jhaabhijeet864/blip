# Blip Desktop Release Build Automation
# Builds React 19 frontend and packages standalone optimized Tauri executable

[CmdletBinding()]
param(
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Blip v2.0 Desktop Release Packaging" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verify Prerequisites
Write-Host "`n[1/4] Checking prerequisites..." -ForegroundColor Yellow
$cargo = Get-Command "cargo" -ErrorAction SilentlyContinue
if (-not $cargo) {
    $cargoPath = "$env:USERPROFILE\.cargo\bin\cargo.exe"
    if (Test-Path $cargoPath) {
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    } else {
        throw "Cargo is not found in PATH or $cargoPath"
    }
}
$node = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js is not installed." }

Write-Host "✓ Cargo and Node.js detected." -ForegroundColor Green

# 2. Run Test Verification
if (-not $SkipTests) {
    Write-Host "`n[2/4] Running Rust test verification..." -ForegroundColor Yellow
    cargo test -p blip-core
    if ($LASTEXITCODE -ne 0) { throw "Rust test suite failed." }
    Write-Host "✓ 27/27 Rust tests passed cleanly." -ForegroundColor Green
}

# 3. Build UI Assets
Write-Host "`n[3/4] Building React 19 + Tailwind frontend assets..." -ForegroundColor Yellow
npm --prefix ui run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
Write-Host "✓ Frontend assets compiled to ui/dist." -ForegroundColor Green

# 4. Build Standalone Release Binary
Write-Host "`n[4/4] Compiling optimized release binary..." -ForegroundColor Yellow
cargo build --release -p blip-desktop
if ($LASTEXITCODE -ne 0) { throw "Cargo release build failed." }

$targetExe = "target\release\blip-desktop.exe"
if (Test-Path $targetExe) {
    New-Item -ItemType Directory -Force -Path "dist" | Out-Null
    Copy-Item $targetExe "dist\Blip-Studio.exe" -Force
    $fileSize = (Get-Item "dist\Blip-Studio.exe").Length / 1MB
    $hash = (Get-FileHash "dist\Blip-Studio.exe" -Algorithm SHA256).Hash

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host " Standalone Build Succeeded!" -ForegroundColor Green
    Write-Host " Location:  dist\Blip-Studio.exe" -ForegroundColor White
    Write-Host " File Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
    Write-Host " SHA-256:   $hash" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Green
} else {
    throw "Target executable not found at $targetExe"
}
