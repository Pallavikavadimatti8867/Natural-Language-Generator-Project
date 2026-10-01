import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  GitCompare,
  AlertTriangle,
  FolderTree,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { InsightItem, DatasetMeta } from '../types';

interface InsightsViewProps {
  dataset: DatasetMeta | null;
  insights: InsightItem[];
  onGenerateInsights: () => void;
  loading: boolean;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  dataset,
  insights,
  onGenerateInsights,
  loading
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Dataset</h3>
        <p className="text-xs text-slate-400">Load a dataset to generate automatic Natural Language Insights.</p>
      </div>
    );
  }

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: 'all', label: 'All Insights', count: insights.length },
    { id: 'Statistical', label: 'Statistical', count: insights.filter(i => i.type === 'Statistical').length },
    { id: 'Correlation', label: 'Correlation', count: insights.filter(i => i.type === 'Correlation').length },
    { id: 'Trend', label: 'Trends', count: insights.filter(i => i.type === 'Trend').length },
    { id: 'Category', label: 'Categories', count: insights.filter(i => i.type === 'Category').length },
    { id: 'Outlier', label: 'Outliers', count: insights.filter(i => i.type === 'Outlier').length },
    { id: 'Missing Data', label: 'Data Quality', count: insights.filter(i => i.type === 'Missing Data').length }
  ];

  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Natural Language Generation (NLG) Insights</h2>
              <p className="text-xs text-slate-400">
                Transform quantitative metrics, statistical distributions, and correlation patterns into clear English explanations.
              </p>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={onGenerateInsights}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          <span>Regenerate NLG Insights</span>
        </button>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        {categories.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map((insight) => {
          const isSpeaking = speakingId === insight.id;
          const isCopied = copiedId === insight.id;

          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let icon = <Info className="w-4 h-4 text-indigo-400" />;

          if (insight.type === 'Trend') {
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            icon = <TrendingUp className="w-4 h-4 text-emerald-400" />;
          } else if (insight.type === 'Correlation') {
            badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            icon = <GitCompare className="w-4 h-4 text-indigo-400" />;
          } else if (insight.type === 'Outlier') {
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
          } else if (insight.type === 'Category') {
            badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            icon = <FolderTree className="w-4 h-4 text-purple-400" />;
          } else if (insight.type === 'Missing Data') {
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          }

          return (
            <div
              key={insight.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {icon}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {insight.type}
                    </span>
                  </div>

                  {insight.badge && (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {insight.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                  {insight.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                  "{insight.text}"
                </p>
              </div>

              {/* Card Footer: Audio Listen & Copy */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-500">
                  {insight.column ? `Column: ${insight.column}` : 'Cross-attribute evaluation'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeak(insight.text, insight.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop Audio' : 'Listen via Text-to-Speech'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(insight.text, insight.id)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy narrative"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
