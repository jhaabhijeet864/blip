# scripts/package_extension.ps1
# Automates building and packaging the Blip Chrome Extension into a distributable zip archive.

$ErrorActionPreference = "Stop"

Write-Host "=== Blip Chrome Extension Packaging ===" -ForegroundColor Cyan

# 1. Build extension bundle
Write-Host "Building extension TypeScript bundles..." -ForegroundColor Yellow
npm --prefix extension run build

# 2. Prepare staging directory
$distDir = "dist"
$pkgDir = Join-Path $distDir "blip-extension"
if (Test-Path $pkgDir) {
    Remove-Item -Recurse -Force $pkgDir
}
New-Item -ItemType Directory -Path $pkgDir -Force | Out-Null

# 3. Copy files to staging
Copy-Item "extension/manifest.json" $pkgDir/
Copy-Item "extension/popup.html" $pkgDir/
Copy-Item -Recurse "extension/icons" $pkgDir/
Copy-Item -Recurse "extension/dist" $pkgDir/

# 4. Zip archive
$zipPath = Join-Path $distDir "blip-extension-v1.0.0.zip"
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path "$pkgDir/*" -DestinationPath $zipPath -Force
Write-Host "Packaged zip archive: $zipPath" -ForegroundColor Green

# 5. Compute SHA256 checksum
$hash = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash
$hash | Out-File -FilePath "$zipPath.sha256" -Encoding ascii
Write-Host "SHA256: $hash" -ForegroundColor Green

# 6. Instructions
Write-Host "`nInstallation Instructions:" -ForegroundColor Cyan
Write-Host "1. Unzip $zipPath or use the staging folder ($pkgDir)"
Write-Host "2. Open Chrome -> chrome://extensions"
Write-Host "3. Turn on Developer mode (top right)"
Write-Host "4. Click Load unpacked and select the folder"
Write-Host "=== Packaging Complete ===" -ForegroundColor Green

