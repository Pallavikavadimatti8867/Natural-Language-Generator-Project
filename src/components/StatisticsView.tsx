import React, { useState } from 'react';
import {
  BarChart3,
  HelpCircle,
  ArrowUpDown,
  Download,
  Sigma,
  Info,
  Sliders,
  Percent
} from 'lucide-react';
import { ColumnStats, DataQuality, DatasetMeta } from '../types';

interface StatisticsViewProps {
  dataset: DatasetMeta | null;
  stats: Record<string, ColumnStats> | null;
  quality: DataQuality | null;
  onRunAnalysis: () => void;
  loading: boolean;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  dataset,
  stats,
  quality,
  onRunAnalysis,
  loading
}) => {
  const [selectedCol, setSelectedCol] = useState<string>('');

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Dataset Loaded</h3>
        <p className="text-xs text-slate-400">Upload or choose a sample dataset to calculate descriptive statistics.</p>
      </div>
    );
  }

  const numericCols = Object.keys(stats || {});
  const activeCol = selectedCol && stats?.[selectedCol] ? selectedCol : numericCols[0];
  const activeStat = stats && activeCol ? stats[activeCol] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Descriptive Statistics & Exploratory Data Analysis (EDA)</h2>
              <p className="text-xs text-slate-400">
                Parametric & non-parametric central tendencies, dispersion, quartile distributions, and skewness.
              </p>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={onRunAnalysis}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <BarChart3 className="w-3.5 h-3.5" />
          )}
          <span>Re-compute EDA Statistics</span>
        </button>
      </div>

      {/* Primary Metrics Grid for selected feature */}
      {activeStat && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                Deep Dive Metric Inspector
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Feature: {activeCol}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  N = {activeStat.count} records
                </span>
              </h3>
            </div>

            {/* Column Switcher */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Switch Feature:</label>
              <select
                value={activeCol}
                onChange={(e) => setSelectedCol(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {numericCols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Mean (μ)</span>
              <span className="text-base font-bold text-white">{activeStat.mean.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Arithmetic average</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Median (Q2)</span>
              <span className="text-base font-bold text-indigo-300">{activeStat.median.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block mt-1">50th percentile</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Mode</span>
              <span className="text-base font-bold text-purple-300">{activeStat.mode.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Most frequent value</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Std Deviation (σ)</span>
              <span className="text-base font-bold text-amber-300">{activeStat.std.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Spread / Dispersion</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">IQR (Q3 - Q1)</span>
              <span className="text-base font-bold text-cyan-300">{activeStat.iqr.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Middle 50% spread</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Skewness</span>
              <span className={`text-base font-bold ${activeStat.skewness > 0.5 ? 'text-amber-400' : activeStat.skewness < -0.5 ? 'text-blue-400' : 'text-emerald-400'}`}>
                {activeStat.skewness > 0 ? `+${activeStat.skewness}` : activeStat.skewness}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {activeStat.skewness > 0.5 ? 'Right-skewed' : activeStat.skewness < -0.5 ? 'Left-skewed' : 'Symmetric'}
              </span>
            </div>
          </div>

          {/* Tukey Outlier & Quartile Visual Bar */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400">Min:</span> <strong className="text-white font-mono">{activeStat.min.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Q1 (25%):</span> <strong className="text-slate-200 font-mono">{activeStat.q1.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Median:</span> <strong className="text-indigo-400 font-mono">{activeStat.median.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Q3 (75%):</span> <strong className="text-slate-200 font-mono">{activeStat.q3.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Max:</span> <strong className="text-white font-mono">{activeStat.max.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tukey Outliers:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${activeStat.outlier_count > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {activeStat.outlier_count} ({activeStat.outlier_percentage}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Master Statistics Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            All Numerical Columns Statistical Summary Table
          </h3>
          <span className="text-xs text-slate-500">{numericCols.length} numerical columns computed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature Column</th>
                <th className="py-3 px-3 text-right">Mean</th>
                <th className="py-3 px-3 text-right">Median</th>
                <th className="py-3 px-3 text-right">Mode</th>
                <th className="py-3 px-3 text-right">Std Dev</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-right">Min</th>
                <th className="py-3 px-3 text-right">Max</th>
                <th className="py-3 px-3 text-right">Range</th>
                <th className="py-3 px-3 text-right">Q1 (25%)</th>
                <th className="py-3 px-3 text-right">Q3 (75%)</th>
                <th className="py-3 px-3 text-right">IQR</th>
                <th className="py-3 px-3 text-right">Skewness</th>
                <th className="py-3 px-4 text-center">Outliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {numericCols.map((col) => {
                const s = stats![col];
                const isSelected = col === activeCol;
                return (
                  <tr
                    key={col}
                    onClick={() => setSelectedCol(col)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-600/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-white whitespace-nowrap flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {col}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">{s.mean.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-indigo-300">{s.median.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{s.mode.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-amber-300">{s.std.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{s.variance.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{s.min.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{s.max.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{s.range.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{s.q1.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{s.q3.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-cyan-300">{s.iqr.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={s.skewness > 0.5 ? 'text-amber-400' : s.skewness < -0.5 ? 'text-blue-400' : 'text-slate-300'}>
                        {s.skewness > 0 ? `+${s.skewness}` : s.skewness}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.outlier_count > 0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
                        }`}
                      >
                        {s.outlier_count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
