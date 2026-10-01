import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Layers,
  Sparkles,
  BarChart3,
  GitCompare,
  Eraser,
  FileText,
  AlertTriangle,
  Copy,
  Hash,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileCode,
  RotateCcw
} from 'lucide-react';
import { DatasetMeta, DataQuality, ColumnStats } from '../types';

interface DashboardViewProps {
  dataset: DatasetMeta | null;
  quality: DataQuality | null;
  stats: Record<string, ColumnStats> | null;
  onNavigate: (tab: string) => void;
  onUploadFile: (file: File) => void;
  onLoadSample: (id: 'sales' | 'employee') => void;
  onRunAnalysis: () => void;
  onResetDataset?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dataset,
  quality,
  stats,
  onNavigate,
  onUploadFile,
  onLoadSample,
  onRunAnalysis,
  onResetDataset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Data Science & Natural Language Generation
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Natural Language Generator for Data Analysis
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Upload any tabular CSV or Excel dataset to automatically compute statistical profiles, perform data cleaning, discover hidden correlations, and generate human-readable natural language insights and executive reports.
            </p>
          </div>

            {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{dataset ? 'Upload Different CSV' : 'Upload CSV / Excel'}</span>
            </button>
            <button
              onClick={() => onLoadSample('sales')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Load Sample Sales.csv</span>
            </button>
            {dataset && onResetDataset && (
              <button
                onClick={onResetDataset}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                title="Reset active dataset"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset Dataset</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Dataset State: If no dataset loaded */}
      {!dataset ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
            dragActive
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Upload Your Dataset to Begin</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Drag and drop a CSV file here, or choose from our pre-loaded real-world internship datasets to run automatic exploratory data analysis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Browse Files from Computer
            </button>
            <button
              onClick={() => onLoadSample('sales')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              Load Sales & Revenue (Clean)
            </button>
            <button
              onClick={() => onLoadSample('employee')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              Load Employee Attrition (With Nulls & Duplicates)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Section 9: 6 Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Total Rows */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Total Rows</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{dataset.total_rows.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">Observed records</p>
            </div>

            {/* 2. Total Columns */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Total Columns</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{dataset.total_columns}</p>
              <p className="text-[11px] text-slate-500 mt-1">Variables in schema</p>
            </div>

            {/* 3. Missing Values */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Missing Values</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  dataset.missing_values > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${dataset.missing_values > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {dataset.missing_values}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {dataset.missing_values > 0 ? 'Requires cleaning' : 'Zero missing values'}
              </p>
            </div>

            {/* 4. Duplicate Rows */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Duplicate Rows</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  dataset.duplicate_records > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Copy className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${dataset.duplicate_records > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {dataset.duplicate_records}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {dataset.duplicate_records > 0 ? 'Redundant records' : 'All rows unique'}
              </p>
            </div>

            {/* 5. Numerical Columns */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Numerical Cols</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{dataset.numerical_columns.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Ready for metrics</p>
            </div>

            {/* 6. Categorical Columns */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Categorical Cols</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{dataset.categorical_columns.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Text / Discrete classes</p>
            </div>
          </div>

          {/* Data Quality & Quick Navigation Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Quality Gauge Card */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Data Quality Health
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Automated Audit
                  </span>
                </div>

                <div className="flex items-center gap-5 my-4">
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          (quality?.data_quality_score || 95) >= 90
                            ? 'text-emerald-500'
                            : (quality?.data_quality_score || 95) >= 70
                            ? 'text-amber-500'
                            : 'text-red-500'
                        }
                        strokeDasharray={`${quality?.data_quality_score || 95}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xl font-extrabold text-white">
                        {quality?.data_quality_score ?? 98}
                      </span>
                      <span className="text-[10px] block text-slate-400 -mt-1">/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Completeness:</span>
                      <span className="font-semibold text-slate-200">
                        {quality?.completeness_percentage ?? 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Missing Rate:</span>
                      <span className="font-semibold text-slate-200">
                        {quality?.missing_percentage ?? 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Duplication Rate:</span>
                      <span className="font-semibold text-slate-200">
                        {quality?.duplicate_percentage ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  {(quality?.data_quality_score || 95) >= 90
                    ? 'Dataset exhibits high integrity. Ready for descriptive modeling and NLG generation.'
                    : 'Some data anomalies detected. Using the Data Cleaning tab is recommended.'}
                </p>
              </div>

              {(dataset.missing_values > 0 || dataset.duplicate_records > 0) && (
                <button
                  onClick={() => onNavigate('cleaning')}
                  className="mt-4 w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" /> Launch Data Cleaning Studio
                </button>
              )}
            </div>

            {/* Module Launchpad */}
            <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Analytics & Natural Language Generation Workflow
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Step-by-step pipeline from raw tabular input to automated AI reports
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onNavigate('statistics')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1">
                        Descriptive Statistics & EDA <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mean, median, mode, IQR, variance, skewness, and outliers.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigate('correlation')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <GitCompare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1">
                        Correlation Analysis <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pearson matrix with strong/weak relationship classifications.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigate('insights')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-violet-300 flex items-center gap-1">
                        Natural Language Insights <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automatic text narratives explaining trends, anomalies & categories.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigate('reports')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 flex items-center gap-1">
                        Generate Executive Report <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Comprehensive printable report with AI strategic conclusion.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Quick Row */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Dataset: {dataset.name}
                </span>
                <button
                  onClick={() => onNavigate('docs')}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <FileCode className="w-3.5 h-3.5" /> View Python Source & Interview Q&A
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
