import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  Download,
  ShieldCheck,
  TrendingUp,
  Layers,
  BarChart3,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { GeneratedReport, DatasetMeta } from '../types';

interface ReportViewProps {
  report: GeneratedReport | null;
  dataset: DatasetMeta | null;
  onGenerateReport: () => void;
  loading: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  dataset,
  onGenerateReport,
  loading
}) => {
  const [copied, setCopied] = useState(false);

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Dataset</h3>
        <p className="text-xs text-slate-400">Load a dataset to generate a formal natural language report.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `# ${report.title}

## Executive Conclusion
${report.ai_executive_conclusion}

## Strategic Recommendations
${report.strategic_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Dataset Overview
- Dataset Name: ${report.dataset_overview.name}
- Total Records: ${report.dataset_overview.total_rows}
- Features: ${report.dataset_overview.total_columns}

## Data Quality Audit
- Score: ${report.data_quality.score}/100
- Completeness: ${report.data_quality.completeness}%
- Missing Cells: ${report.data_quality.missing_cells}
- Duplicate Rows: ${report.data_quality.duplicate_rows}

## Key Statistical Highlights
${report.statistical_summary.highlights.map(h => `- **${h.column}**: Mean = ${h.mean}, Median = ${h.median}, Std = ${h.std}, Range = [${h.min}, ${h.max}]`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Button */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Automated Natural Language Report</h2>
              <p className="text-xs text-slate-400">
                Generate an end-to-end data science report with executive narrative, data audit, and AI recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
              </button>
            </>
          )}

          <button
            disabled={loading}
            onClick={onGenerateReport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{report ? 'Regenerate Report' : 'Generate Full Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Document Body */}
      {report ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-slate-100 max-w-5xl mx-auto space-y-8">
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> AI Data Science Intelligence Report
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {report.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Generated at: {report.created_at ? new Date(report.created_at).toLocaleString() : new Date().toLocaleString()} • Evaluator: NLG Data Science Studio
            </p>
          </div>

          {/* Section 1: Executive AI Conclusion */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI-Generated Executive Conclusion
            </h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {report.ai_executive_conclusion}
            </p>
          </div>

          {/* Strategic Recommendations */}
          {report.strategic_recommendations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Strategic Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.strategic_recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Dataset Overview & Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Dataset Overview
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Dataset Name:</span>
                  <span className="font-semibold text-white">{report.dataset_overview.name}</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Total Observations:</span>
                  <span className="font-semibold text-white">{report.dataset_overview.total_rows.toLocaleString()}</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Total Attributes:</span>
                  <span className="font-semibold text-white">{report.dataset_overview.total_columns}</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Numerical Columns:</span>
                  <span className="font-semibold text-cyan-400">{report.dataset_overview.numerical_columns.length}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">Categorical Columns:</span>
                  <span className="font-semibold text-purple-400">{report.dataset_overview.categorical_columns.length}</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Data Quality Audit
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-emerald-400">{report.data_quality.score}</span>
                  <span className="text-[9px] text-slate-400 -mt-1">/100</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-slate-300">
                    Completeness: <strong>{report.data_quality.completeness}%</strong>
                  </p>
                  <p className="text-slate-400">
                    Missing cells: {report.data_quality.missing_cells} • Duplicates: {report.data_quality.duplicate_rows}
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-slate-400">
                {report.data_quality.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Statistical Summary Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Key Feature Statistics & Narratives
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Column</th>
                    <th className="py-2.5 px-3 text-right">Mean</th>
                    <th className="py-2.5 px-3 text-right">Median</th>
                    <th className="py-2.5 px-3 text-right">Std Dev</th>
                    <th className="py-2.5 px-3 text-right">Min</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                    <th className="py-2.5 px-3">Natural Language Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans text-xs">
                  {report.statistical_summary.highlights.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white font-mono">{h.column}</td>
                      <td className="py-2.5 px-3 text-right text-slate-200 font-mono">{h.mean.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-indigo-300 font-mono">{h.median.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-amber-300 font-mono">{h.std.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{h.min.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{h.max.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed max-w-xs">{h.narrative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Important Patterns & Relationships */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-400" /> Detected Patterns, Correlations & Anomalies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-indigo-400 mb-2">Correlation Tendencies</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report.important_patterns.correlations.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-rose-400 mb-2">Outlier Observations</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report.important_patterns.outliers.map((o, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Report Not Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Click the "Generate Full Report" button to execute comprehensive descriptive statistics, outlier audits, and AI executive synthesis.
          </p>
          <button
            onClick={onGenerateReport}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Full Data Science Report</span>
          </button>
        </div>
      )}
    </div>
  );
};
