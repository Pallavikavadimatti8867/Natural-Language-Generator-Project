#!/usr/bin/env bash
# Root startup script to run the Full-Stack Data Science NLG App in VS Code

echo "=========================================================="
echo " Starting Natural Language Generator for Data Analysis"
echo "=========================================================="

if ! command -v npm &> /dev/null; then
    echo "Node.js and npm are required. Please install from https://nodejs.org"
    exit 1
fi

echo "Installing node dependencies..."
npm install --legacy-peer-deps

echo "Starting application dev server on http://localhost:3000..."
npm run dev
