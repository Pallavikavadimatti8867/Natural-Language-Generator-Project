import React, { useState } from 'react';
import {
  Eraser,
  Copy,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Edit2,
  Sliders,
  Maximize2,
  Download,
  ArrowRight
} from 'lucide-react';
import { DatasetMeta } from '../types';

interface DataCleaningViewProps {
  dataset: DatasetMeta | null;
  preview: Record<string, any>[];
  onCleanAction: (action: string, params?: Record<string, any>) => Promise<void>;
  loading: boolean;
  cleanMessage: string | null;
}

export const DataCleaningView: React.FC<DataCleaningViewProps> = ({
  dataset,
  preview,
  onCleanAction,
  loading,
  cleanMessage
}) => {
  // State for missing values
  const [missingStrategy, setMissingStrategy] = useState<'drop' | 'mean' | 'median' | 'mode' | 'constant'>('drop');
  const [missingConstant, setMissingConstant] = useState('0');
  const [selectedColMissing, setSelectedColMissing] = useState<string>('all');

  // State for column renaming
  const [oldColName, setOldColName] = useState('');
  const [newColName, setNewColName] = useState('');

  // State for dropping column
  const [colToDrop, setColToDrop] = useState('');

  // State for outliers
  const [outlierCol, setOutlierCol] = useState('');
  const [outlierMethod, setOutlierMethod] = useState<'clip' | 'remove'>('clip');

  // State for normalization
  const [normCol, setNormCol] = useState('');
  const [normMethod, setNormMethod] = useState<'minmax' | 'standardize'>('minmax');

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <Eraser className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Dataset</h3>
        <p className="text-xs text-slate-400">Please upload or load a dataset first to perform data cleaning.</p>
      </div>
    );
  }

  const handleRemoveDuplicates = () => {
    onCleanAction('remove_duplicates');
  };

  const handleHandleMissing = () => {
    const cols = selectedColMissing === 'all' ? dataset.columns : [selectedColMissing];
    onCleanAction('handle_missing', {
      strategy: missingStrategy,
      fill_value: missingConstant,
      columns: cols
    });
  };

  const handleRenameColumn = () => {
    if (!oldColName || !newColName || oldColName === newColName) return;
    onCleanAction('rename_column', {
      old_name: oldColName,
      new_name: newColName
    });
    setOldColName('');
    setNewColName('');
  };

  const handleDropColumn = () => {
    if (!colToDrop) return;
    onCleanAction('drop_column', { column: colToDrop });
    setColToDrop('');
  };

  const handleOutliersAction = () => {
    if (!outlierCol) return;
    onCleanAction('handle_outliers', {
      column: outlierCol,
      method: outlierMethod
    });
  };

  const handleNormalizeAction = () => {
    if (!normCol) return;
    onCleanAction('normalize', {
      column: normCol,
      method: normMethod
    });
  };

  const downloadCleanedCSV = () => {
    if (preview.length === 0) return;
    const headers = dataset.columns.join(',');
    const rows = preview.map((r) =>
      dataset.columns
        .map((col) => {
          const val = r[col] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Eraser className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Data Cleaning & Transformation Studio</h2>
              <p className="text-xs text-slate-400">
                Purify raw data: de-duplicate, impute missing values, filter outliers, and normalize features.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={downloadCleanedCSV}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Cleaned Dataset</span>
        </button>
      </div>

      {/* Status banner */}
      {cleanMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{cleanMessage}</span>
        </div>
      )}

      {/* Cleaning Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Tool 1: Deduplication */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Copy className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">De-duplication</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Identify and eliminate redundant records matching all column attributes.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-4">
              <span className="text-slate-400">Duplicate Rows in Memory: </span>
              <span className={`font-bold ${dataset.duplicate_records > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {dataset.duplicate_records}
              </span>
            </div>
          </div>
          <button
            disabled={loading || dataset.duplicate_records === 0}
            onClick={handleRemoveDuplicates}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Remove Duplicate Rows</span>
          </button>
        </div>

        {/* Tool 2: Missing Value Imputation */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Missing Value Imputation</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Drop null rows or impute using mathematical statistics.
            </p>
            <div className="space-y-2 mb-4">
              <select
                value={selectedColMissing}
                onChange={(e) => setSelectedColMissing(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="all">Apply to All Columns</option>
                {dataset.columns.map((c) => (
                  <option key={c} value={c}>
                    Column: {c}
                  </option>
                ))}
              </select>

              <select
                value={missingStrategy}
                onChange={(e: any) => setMissingStrategy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="drop">Drop Incomplete Rows</option>
                <option value="mean">Impute Mean (Numeric)</option>
                <option value="median">Impute Median (Numeric)</option>
                <option value="mode">Impute Mode (Most Frequent)</option>
                <option value="constant">Fill with Constant</option>
              </select>

              {missingStrategy === 'constant' && (
                <input
                  type="text"
                  placeholder="Constant fill value..."
                  value={missingConstant}
                  onChange={(e) => setMissingConstant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                />
              )}
            </div>
          </div>
          <button
            disabled={loading}
            onClick={handleHandleMissing}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Apply Imputation Strategy
          </button>
        </div>

        {/* Tool 3: Outlier Treatment (Tukey 1.5 IQR) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Sliders className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Outlier Handling (IQR)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Detect extreme values beyond [Q1 - 1.5×IQR, Q3 + 1.5×IQR] and clip or prune them.
            </p>
            <div className="space-y-2 mb-4">
              <select
                value={outlierCol}
                onChange={(e) => setOutlierCol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">Select Numeric Feature...</option>
                {dataset.numerical_columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={outlierMethod}
                onChange={(e: any) => setOutlierMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="clip">Winsorize / Clip to Tukey Boundaries</option>
                <option value="remove">Filter / Remove Outlier Rows</option>
              </select>
            </div>
          </div>
          <button
            disabled={loading || !outlierCol}
            onClick={handleOutliersAction}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-cyan-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Handle Feature Outliers
          </button>
        </div>

        {/* Tool 4: Feature Normalization */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Maximize2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Feature Normalization</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Rescale numerical attributes for machine learning modeling.
            </p>
            <div className="space-y-2 mb-4">
              <select
                value={normCol}
                onChange={(e) => setNormCol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">Select Target Feature...</option>
                {dataset.numerical_columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={normMethod}
                onChange={(e: any) => setNormMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="minmax">Min-Max Scaling [0, 1]</option>
                <option value="standardize">Z-Score Standardization (μ=0, σ=1)</option>
              </select>
            </div>
          </div>
          <button
            disabled={loading || !normCol}
            onClick={handleNormalizeAction}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-purple-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Scale Column
          </button>
        </div>

        {/* Tool 5: Rename Column */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Edit2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Rename Column</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Standardize feature naming conventions (snake_case or clean labels).
            </p>
            <div className="space-y-2 mb-4">
              <select
                value={oldColName}
                onChange={(e) => setOldColName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">Current Column...</option>
                {dataset.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New column name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
          <button
            disabled={loading || !oldColName || !newColName}
            onClick={handleRenameColumn}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Rename Feature
          </button>
        </div>

        {/* Tool 6: Drop Column */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Drop Feature Column</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Prune uninformative, redundant or sensitive attributes from dataset.
            </p>
            <div className="mb-4">
              <select
                value={colToDrop}
                onChange={(e) => setColToDrop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">Select column to discard...</option>
                {dataset.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            disabled={loading || !colToDrop}
            onClick={handleDropColumn}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 disabled:opacity-40 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            Drop Column
          </button>
        </div>
      </div>

      {/* Live Cleaned Preview Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Live Preview of Cleaned Dataset ({preview.length} rows loaded)
          </h3>
          <span className="text-[11px] text-slate-400">
            Changes apply instantly to analytical memory
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                {dataset.columns.map((c) => (
                  <th key={c} className="py-2.5 px-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {preview.slice(0, 8).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                  {dataset.columns.map((c) => (
                    <td key={c} className="py-2 px-3 whitespace-nowrap">
                      {String(row[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
