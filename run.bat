@echo off
REM Root startup script for Windows in VS Code
echo ==========================================================
echo  Starting Natural Language Generator for Data Analysis
echo ==========================================================

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js and npm are required.
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking and installing dependencies...
call npm install --legacy-peer-deps

echo [2/3] Opening application in your web browser...
start http://localhost:3000

echo [3/3] Starting development server on http://localhost:3000...
echo Keep this window open while using the application.
call npm run dev
pause