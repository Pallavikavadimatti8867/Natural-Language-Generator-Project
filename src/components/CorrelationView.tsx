import React, { useState } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Minus, Info, ArrowRight } from 'lucide-react';
import { CorrelationResult, DatasetMeta } from '../types';

interface CorrelationViewProps {
  dataset: DatasetMeta | null;
  correlations: CorrelationResult | null;
  onNavigateVisualizations: () => void;
}

export const CorrelationView: React.FC<CorrelationViewProps> = ({
  dataset,
  correlations,
  onNavigateVisualizations
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <GitCompare className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Dataset Loaded</h3>
        <p className="text-xs text-slate-400">Load a dataset to calculate bivariate Pearson correlations.</p>
      </div>
    );
  }

  const pairs = correlations?.pairs || [];
  const filteredPairs = pairs.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'positive') return p.correlation > 0.3;
    if (filterType === 'negative') return p.correlation < -0.3;
    if (filterType === 'weak') return Math.abs(p.correlation) <= 0.3;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pearson Correlation Analysis</h2>
              <p className="text-xs text-slate-400">
                Determine linear co-movement between pairs of continuous numerical indicators.
              </p>
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Pairs ({pairs.length})
          </button>
          <button
            onClick={() => setFilterType('positive')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'positive' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Positive (r &gt; 0.3)
          </button>
          <button
            onClick={() => setFilterType('negative')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'negative' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Negative (r &lt; -0.3)
          </button>
          <button
            onClick={() => setFilterType('weak')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'weak' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weak (|r| &le; 0.3)
          </button>
        </div>
      </div>

      {/* Correlation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPairs.map((pair, idx) => {
          const isPos = pair.correlation > 0;
          const isStrong = Math.abs(pair.correlation) >= 0.7;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      pair.category === 'Strong positive'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : pair.category === 'Moderate positive'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : pair.category === 'Strong negative'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : pair.category === 'Moderate negative'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {pair.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {pair.correlation >= 0.3 ? (
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                    ) : pair.correlation <= -0.3 ? (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-mono text-sm font-bold text-white">
                      {pair.correlation > 0 ? `+${pair.correlation}` : pair.correlation}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">
                  {pair.col1} <span className="text-slate-500 font-normal">↔</span> {pair.col2}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {pair.category === 'Strong positive' &&
                    `${pair.col1} and ${pair.col2} show a strong positive relationship. As ${pair.col1} increases, ${pair.col2} tends to increase proportionally as well.`}
                  {pair.category === 'Moderate positive' &&
                    `There is a moderate upward trend linking ${pair.col1} and ${pair.col2}, suggesting positive mutual association.`}
                  {pair.category === 'Strong negative' &&
                    `Strong inverse relationship detected. As ${pair.col1} rises, ${pair.col2} consistently declines.`}
                  {pair.category === 'Moderate negative' &&
                    `Moderate inverse trend between ${pair.col1} and ${pair.col2}.`}
                  {pair.category === 'Weak correlation' &&
                    `Negligible linear relationship between ${pair.col1} and ${pair.col2}. Changes in one do not predict linear changes in the other.`}
                </p>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isPos ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Navigation CTA */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Want to view the full correlation heatmap?</h4>
          <p className="text-xs text-slate-400">
            Inspect the complete NxN matrix color gradient in the Visualizations tab.
          </p>
        </div>
        <button
          onClick={onNavigateVisualizations}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
        >
          <span>Open Heatmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
