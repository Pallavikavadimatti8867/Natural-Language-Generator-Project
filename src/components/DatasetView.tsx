import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Search,
  Hash,
  Type,
  AlertCircle,
  Copy,
  Download,
  Filter,
  ArrowUpDown,
  Upload,
  RotateCcw
} from 'lucide-react';
import { DatasetMeta } from '../types';

interface DatasetViewProps {
  dataset: DatasetMeta | null;
  preview: Record<string, any>[];
  onUploadFile: (file: File) => void;
  onLoadSample: (id: 'sales' | 'employee') => void;
  onResetDataset?: () => void;
}

export const DatasetView: React.FC<DatasetViewProps> = ({
  dataset,
  preview,
  onUploadFile,
  onLoadSample,
  onResetDataset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
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

  if (!dataset) {
    return (
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
        }`}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Upload CSV Dataset</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
          Drag and drop a CSV file here, or select from your computer to inspect columns, data types, and preview records.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select CSV File</span>
          </button>
          <button
            onClick={() => onLoadSample('sales')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            Load Sample Sales.csv
          </button>
          <button
            onClick={() => onLoadSample('employee')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            Load Employee Attrition.csv
          </button>
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
    );
  }

  // Filter preview rows
  const filteredRows = preview.filter((row) => {
    if (!searchTerm) return true;
    if (selectedColumn !== 'all') {
      return String(row[selectedColumn] || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return Object.values(row).some((val) =>
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const downloadCSV = () => {
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
    link.setAttribute('download', `${dataset.name.replace(/\.[^/.]+$/, '')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Dataset Header Overview */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{dataset.name}</h2>
              <p className="text-xs text-slate-400">
                Uploaded: {new Date(dataset.uploaded_at).toLocaleString()} • Workspace ID: {dataset.id}
              </p>
            </div>
          </div>
        </div>

        {/* Actions: Upload Different CSV, Reset, Download */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Upload and replace with another CSV file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New CSV</span>
          </button>
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

          {onResetDataset && (
            <button
              onClick={onResetDataset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset and clear current dataset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Dataset</span>
            </button>
          )}

          <button
            onClick={downloadCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Profile Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Total Records</span>
          <span className="text-lg font-bold text-white">{dataset.total_rows.toLocaleString()}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Total Features</span>
          <span className="text-lg font-bold text-white">{dataset.total_columns}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Missing Cells</span>
          <span className={`text-lg font-bold ${dataset.missing_values > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {dataset.missing_values}
          </span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Duplicate Rows</span>
          <span className={`text-lg font-bold ${dataset.duplicate_records > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {dataset.duplicate_records}
          </span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Numerical Cols</span>
          <span className="text-lg font-bold text-cyan-400">{dataset.numerical_columns.length}</span>
        </div>
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">Categorical Cols</span>
          <span className="text-lg font-bold text-purple-400">{dataset.categorical_columns.length}</span>
        </div>
      </div>

      {/* Schema Attributes Breakdown */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Schema Columns & Inferred Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {dataset.columns.map((col) => {
            const isNum = dataset.numerical_columns.includes(col);
            return (
              <div
                key={col}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs"
              >
                {isNum ? (
                  <span className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                    #
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                    T
                  </span>
                )}
                <span className="font-medium text-slate-200">{col}</span>
                <span className="text-[10px] text-slate-400 uppercase">
                  {isNum ? 'Numeric' : 'Categorical'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabular Data Preview with Search & Filters */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search across records..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedColumn}
              onChange={(e) => {
                setSelectedColumn(e.target.value);
                setPage(0);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Columns</option>
              {dataset.columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing {paginatedRows.length} of {filteredRows.length} records
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center text-slate-500">#</th>
                {dataset.columns.map((col) => (
                  <th key={col} className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      {dataset.numerical_columns.includes(col) ? (
                        <span className="text-[10px] text-cyan-400">#</span>
                      ) : (
                        <span className="text-[10px] text-purple-400">T</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-500">
                    {page * rowsPerPage + idx + 1}
                  </td>
                  {dataset.columns.map((col) => {
                    const val = row[col];
                    const isMissing = val === undefined || val === null || val === '' || String(val).trim() === '';
                    return (
                      <td
                        key={col}
                        className={`py-2.5 px-4 whitespace-nowrap ${
                          isMissing
                            ? 'text-amber-400/80 bg-amber-500/5 italic'
                            : 'text-slate-200'
                        }`}
                      >
                        {isMissing ? 'NaN (Missing)' : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
