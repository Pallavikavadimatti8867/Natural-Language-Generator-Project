@echo off
REM Root startup script for Windows in VS Code
echo ==========================================================
echo  Starting Natural Language Generator for Data Analysis
echo ==========================================================

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js and npm are required. Please download and install from https://nodejs.org
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install --legacy-peer-deps

echo Starting dev server on http://localhost:3000...
call npm run dev
