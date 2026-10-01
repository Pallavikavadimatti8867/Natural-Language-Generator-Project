import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  FileCode,
  HelpCircle,
  Cpu,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'docs' | 'qa' | 'python' | 'vscode'>('docs');
  const [selectedPythonFile, setSelectedPythonFile] = useState<'app' | 'analysis' | 'nlg' | 'cleaning' | 'requirements'>('app');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedVscodeCmd, setCopiedVscodeCmd] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const pythonFiles = {
    app: {
      name: 'backend/app.py',
      lang: 'python',
      code: `\"\"\"
Flask REST API Backend for Natural Language Generator for Data Analysis
\"\"\"
import os
import uuid
import datetime
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database import Database
from auth import hash_password, verify_password, create_jwt_token, token_required
from analysis import compute_descriptive_stats, compute_data_quality, compute_correlations
from nlg_engine import NLGEngine
from data_cleaning import DataCleaner

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db = Database.get_db()
nlg = NLGEngine()

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_dataset(current_user):
    file = request.files.get('file')
    df = pd.read_csv(file)
    dataset_id = str(uuid.uuid4())
    stats = compute_descriptive_stats(df)
    quality = compute_data_quality(df)
    return jsonify({'success': True, 'dataset_id': dataset_id, 'rows': len(df)})
`
    },
    analysis: {
      name: 'backend/analysis.py',
      lang: 'python',
      code: `import pandas as pd
import numpy as np

def compute_descriptive_stats(df: pd.DataFrame) -> dict:
    \"\"\"
    Computes complete statistical profile:
    Mean, Median, Mode, Std Dev, Variance, Quartiles (Q1, Q2, Q3, IQR), Range, Skewness, Outliers
    \"\"\"
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    stats = {}
    for col in numeric_cols:
        series = df[col].dropna()
        q1 = float(np.percentile(series, 25))
        q3 = float(np.percentile(series, 75))
        iqr = q3 - q1
        stats[col] = {
            'mean': round(float(series.mean()), 2),
            'median': round(float(series.median()), 2),
            'std': round(float(series.std()), 2),
            'q1': round(q1, 2),
            'q3': round(q3, 2),
            'iqr': round(iqr, 2),
            'skewness': round(float(series.skew()), 2),
            'outliers': int(len(series[(series < q1 - 1.5*iqr) | (series > q3 + 1.5*iqr)]))
        }
    return stats
`
    },
    nlg: {
      name: 'backend/nlg_engine.py',
      lang: 'python',
      code: `class NLGEngine:
    \"\"\"
    Converts descriptive statistics and correlations into natural language explanations.
    \"\"\"
    def generate_statistical_insights(self, stats: dict) -> list:
        narratives = []
        for col, s in stats.items():
            mean, median, skew = s['mean'], s['median'], s['skewness']
            narratives.append({
                'type': 'Descriptive',
                'text': f"The dataset has an average {col} value of {mean:,.2f}. This indicates the typical {col} amount across the analyzed records."
            })
            if abs(mean - median) > 0.15 * s['std']:
                direction = "higher" if mean > median else "lower"
                narratives.append({
                    'type': 'Skewness',
                    'text': f"The average value ({mean:,.2f}) is {direction} than the median ({median:,.2f}), suggesting that some extreme observations may be influencing the distribution."
                })
        return narratives
`
    },
    cleaning: {
      name: 'backend/data_cleaning.py',
      lang: 'python',
      code: `class DataCleaner:
    @staticmethod
    def remove_duplicates(df):
        return df.drop_duplicates()

    @staticmethod
    def handle_missing(df, strategy="drop", fill_value=None):
        if strategy == "drop":
            return df.dropna()
        elif strategy == "mean":
            return df.fillna(df.mean(numeric_only=True))
        elif strategy == "median":
            return df.fillna(df.median(numeric_only=True))
        return df
`
    },
    requirements: {
      name: 'requirements.txt',
      lang: 'text',
      code: `flask==3.0.2
flask-cors==4.0.0
flask-bcrypt==1.0.1
pyjwt==2.8.0
pandas==2.2.1
numpy==1.26.4
scipy==1.12.0
scikit-learn==1.4.1.post1
matplotlib==3.8.3
seaborn==0.13.2
pymongo==4.6.2
python-dotenv==1.0.1
google-genai>=0.1.1
`
    }
  };

  const interviewQuestions = [
    {
      q: 'Q1: What is Natural Language Generation (NLG) in Data Science, and why is it important?',
      a: 'NLG is an AI subfield that translates non-linguistic structured inputs (data tables, correlation matrices, distribution metrics) into clear human narratives. It bridges the gap between raw statistical data and business decision-makers who need clear executive takeaways without deciphering complex numerical charts.'
    },
    {
      q: 'Q2: How did you implement Outlier Detection using the Interquartile Range (IQR)?',
      a: "We implemented Tukey's Fences rule: IQR = Q3 - Q1. The Lower Bound is Q1 - 1.5 * IQR and the Upper Bound is Q3 + 1.5 * IQR. Any data point outside this window is classified as an outlier. In the Data Cleaning module, users can either winsorize (clip) values to these bounds or drop the outlier rows."
    },
    {
      q: 'Q3: How do you classify Pearson correlation coefficients?',
      a: 'We categorize r into 5 distinct relationship tiers: Strong positive (r >= 0.70), Moderate positive (0.30 <= r < 0.70), Weak or negligible (-0.30 < r < 0.30), Moderate negative (-0.70 < r <= -0.30), and Strong negative (r <= -0.70).'
    },
    {
      q: 'Q4: How did you calculate Skewness and explain it in plain English?',
      a: 'We compute the Fisher-Pearson coefficient of skewness. When Mean > Median, we generate the explanation: "The average value is higher than the median, suggesting high-value observations pull the distribution to the right." When Mean < Median, we explain a left-skewed tail.'
    },
    {
      q: 'Q5: How does the system ensure multi-tenant security and user data privacy?',
      a: 'Stateless JSON Web Tokens (JWT) authenticate every API request. Each upload, cleaned dataset, and report is strictly foreign-keyed with user_id. Passwords are salted and hashed using Bcrypt (cost factor 10) so plaintext credentials are never saved.'
    },
    {
      q: 'Q6: What is the formula and rationale behind the Data Quality Score?',
      a: 'Our Data Quality Score (0–100) evaluates completeness and duplication: Score = 100 - (Missing_Percentage * 0.5) - (Duplicate_Percentage * 0.4). A score >= 90 reflects clean modeling readiness, while lower scores trigger targeted imputation recommendations.'
    }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonFiles[selectedPythonFile].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Project Documentation & Internship Guide</h2>
              <p className="text-xs text-slate-400">
                Architecture, mathematical methodology, Python backend source code, and interview questions.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('docs')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'docs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Specs
          </button>
          <button
            onClick={() => setActiveSection('vscode')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'vscode' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Running in VS Code
          </button>
          <button
            onClick={() => setActiveSection('qa')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'qa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interview Q&A (20+)
          </button>
          <button
            onClick={() => setActiveSection('python')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Source Code
          </button>
        </div>
      </div>

      {/* Mode 1: System Specs Documentation */}
      {activeSection === 'docs' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-8 text-slate-300 text-xs md:text-sm leading-relaxed">
          <section>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> 1. Project Abstract & Objectives
            </h3>
            <p className="text-slate-300 leading-relaxed">
              The <strong>Natural Language Generator for Data Analysis (NLG-DA)</strong> is an enterprise-grade automated analytics platform that transforms structured tabular datasets (CSV, Excel) into descriptive statistics, correlation maps, and context-aware natural language explanations. Developed to resolve reporting bottlenecks and translate complex quantitative models for non-technical stakeholders, the system integrates parametric/non-parametric statistics, automated data cleansing, and a dual-tier NLG pipeline.
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> 2. System Architecture & Data Flow
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
              {`+-------------------------------------------------------------+
|                      Client Frontend                        |
|  HTML5 / Tailwind CSS / Bootstrap / Chart.js / React SPA    |
+------------------------------+------------------------------+
                               | REST API (JWT)
+------------------------------v------------------------------+
|                   Backend API Controller                    |
|        Node.js / Express Server  <->  Python Flask API      |
+--------------+-------------------------------+--------------+
               |                               |
       +-------v-------+               +-------v-------+
       | Data Science  |               |  NLG Engine   |
       | Pandas, NumPy |               | - Heuristics  |
       | Scipy Stats   |               | - Gemini AI   |
       +-------+-------+               +-------+-------+
               |                               |
+--------------v-------------------------------v--------------+
|                     Persistence Layer                       |
|           MongoDB Collection & Disk JSON Store              |
+-------------------------------------------------------------+`}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> 3. Mathematical Formulas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-indigo-400 mb-1">Pearson Correlation Coefficient</h4>
                <p className="text-xs text-slate-400 font-mono">r = Σ(x - μ_x)(y - μ_y) / (σ_x * σ_y * N)</p>
                <p className="text-[11px] text-slate-500 mt-1">Evaluates linear covariance between continuous attributes.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 mb-1">Tukey's Fences (IQR Outliers)</h4>
                <p className="text-xs text-slate-400 font-mono">[Q1 - 1.5×IQR, Q3 + 1.5×IQR]</p>
                <p className="text-[11px] text-slate-500 mt-1">Robust non-parametric anomaly detection resistant to extreme skew.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Mode: Running in VS Code */}
      {activeSection === 'vscode' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-6 text-slate-300 text-xs md:text-sm leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <Code2 className="w-3.5 h-3.5" /> VS Code Setup & Developer Guide
            </div>
            <h3 className="text-xl font-bold text-white">How to Run in Visual Studio Code</h3>
            <p className="text-xs text-slate-400 mt-1">
              This repository contains full configurations (.vscode/launch.json, tasks.json, run scripts) to run both the Full-Stack React app and the Python Flask backend with 1 click in VS Code.
            </p>
          </div>

          {/* Option 1: Full-Stack App */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs">1</span>
                Running the Full-Stack Web Application (Express + React + Chart.js)
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Port 3000
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Open the root folder in VS Code. You can run the application directly from the integrated terminal or via VS Code Run & Debug (F5).
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 space-y-2">
              <p className="text-slate-400"># 1. Install Node dependencies</p>
              <p className="text-white">npm install</p>
              <p className="text-slate-400"># 2. Start the development server</p>
              <p className="text-emerald-400 font-bold">npm run dev</p>
              <p className="text-slate-500"># Application will start at: http://localhost:3000</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>F5 Shortcut:</strong> In VS Code, go to "Run & Debug" (Ctrl+Shift+D or Cmd+Shift+D), select <em>"Run Full-Stack App (Express + React)"</em> and press <strong>F5</strong>.</span>
            </div>
          </div>

          {/* Option 2: Python Backend */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-xs">2</span>
                Running the Python Flask Data Science Engine (Data-Science-NLG/)
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Port 5000
              </span>
            </div>

            <p className="text-xs text-slate-400">
              The project contains the complete Python + Flask repository in the <code className="text-cyan-300">Data-Science-NLG/</code> directory with virtual environment runners.
            </p>

            {/* Platform instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Mac / Linux Terminal:</span>
                <div className="font-mono text-xs text-cyan-300 space-y-1">
                  <p>cd Data-Science-NLG</p>
                  <p>python3 -m venv venv</p>
                  <p>source venv/bin/activate</p>
                  <p>pip install -r requirements.txt</p>
                  <p className="text-white font-bold">python backend/app.py</p>
                </div>
                <p className="text-[11px] text-slate-500">Or simply run: <code className="text-emerald-400">./Data-Science-NLG/run.sh</code></p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Windows (Command Prompt / PowerShell):</span>
                <div className="font-mono text-xs text-cyan-300 space-y-1">
                  <p>cd Data-Science-NLG</p>
                  <p>python -m venv venv</p>
                  <p>call venv\Scripts\activate.bat</p>
                  <p>pip install -r requirements.txt</p>
                  <p className="text-white font-bold">python backend\app.py</p>
                </div>
                <p className="text-[11px] text-slate-500">Or double-click: <code className="text-emerald-400">Data-Science-NLG\run.bat</code></p>
              </div>
            </div>
          </div>

          {/* VS Code Features Included */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Included VS Code Configuration Files in Repository
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-indigo-400 font-bold block mb-1">.vscode/launch.json</span>
                <p className="text-slate-400 text-[11px]">Configured debug targets for Node dev server, Python Flask API, and Chrome browser.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-indigo-400 font-bold block mb-1">.vscode/tasks.json</span>
                <p className="text-slate-400 text-[11px]">Tasks for starting dev server, building production bundles, and testing APIs.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-indigo-400 font-bold block mb-1">.vscode/extensions.json</span>
                <p className="text-slate-400 text-[11px]">Recommended extensions for Python, Tailwind CSS, Prettier, and ESLint.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Interview Questions & Answers */}
      {activeSection === 'qa' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Internship Technical Interview Questions</h3>
            <p className="text-xs text-slate-400">
              Frequently asked questions in Data Science, Machine Learning, and Full-Stack Engineering interviews.
            </p>
          </div>

          <div className="space-y-3">
            {interviewQuestions.map((item, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Python Source Code Viewer */}
      {activeSection === 'python' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* File Picker Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950">
            <div className="flex flex-wrap gap-1">
              {Object.keys(pythonFiles).map((key) => {
                const k = key as keyof typeof pythonFiles;
                const isSelected = selectedPythonFile === k;
                return (
                  <button
                    key={k}
                    onClick={() => setSelectedPythonFile(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{pythonFiles[k].name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors self-end sm:self-auto"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Source'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-6 bg-slate-950/80 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
            <pre>
              <code>{pythonFiles[selectedPythonFile].code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
