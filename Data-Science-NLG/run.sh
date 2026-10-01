#!/usr/bin/env bash
# Script to run Python Data Science NLG Backend in VS Code / Linux / Mac

echo "=== Starting Data Science NLG Python Backend ==="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required. Please install Python 3.10+ from python.org"
    exit 1
fi

# Create virtual environment if not present
if [ ! -d "venv" ]; then
    echo "Creating virtual environment 'venv'..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Run Flask application
echo "Starting Flask REST API on http://127.0.0.1:5000..."
cd backend
python app.py
