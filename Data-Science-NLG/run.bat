@echo off
REM Script to run Python Data Science NLG Backend in VS Code / Windows
echo === Starting Data Science NLG Python Backend ===

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

if not exist "venv" (
    echo Creating virtual environment 'venv'...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Flask REST API on http://127.0.0.1:5000...
cd backend
python app.py
