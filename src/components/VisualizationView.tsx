import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  BarChart3,
  LineChart,
  PieChart as PieIcon,
  CircleDot,
  ScatterChart,
  Grid3X3,
  TrendingUp,
  Sliders,
  Maximize2
} from 'lucide-react';
import { DatasetMeta, CorrelationResult } from '../types';

interface VisualizationViewProps {
  dataset: DatasetMeta | null;
  preview: Record<string, any>[];
  correlations: CorrelationResult | null;
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'histogram' | 'scatter' | 'heatmap';

export const VisualizationView: React.FC<VisualizationViewProps> = ({
  dataset,
  preview,
  correlations
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const [activeChart, setActiveChart] = useState<ChartType>('bar');
  const [xAxisCol, setXAxisCol] = useState<string>('');
  const [yAxisCol, setYAxisCol] = useState<string>('');
  const [aggregation, setAggregation] = useState<'sum' | 'mean' | 'count'>('sum');

  const numCols = dataset?.numerical_columns || [];
  const catCols = dataset?.categorical_columns || [];

  // Default axes initialization
  useEffect(() => {
    if (catCols.length > 0 && !xAxisCol) {
      setXAxisCol(catCols[0]);
    } else if (numCols.length > 0 && !xAxisCol) {
      setXAxisCol(numCols[0]);
    }

    if (numCols.length > 0 && !yAxisCol) {
      setYAxisCol(numCols[0]);
    }
  }, [dataset]);

  // Color palette for charts
  const palette = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e', '#a855f7'
  ];

  useEffect(() => {
    if (!canvasRef.current || !dataset || preview.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    try {
      // Prepare data based on chart type
      if (activeChart === 'bar' || activeChart === 'line' || activeChart === 'pie' || activeChart === 'doughnut') {
        const groupCol = xAxisCol || (catCols[0] || dataset.columns[0]);
        const valueCol = yAxisCol || numCols[0];

        const groups: Record<string, number[]> = {};
        preview.forEach((row) => {
          const key = String(row[groupCol] ?? 'Other');
          const val = Number(row[valueCol]) || 0;
          if (!groups[key]) groups[key] = [];
          groups[key].push(val);
        });

        const labels = Object.keys(groups).slice(0, 15);
        const dataValues = labels.map((label) => {
          const values = groups[label];
          if (aggregation === 'sum') {
            return values.reduce((a, b) => a + b, 0);
          } else if (aggregation === 'mean') {
            return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
          } else {
            return values.length;
          }
        });

        const chartTypeConfig: any =
          activeChart === 'doughnut' ? 'doughnut' : activeChart === 'pie' ? 'pie' : activeChart === 'line' ? 'line' : 'bar';

        chartInstanceRef.current = new Chart(ctx, {
          type: chartTypeConfig,
          data: {
            labels,
            datasets: [
              {
                label: `${aggregation.toUpperCase()} of ${valueCol || 'Count'} by ${groupCol}`,
                data: dataValues,
                backgroundColor:
                  activeChart === 'pie' || activeChart === 'doughnut'
                    ? palette
                    : activeChart === 'line'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : palette.slice(0, labels.length),
                borderColor:
                  activeChart === 'line' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: activeChart === 'line' ? 3 : 1,
                fill: activeChart === 'line',
                tension: 0.35,
                pointBackgroundColor: '#818cf8',
                pointRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: activeChart === 'pie' || activeChart === 'doughnut',
                position: 'right',
                labels: { color: '#cbd5e1', font: { size: 11 } }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#e2e8f0',
                bodyColor: '#e2e8f0',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 10
              }
            },
            scales:
              activeChart === 'pie' || activeChart === 'doughnut'
                ? {}
                : {
                    x: {
                      grid: { color: 'rgba(51, 65, 85, 0.3)' },
                      ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                      grid: { color: 'rgba(51, 65, 85, 0.3)' },
                      ticks: { color: '#94a3b8', font: { size: 10 } }
                    }
                  }
          }
        });
      } else if (activeChart === 'histogram') {
        // Numerical frequency histogram
        const targetCol = yAxisCol || numCols[0];
        const numbers = preview
          .map((r) => Number(r[targetCol]))
          .filter((v) => !isNaN(v) && isFinite(v));

        if (numbers.length > 0) {
          const min = Math.min(...numbers);
          const max = Math.max(...numbers);
          const binCount = 8;
          const binWidth = (max - min) / binCount || 1;

          const bins = new Array(binCount).fill(0);
          const binLabels = new Array(binCount).fill('').map((_, i) => {
            const start = min + i * binWidth;
            const end = start + binWidth;
            return `${start.toFixed(1)} - ${end.toFixed(1)}`;
          });

          numbers.forEach((val) => {
            const index = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
            bins[index]++;
          });

          chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: binLabels,
              datasets: [
                {
                  label: `Frequency Distribution of ${targetCol}`,
                  data: bins,
                  backgroundColor: '#3b82f6',
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `Count: ${context.parsed.y} records`
                  }
                }
              },
              scales: {
                x: {
                  title: { display: true, text: targetCol, color: '#94a3b8' },
                  grid: { color: 'rgba(51, 65, 85, 0.3)' },
                  ticks: { color: '#94a3b8' }
                },
                y: {
                  title: { display: true, text: 'Frequency (Count)', color: '#94a3b8' },
                  grid: { color: 'rgba(51, 65, 85, 0.3)' },
                  ticks: { color: '#94a3b8' }
                }
              }
            }
          });
        }
      } else if (activeChart === 'scatter') {
        // 2-variable scatter plot
        const xCol = xAxisCol && numCols.includes(xAxisCol) ? xAxisCol : numCols[0];
        const yCol = yAxisCol && numCols.includes(yAxisCol) && yAxisCol !== xCol ? yAxisCol : numCols[1] || numCols[0];

        const scatterPoints = preview
          .map((r) => ({
            x: Number(r[xCol]),
            y: Number(r[yCol])
          }))
          .filter((p) => !isNaN(p.x) && !isNaN(p.y));

        chartInstanceRef.current = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: `${xCol} vs ${yCol}`,
                data: scatterPoints,
                backgroundColor: '#06b6d4',
                pointRadius: 6,
                pointHoverRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#cbd5e1' } }
            },
            scales: {
              x: {
                title: { display: true, text: xCol, color: '#94a3b8' },
                grid: { color: 'rgba(51, 65, 85, 0.3)' },
                ticks: { color: '#94a3b8' }
              },
              y: {
                title: { display: true, text: yCol, color: '#94a3b8' },
                grid: { color: 'rgba(51, 65, 85, 0.3)' },
                ticks: { color: '#94a3b8' }
              }
            }
          }
        });
      }
    } catch (err) {
      console.error('Chart.js rendering caught error:', err);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activeChart, xAxisCol, yAxisCol, aggregation, preview, dataset]);

  if (!dataset) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Dataset Loaded</h3>
        <p className="text-xs text-slate-400">Upload a dataset to render interactive Chart.js visualizations.</p>
      </div>
    );
  }

  const chartTabs = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'line', label: 'Line Chart', icon: LineChart },
    { id: 'pie', label: 'Pie Chart', icon: PieIcon },
    { id: 'doughnut', label: 'Doughnut Chart', icon: CircleDot },
    { id: 'histogram', label: 'Histogram', icon: TrendingUp },
    { id: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
    { id: 'heatmap', label: 'Correlation Heatmap', icon: Grid3X3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Visualization Dashboard</h2>
              <p className="text-xs text-slate-400">
                Render dynamic exploratory charts powered by Chart.js that adapt seamlessly to dataset attributes.
              </p>
            </div>
          </div>
        </div>

        {/* Chart Switcher Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {chartTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeChart === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id as ChartType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Customizer Controls (for non-heatmap) */}
      {activeChart !== 'heatmap' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Dimension (X):</span>
              <select
                value={xAxisCol}
                onChange={(e) => setXAxisCol(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
              >
                {dataset.columns.map((c) => (
                  <option key={c} value={c}>
                    {c} {numCols.includes(c) ? '(Numeric)' : '(Category)'}
                  </option>
                ))}
              </select>
            </div>

            {activeChart !== 'pie' && activeChart !== 'doughnut' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Metric (Y):</span>
                <select
                  value={yAxisCol}
                  onChange={(e) => setYAxisCol(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
                >
                  {numCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeChart !== 'scatter' && activeChart !== 'histogram' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Aggregation:</span>
                <select
                  value={aggregation}
                  onChange={(e: any) => setAggregation(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
                >
                  <option value="sum">Sum</option>
                  <option value="mean">Average (Mean)</option>
                  <option value="count">Record Count</option>
                </select>
              </div>
            )}
          </div>

          <span className="text-slate-500 font-mono text-[11px]">
            Rendering {preview.length} sample points
          </span>
        </div>
      )}

      {/* Main Chart Canvas or Heatmap View */}
      {activeChart !== 'heatmap' ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 h-[460px] relative">
          <canvas ref={canvasRef} />
        </div>
      ) : (
        /* Section 6 Correlation Heatmap Component */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-cyan-400" /> Correlation Heatmap Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Pairwise Pearson correlation coefficients scaled from -1.0 (inverse) to +1.0 (positive).
              </p>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-600 inline-block" /> -1.0 (Negative)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-800 inline-block" /> 0.0 (None)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> +1.0 (Positive)
              </span>
            </div>
          </div>

          {correlations && correlations.matrix && numCols.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-400">Feature</th>
                    {numCols.map((c) => (
                      <th key={c} className="p-2 text-slate-300 font-medium whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {numCols.map((rowCol) => (
                    <tr key={rowCol}>
                      <td className="p-2 text-left font-semibold text-slate-300 whitespace-nowrap">
                        {rowCol}
                      </td>
                      {numCols.map((colCol) => {
                        const r = correlations.matrix[rowCol]?.[colCol] ?? 0;
                        const isSelf = rowCol === colCol;

                        // Color mapping function
                        let bgColor = 'rgba(30, 41, 59, 0.5)';
                        let textColor = '#e2e8f0';

                        if (isSelf) {
                          bgColor = 'rgba(99, 102, 241, 0.7)';
                          textColor = '#ffffff';
                        } else if (r >= 0.7) {
                          bgColor = 'rgba(79, 70, 229, 0.85)';
                          textColor = '#ffffff';
                        } else if (r >= 0.3) {
                          bgColor = 'rgba(99, 102, 241, 0.4)';
                        } else if (r <= -0.7) {
                          bgColor = 'rgba(225, 29, 72, 0.85)';
                          textColor = '#ffffff';
                        } else if (r <= -0.3) {
                          bgColor = 'rgba(244, 63, 94, 0.4)';
                        }

                        return (
                          <td
                            key={colCol}
                            style={{ backgroundColor: bgColor, color: textColor }}
                            className="p-3 font-mono text-xs font-bold border border-slate-800 transition-colors"
                          >
                            {r.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              At least two numerical columns are required to generate correlation heatmap.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
