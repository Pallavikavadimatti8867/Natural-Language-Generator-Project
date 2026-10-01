import React from 'react';
import { History, FileSpreadsheet, FileText, Trash2, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { DatasetMeta } from '../types';

interface HistoryViewProps {
  datasets: DatasetMeta[];
  reports: any[];
  onDelete: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  datasets,
  reports,
  onDelete,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">User Analytics & Report History</h2>
            <p className="text-xs text-slate-400">
              Private archive of your uploaded datasets, exploratory sessions, and generated reports.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Datasets */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Uploaded Datasets ({datasets.length})
            </h3>
            <span className="text-[11px] text-slate-500">Auto-saved to user workspace</span>
          </div>

          {datasets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No datasets uploaded yet in this user account.
            </p>
          ) : (
            <div className="space-y-3">
              {datasets.map((ds) => (
                <div
                  key={ds.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{ds.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ds.total_rows} rows • {ds.total_columns} columns • {ds.numerical_columns?.length || 0} numeric
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(ds.uploaded_at).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onDelete(ds.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Reports */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Generated Executive Reports ({reports.length})
            </h3>
            <span className="text-[11px] text-slate-500">Persistent archives</span>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No reports generated yet. Go to the "Reports" tab to generate one.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.report_id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-indigo-300 truncate">{rep.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {rep.executive_summary}
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(rep.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onNavigate('reports')}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(rep.report_id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
