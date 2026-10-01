# Natural Language Generator for Data Analysis

An AI-powered Data Science web application that analyzes structured datasets and automatically converts statistical results, patterns, trends, and visualizations into meaningful natural-language insights and executive reports.

---

## 1. Project Abstract
Modern organizations generate vast amounts of structured tabular data. However, translating raw numerical tables, correlation matrices, and distribution graphs into actionable business narratives usually requires manual interpretation by skilled data scientists. This project presents the **Natural Language Generator for Data Analysis (NLG-DA)**, an automated data science platform that ingests CSV and Excel datasets, computes rigorous exploratory and descriptive statistics, detects anomalies and correlations, and synthesizes clear, context-aware human language narratives. By coupling mathematical data science principles with Natural Language Generation (both deterministic statistical heuristics and Large Language Model reasoning), non-technical stakeholders can instantly comprehend complex dataset behavior.

---

## 2. Problem Statement
- **Cognitive Overload**: Raw statistical tables (kurtosis, IQR, p-values, covariance) are difficult for non-technical managers and business decision-makers to digest.
- **Reporting Bottleneck**: Data scientists spend up to 40% of their working hours manually typing repetitive EDA summaries and chart commentary.
- **Inconsistent Interpretations**: Subjective human interpretations often miss subtle outlier effects, distributional skewness, or confounding multi-variable correlations.

---

## 3. Objectives
1. Provide a secure user authentication system (Bcrypt password hashing + JWT) with isolated user workspaces.
2. Ingest structured datasets (CSV, Excel) with immediate validation, schema profiling, and missing value diagnosis.
3. Compute complete descriptive statistics: Mean, Median, Mode, Standard Deviation, Variance, Min, Max, Range, Q1, Q3, Interquartile Range (IQR), and Skewness.
4. Evaluate comprehensive data quality metrics: Completeness percentage, Missing cell distribution, Duplication rate, and an algorithmic Data Quality Score (0–100).
5. Compute Pearson correlation coefficients and categorize relationships into strong positive, moderate positive, weak, moderate negative, and strong negative.
6. Provide an interactive Data Cleaning suite: de-duplication, imputation strategies (mean, median, mode, constant), column dropping/renaming, IQR outlier handling (clipping or pruning), and normalization (Min-Max, Z-score).
7. Automatically generate natural-language explanations of statistical results, patterns, trends, distributions, and outliers.
8. Deliver an interactive visualization suite (Bar, Line, Pie, Doughnut, Histogram, Scatter, Heatmap) via Chart.js.
9. Generate a one-click executive Data Analysis Report with printable export and AI-driven strategic synthesis.
10. Store user-scoped upload history, reports, and previous analytical runs in MongoDB.

---

## 4. Existing System vs. Proposed System

| Feature | Existing Manual System | Proposed NLG-DA System |
| :--- | :--- | :--- |
| **Analysis Speed** | Hours to days per dataset | Instantaneous (< 3 seconds) |
| **Statistical Interpretation** | Manual spreadsheet drafting | Algorithmic & AI Natural Language generation |
| **Data Cleaning** | Error-prone manual filters | Automated pipeline (Impute, Clip, Deduplicate) |
| **Visualizations** | Static image exports | Interactive reactive Chart.js charts |
| **Accessibility** | Requires statistical expertise | Plain English explanations for any stakeholder |
| **History & Storage** | Dispersed files | Secure user-scoped cloud repository |

---

## 5. System Architecture
```
                  [ Web Client (HTML5 / Bootstrap / React / Chart.js) ]
                                          |
                              REST API via HTTPS / JSON
                                          |
                                          v
                    [ Flask / Express REST API Controller Layer ]
                                          |
               +--------------------------+--------------------------+
               |                          |                          |
               v                          v                          v
    [ Auth / Session ]          [ Data Science Engine ]       [ NLG Engine ]
    - JWT Verification          - Pandas & NumPy Profiling    - Template Heuristics
    - Bcrypt Hashing            - Scipy Skew & Outliers       - Semantic Grammar
    - Role Permissions          - Pearson Correlation Matrix  - Gemini 3.8 LLM Synthesis
               |                          |                          |
               +--------------------------+--------------------------+
                                          |
                                          v
                              [ MongoDB / Storage Layer ]
                              - Users Collection
                              - Datasets Collection
                              - Reports & History
```

---

## 6. Data Flow Diagram (DFD)
1. **User Action**: User registers/logs in and uploads `sales.csv`.
2. **File Validation**: Backend verifies MIME type, row count, and structural integrity.
3. **Data Profiling**:
   - Column types identified (Numerical vs Categorical vs DateTime).
   - Missing and duplicate checks executed.
4. **Statistical Computation**:
   - Five-number summary + Mean, Mode, Std Dev, Variance, Skewness computed.
   - Outliers identified using Tukey's Fences ($Q_1 - 1.5 \times IQR$ and $Q_3 + 1.5 \times IQR$).
   - Full pairwise Pearson correlation calculated.
