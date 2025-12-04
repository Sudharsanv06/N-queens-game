# System Check Script - Verify Local Development Setup

Write-Host "N-Queens Game - System Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check MongoDB
Write-Host "MongoDB Status:" -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "   [OK] MongoDB Service: Running" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] MongoDB Service: Stopped" -ForegroundColor Red
        Write-Host "   --> Run: net start MongoDB" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   [ERROR] MongoDB not installed" -ForegroundColor Red
    Write-Host "   --> Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check Node.js
Write-Host "Node.js Status:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Node.js not found" -ForegroundColor Red
    Write-Host "   --> Download from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check npm
Write-Host "npm Status:" -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   [OK] npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] npm not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check server dependencies
Write-Host "Backend Dependencies:" -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\server\node_modules") {
    Write-Host "   [OK] Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Backend dependencies not installed" -ForegroundColor Red
    Write-Host "   --> Run: cd server; npm install" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check client dependencies
Write-Host "Frontend Dependencies:" -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\client\node_modules") {
    Write-Host "   [OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Frontend dependencies not installed" -ForegroundColor Red
    Write-Host "   --> Run: cd client; npm install" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check server .env
Write-Host "Configuration Files:" -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\server\.env") {
    Write-Host "   [OK] Server .env exists" -ForegroundColor Green
    $mongoUri = Select-String -Path "$PSScriptRoot\server\.env" -Pattern "MONGO_URI=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    if ($mongoUri -match "localhost:27017") {
        Write-Host "   [OK] MongoDB configured for local development" -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] MongoDB URI is not set to localhost" -ForegroundColor Red
        Write-Host "   --> Current: $mongoUri" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   [ERROR] Server .env not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "$PSScriptRoot\client\.env") {
    Write-Host "   [OK] Client .env exists" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Client .env not found (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "[SUCCESS] All systems ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Run: .\start.ps1  (to start both servers)" -ForegroundColor White
    Write-Host "   2. Open MongoDB Compass: mongodb://localhost:27017" -ForegroundColor White
    Write-Host "   3. Open browser: http://localhost:5173" -ForegroundColor White
} else {
    Write-Host "[WARNING] Please fix the issues above before starting" -ForegroundColor Red
}

Write-Host ""
