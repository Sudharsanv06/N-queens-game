# N-Queens Game - Quick Start Script
# Run this to start both frontend and backend

Write-Host "Starting N-Queens Game..." -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "[OK] MongoDB is running!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] MongoDB is not running. Starting..." -ForegroundColor Red
    try {
        Start-Service MongoDB
        Write-Host "[OK] MongoDB started successfully!" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Could not start MongoDB. Please start it manually." -ForegroundColor Red
        Write-Host "   Run: net start MongoDB" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "   Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Frontend Client..." -ForegroundColor Yellow
Write-Host "   Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Magenta
Write-Host "   1. Wait for both servers to start" -ForegroundColor White
Write-Host "   2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   3. Press Ctrl+C in each terminal to stop" -ForegroundColor White
Write-Host ""

# Start backend in new terminal
Write-Host "Opening Backend terminal..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new terminal
Write-Host "Opening Frontend terminal..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host ""
Write-Host "[SUCCESS] Setup Complete!" -ForegroundColor Green
Write-Host "   Both servers are starting in separate terminals." -ForegroundColor Cyan
Write-Host "   Open MongoDB Compass to view database: mongodb://localhost:27017" -ForegroundColor Yellow
Write-Host ""
