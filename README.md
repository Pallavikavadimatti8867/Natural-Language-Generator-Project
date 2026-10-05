Natural Language Generator for Data Analysis
An AI-powered Data Science web application that analyzes structured tabular datasets (CSV) and automatically converts statistical computations, distributions, correlations, and visualizations into clear natural-language insights and comprehensive executive reports.
🌟 Key Features
🔐 Authentication & User Workspace: Secure JWT authentication with user registration, login, session persistence, and guest analyst mode.
📂 Dataset Ingestion & Samples: Upload custom CSV files up to 25MB or instantly load curated industry datasets (Retail Sales Analytics and HR Employee Attrition).
🧹 Data Quality & Automated Cleaning:
Automatically identifies missing values, duplicate rows, data types, and potential outliers.
Interactive data cleaning tools: remove duplicates, drop empty rows, impute numerical missing values (mean/median), fill categorical nulls, and drop unnecessary columns.
📊 Comprehensive Statistical Analysis:
Computes count, mean, median, standard deviation, min, max, skewness, and interquartile ranges (IQR).
Calculates full Pearson correlation matrix between all numeric attributes.
Interactive distribution charts and trend visualizations via Chart.js.
🤖 Dual-Engine Natural Language Generation (NLG):
Deterministic Algorithmic Engine: Generates statistical explanations, anomaly detections, and trend alerts with zero hallucinations.
Gemini AI Executive Engine: Generates strategic recommendations, high-level business conclusions, and actionable executive summaries.
📑 Report Generation & Export: Generate comprehensive multi-section reports and export them as Markdown or print-ready PDF summaries.
🗂️ Analysis History: Keep track of previously loaded datasets and saved analytical reports in your persistent workspace.
🛠️ Technology Stack
Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Chart.js, Motion
Backend: Node.js, Express, Multer (file uploads), JWT, Bcryptjs
AI / NLG Integration: Google Gemini API (@google/genai TypeScript SDK)
Data Engine: Native statistical and matrix computing modules
🚀 Getting Started
Prerequisites
Ensure you have Node.js (v18 or higher) installed on your system.
You can check by running in your terminal:
code
Bash
node -v
npm -v
If you do not have Node.js, download it from nodejs.org.
Option A: 1-Click Run on Windows (Recommended for VS Code)
If you are using Windows:
Open this project folder in VS Code or Windows File Explorer.
Double-click the file named run.bat (or right-click run.bat in VS Code and select Run in Terminal).
The script will:
Check your Node.js environment.
Install all required dependencies (npm install --legacy-peer-deps).
Automatically open http://localhost:3000 in your default web browser.
Start the development server.
Option B: Manual Command Line Setup
1. Open your terminal in the project directory
In VS Code, press Ctrl + ` (or go to Terminal → New Terminal).
2. Install dependencies
code
Bash
npm install --legacy-peer-deps
Note: The --legacy-peer-deps flag ensures smooth installation across all npm package versions.
3. Start the application
code
Bash
npm run dev
4. Open in your browser
Once you see:
code
Text
Natural Language Generator for Data Analysis
  ➜ Local:   http://localhost:3000/
  ➜ Network: http://127.0.0.1:3000/
Open Google Chrome or Microsoft Edge and navigate to:
code
Code
http://localhost:3000
Option C: macOS & Linux
Make the shell script executable and run it:
code
Bash
chmod +x run.sh
./run.sh
⚙️ Environment Variables (Optional)
Create a .env file in the root directory (you can copy .env.example):
code
Env
PORT=3000
JWT_SECRET=your_custom_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
Note: If GEMINI_API_KEY is not provided, the application will still fully function using its built-in rule-based algorithmic NLG engine.
📁 Project Structure
code
Text
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies and npm scripts
├── run.bat                  # Windows 1-click startup batch script
├── run.sh                   # Linux/macOS startup script
├── server.ts                # Express backend server with Vite middleware integration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
│
├── server/                  # Backend modules
│   ├── analytics.ts         # Statistical calculations, quality score, correlations
│   ├── db.ts                # Persistent in-memory data store with JSON backup
│   └── nlg.ts               # Algorithmic and Gemini AI Natural Language Generation
│
├── sample_data/             # Built-in sample datasets
│   ├── sales.csv            # Retail sales and profit dataset
│   └── employee_attrition.csv # HR employee attrition and performance dataset
│
└── src/                     # React frontend
    ├── main.tsx             # React application entry point
    ├── App.tsx              # Root component & navigation state
    ├── index.css            # Tailwind CSS styling
    ├── components/          # UI Components
    │   ├── Navbar.tsx       # Top navigation header & user controls
    │   ├── DatasetUpload.tsx# Drag-and-drop file upload & sample dataset picker
    │   ├── DataCleaner.tsx  # Interactive data cleaning & imputation tools
    │   ├── StatsOverview.tsx# KPI statistics summary cards
    │   ├── Visualizations.tsx# Interactive Chart.js charts & correlation matrix
    │   ├── NLGInsights.tsx  # Natural language algorithmic insights cards
    │   ├── ReportGenerator.tsx # Full executive report generator & export
    │   ├── HistoryModal.tsx # Saved dataset and report history viewer
    │   └── AuthModal.tsx    # User login and registration modal
    └── types/               # TypeScript interfaces
❓ Troubleshooting & FAQs
1. ERR_ADDRESS_INVALID (-108) in browser
Cause: Trying to navigate to http://0.0.0.0:3000/. Windows and Chromium browsers do not allow 0.0.0.0 as a destination address in the URL bar.
Solution: Always navigate to http://localhost:3000 or http://127.0.0.1:3000.
2. 'tsx' is not recognized as an internal or external command
Cause: You opened a newly extracted project folder and haven't run npm install yet.
Solution: Run npm install --legacy-peer-deps in your terminal to install node_modules.
3. Red lines / "Cannot find module 'express'" in VS Code
Cause: VS Code TypeScript language server needs node_modules to resolve package typings.
Solution: Run npm install --legacy-peer-deps. Once installation completes, all 29 TypeScript errors in VS Code will disappear automatically.
4. EADDRINUSE: address already in use :::3000
Cause: Another terminal or process is already using port 3000.
Solution: Close previous terminal tabs in VS Code by pressing Ctrl + C, or specify a different port in your terminal:
code
Powershell
$env:PORT="3001"; npm run dev
Then access at http://localhost:3001.
📄 License
This project is open-source and available under the MIT License.
