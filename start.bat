@echo off
echo ========================================================
echo       Starting FoodieHub Full-Stack Application
echo ========================================================
echo.

REM Start Flask Backend in new window
start "FoodieHub Backend API (Port 5000)" cmd /k "cd backend && python app.py"

REM Start Vite React Frontend in new window
start "FoodieHub Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching:
echo  - Backend API: http://127.0.0.1:5000
echo  - Frontend Web: http://localhost:5173
echo.
echo Demo Accounts:
echo  - Customer: customer@foodiehub.com / customer123
echo  - Admin:    admin@foodiehub.com / admin123
echo.
pause