5. **NLG Processing**:
   - Statistical facts are mapped to semantic linguistic templates.
   - Deep insights are generated: skewness impact, correlation direction, dominant category contributions.
   - AI synthesis formulates executive summary and action items.
6. **Frontend Rendering**:
   - Responsive KPI cards, interactive Chart.js graphs, downloadable report, and data cleaning preview.

---

## 7. Technology Stack
- **Frontend**: HTML5, CSS3, Tailwind CSS / Bootstrap, Modern JavaScript / TypeScript, Chart.js, Lucide Icons.
- **Backend API**: Python 3.10+, Flask / Express.js, REST API architecture.
- **Data Science**: Pandas, NumPy, SciPy, Scikit-learn.
- **Natural Language Processing**: Algorithmic Semantic Template Engine + Google Gemini 3.8 Flash (`@google/genai`).
- **Database**: MongoDB (with fallback in-memory document store).
- **Security**: Bcrypt password hashing, JSON Web Tokens (JWT), strictly sanitized file uploads.

---

## 8. Database Schema Design (MongoDB)
- **`users` Collection**:
  - `_id`: ObjectId
  - `user_id`: UUID string
  - `name`: string
  - `email`: string (unique indexed)
  - `password_hash`: string (bcrypt blowfish)
  - `registration_date`: ISO datetime
  - `last_login`: ISO datetime
- **`datasets` Collection**:
  - `_id`: ObjectId
  - `id`: UUID string
  - `user_id`: UUID string (foreign key to users)
  - `name`: string
  - `total_rows`: integer
  - `total_columns`: integer
  - `numerical_columns`: array of strings
  - `categorical_columns`: array of strings
  - `uploaded_at`: ISO datetime
- **`reports` Collection**:
  - `_id`: ObjectId
  - `report_id`: UUID string
  - `user_id`: UUID string
  - `title`: string
  - `executive_summary`: string
  - `data_quality`: object
  - `statistics`: object
  - `created_at`: ISO datetime

---

## 9. Natural Language Generation (NLG) Methodology
The system employs a dual-stage hybrid NLG pipeline:
1. **Deterministic Micro-Planning (Direct Heuristic NLG)**:
   - Evaluates mathematical criteria directly (e.g. if $|r| \ge 0.70 \implies$ "Strong positive relationship").
   - Explains skewness: if $Mean > Median + (0.15 \times \sigma) \implies$ right-skewed with high-value observations pulling the average.
   - Explains outlier presence: detects observations outside Tukey's bounds and verbalizes count and percentage.
2. **Generative Macro-Planning (Deep AI Synthesis)**:
   - Aggregates the computed statistical facts into a cohesive structured prompt.
   - Utilizes `gemini-3.8-flash` to craft strategic, executive-level summaries, cross-variable reasoning, and risk recommendations.

---

## 10. Internship Interview Questions & Answers

### Q1: What is Natural Language Generation (NLG) in the context of Data Science?
**Answer**: NLG is a subfield of Artificial Intelligence and Computational Linguistics focused on turning non-linguistic inputs (such as structured database tables, statistical metrics, and mathematical models) into natural, readable human language. In Data Science, it bridges the gap between raw quantitative outputs and business understanding.

### Q2: How did you compute outliers in numerical columns?
**Answer**: We utilized Tukey's Fences method based on the Interquartile Range (IQR):
$$IQR = Q_3 - Q_1$$
$$\text{Lower Bound} = Q_1 - 1.5 \times IQR$$
$$\text{Upper Bound} = Q_3 + 1.5 \times IQR$$
Any observation falling outside these boundaries is flagged as an outlier. In our data cleaning module, users can choose between clipping (winsorization) or dropping these rows.

### Q3: Why is Pearson correlation sensitive to outliers?
**Answer**: Pearson's $r$ evaluates the covariance of two variables divided by the product of their standard deviations. Because both the sample mean and variance use squared deviations, extreme values can disproportionately inflate or deflate $r$. That is why our NLG engine cross-references outlier counts before issuing strong correlation claims.

### Q4: How is password security guaranteed in your system?
**Answer**: Plaintext passwords are never stored. Passwords are salted and hashed using Bcrypt with a work factor of 10. When a user authenticates, Bcrypt verifies the candidate password against the cryptographic hash in constant time, preventing timing attacks. Stateless authentication is handled using signed JWT tokens.

### Q5: How does your system ensure users only access their own data?
**Answer**: All dataset uploads, analysis outputs, and saved reports are tagged with the authenticated user's unique `user_id` extracted from the verified JWT payload. Database queries enforce strict equality filtering (`{'user_id': current_user.user_id}`).

---

## 11. How to Run the Python Backend Locally
```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Start Flask REST API
python backend/app.py
```
API runs on `http://127.0.0.1:5000`.
