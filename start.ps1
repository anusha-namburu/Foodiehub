# FoodieHub Launch Script for PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Starting FoodieHub Full-Stack Application         " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in separate process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; python app.py"

# 2. Start Frontend in separate process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "FoodieHub servers have been initiated!" -ForegroundColor Green
Write-Host " -> Backend API:  http://127.0.0.1:5000" -ForegroundColor White
Write-Host " -> Frontend Web: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host " -> Customer: customer@foodiehub.com / customer123"
Write-Host " -> Admin:    admin@foodiehub.com / admin123"
