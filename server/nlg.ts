import { GoogleGenAI } from '@google/genai';
import { ColumnStats, DataQuality, CorrelationResult } from './analytics.js';

export interface InsightItem {
  id: string;
  type: 'Trend' | 'Statistical' | 'Missing Data' | 'Correlation' | 'Category' | 'Outlier';
  title: string;
  text: string;
  impact: 'High' | 'Medium' | 'Low' | 'Info';
  column?: string;
  badge?: string;
}

export interface GeneratedReport {
  title: string;
  dataset_overview: {
    name: string;
    total_rows: number;
    total_columns: number;
    numerical_columns: string[];
    categorical_columns: string[];
  };
  data_quality: {
    score: number;
    completeness: number;
    missing_cells: number;
    duplicate_rows: number;
    observations: string[];
  };
  statistical_summary: {
    highlights: Array<{
      column: string;
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      narrative: string;
    }>;
  };
  important_patterns: {
    trends: string[];
    correlations: string[];
    category_comparisons: string[];
    outliers: string[];
  };
  ai_executive_conclusion: string;
  strategic_recommendations: string[];
}

// Deterministic Rule-Based NLG Engine
export function generateAlgorithmicInsights(
  data: Record<string, any>[],
  stats: Record<string, ColumnStats>,
  quality: DataQuality,
  correlations: CorrelationResult,
  catCols: string[]
): InsightItem[] {
  const insights: InsightItem[] = [];
  let idCounter = 1;

  // 1. Data Quality & Missing Data Insights
  if (quality.missing_cells > 0) {
    for (const [col, info] of Object.entries(quality.column_breakdown)) {
      if (info.count > 0) {
        insights.push({
          id: `ins-${idCounter++}`,
          type: 'Missing Data',
          title: `Missing Values in ${col}`,
          text: `Approximately ${info.percentage}% of values (${info.count} records) are missing in the '${col}' column. Data imputation or filtering is advised to maintain analytical validity.`,
          impact: info.percentage > 10 ? 'High' : 'Medium',
          column: col,
          badge: `${info.percentage}% Null`
        });
      }
    }
  } else {
    insights.push({
      id: `ins-${idCounter++}`,
      type: 'Missing Data',
      title: 'Full Data Completeness',
      text: 'The dataset has 0 missing values across all columns, ensuring complete record integrity for all statistical computations.',
      impact: 'Info',
      badge: '100% Complete'
    });
  }

  // 2. Duplicate Records Insight
  if (quality.duplicate_rows > 0) {
    insights.push({
      id: `ins-${idCounter++}`,
      type: 'Statistical',
      title: 'Duplicate Records Detected',
      text: `Detected ${quality.duplicate_rows} duplicate row(s) (${quality.duplicate_percentage}% of dataset). Consider removing duplicate entries in the Data Cleaning tab to prevent double-counting.`,
      impact: 'Medium',
      badge: `${quality.duplicate_rows} Duplicates`
    });
  }

  // 3. Statistical Descriptive & Distribution Insights
  for (const [col, colStat] of Object.entries(stats)) {
    const { mean, median, std, min, max, skewness, outlier_count } = colStat;

    // Typical value narrative
    insights.push({
      id: `ins-${idCounter++}`,
      type: 'Statistical',
      title: `Central Tendency for ${col}`,
      text: `The dataset has an average (mean) ${col} value of ${mean.toLocaleString()}. This indicates the typical ${col} level across the analyzed records, with a range spanning from ${min.toLocaleString()} to ${max.toLocaleString()}.`,
      impact: 'Info',
      column: col,
      badge: `Avg: ${mean}`
    });

    // Skewness insight
    if (Math.abs(skewness) > 0.5) {
      if (mean > median) {
        insights.push({
          id: `ins-${idCounter++}`,
          type: 'Statistical',
          title: `Right-Skewed Distribution in ${col}`,
          text: `The average value (${mean.toLocaleString()}) is higher than the median (${median.toLocaleString()}), suggesting that some high-value observations may be positively influencing the distribution.`,
          impact: 'Medium',
          column: col,
          badge: `Skew: +${skewness}`
        });
      } else {
        insights.push({
          id: `ins-${idCounter++}`,
          type: 'Statistical',
          title: `Left-Skewed Distribution in ${col}`,
          text: `The average value (${mean.toLocaleString()}) is lower than the median (${median.toLocaleString()}), suggesting a left-skewed tail where low-value observations pull the overall mean downward.`,
          impact: 'Medium',
          column: col,
          badge: `Skew: ${skewness}`
        });
      }
    }

    // Outlier insight
    if (outlier_count > 0) {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Outlier',
        title: `Outlier Observations in ${col}`,
        text: `Several unusually extreme ${col} values were detected (${outlier_count} records, ${colStat.outlier_percentage}% of total) compared with the overall distribution (outside 1.5× IQR).`,
        impact: outlier_count > 3 ? 'High' : 'Medium',
        column: col,
        badge: `${outlier_count} Outliers`
      });
    }
  }

  // 4. Correlation Insights
  for (const pair of correlations.pairs) {
    const { col1, col2, correlation, category } = pair;
    if (category === 'Strong positive') {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Correlation',
        title: `Strong Positive Correlation: ${col1} & ${col2}`,
        text: `${col1} and ${col2} show a strong positive relationship (r = ${correlation}). As ${col1} increases, ${col2} tends to increase as well.`,
        impact: 'High',
        badge: `r = ${correlation}`
      });
    } else if (category === 'Strong negative') {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Correlation',
        title: `Strong Inverse Correlation: ${col1} & ${col2}`,
        text: `${col1} and ${col2} show a strong inverse/negative relationship (r = ${correlation}). When ${col1} rises, ${col2} tends to decrease significantly.`,
        impact: 'High',
        badge: `r = ${correlation}`
      });
    } else if (category === 'Moderate positive') {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Correlation',
        title: `Moderate Correlation: ${col1} & ${col2}`,
        text: `${col1} and ${col2} exhibit a moderate positive correlation (r = ${correlation}), indicating a consistent co-movement pattern across records.`,
        impact: 'Medium',
        badge: `r = ${correlation}`
      });
    }
  }

  // 5. Category Insights
  const numColNames = Object.keys(stats);
  for (const cat of catCols.slice(0, 2)) {
    const counts: Record<string, number> = {};
    for (const row of data) {
      const v = String(row[cat] || 'Unknown');
      counts[v] = (counts[v] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topCat = sorted[0];
      const pct = ((topCat[1] / data.length) * 100).toFixed(1);
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Category',
        title: `Dominant Segment in ${cat}`,
        text: `'${topCat[0]}' represents the largest category in '${cat}', accounting for ${topCat[1]} records (${pct}% of the dataset).`,
        impact: 'Medium',
        column: cat,
        badge: `${pct}% Share`
      });

      // Cross aggregation if numerical column exists
      if (numColNames.length > 0) {
        const targetNum = numColNames[0];
        const sumMap: Record<string, number> = {};
        for (const row of data) {
          const catVal = String(row[cat] || 'Unknown');
          const numVal = Number(row[targetNum]) || 0;
          sumMap[catVal] = (sumMap[catVal] || 0) + numVal;
        }
        const topSum = Object.entries(sumMap).sort((a, b) => b[1] - a[1])[0];
        if (topSum) {
          insights.push({
            id: `ins-${idCounter++}`,
            type: 'Category',
            title: `Highest ${targetNum} by ${cat}`,
            text: `'${topSum[0]}' represents the largest category by total ${targetNum} (${topSum[1].toLocaleString()}), leading all other segments in ${cat}.`,
            impact: 'High',
            column: cat,
            badge: `Top ${targetNum}`
          });
        }
      }
    }
  }

  // 6. Trend Insight (if sequential/date column exists or first numeric column across index)
  if (numColNames.length > 0 && data.length >= 5) {
    const col = numColNames[0];
    const half = Math.floor(data.length / 2);
    const firstHalfAvg = data.slice(0, half).reduce((s, r) => s + (Number(r[col]) || 0), 0) / half;
    const secondHalfAvg = data.slice(half).reduce((s, r) => s + (Number(r[col]) || 0), 0) / (data.length - half);

    if (secondHalfAvg > firstHalfAvg * 1.05) {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Trend',
        title: `Upward Trend in ${col}`,
        text: `The ${col} data shows an increasing trend across sequential records (rising from an early average of ${firstHalfAvg.toFixed(1)} to ${secondHalfAvg.toFixed(1)}).`,
        impact: 'High',
        column: col,
        badge: 'Upward Trend'
      });
    } else if (firstHalfAvg > secondHalfAvg * 1.05) {
      insights.push({
        id: `ins-${idCounter++}`,
        type: 'Trend',
        title: `Downward Trend in ${col}`,
        text: `The ${col} data reflects a declining trend over the observed sequence (decreasing from ${firstHalfAvg.toFixed(1)} to ${secondHalfAvg.toFixed(1)}).`,
        impact: 'High',
        column: col,
        badge: 'Downward Trend'
      });
    }
  }

  return insights;
}

// AI-Powered Report Synthesis using Gemini 3.8 Flash
export async function generateAIReport(
  datasetName: string,
  data: Record<string, any>[],
  stats: Record<string, ColumnStats>,
  quality: DataQuality,
  correlations: CorrelationResult,
  numCols: string[],
  catCols: string[]
): Promise<GeneratedReport> {
  const statHighlights = Object.entries(stats).map(([col, s]) => ({
    column: col,
    mean: s.mean,
    median: s.median,
    std: s.std,
    min: s.min,
    max: s.max,
    narrative: `The dataset has an average ${col} of ${s.mean.toLocaleString()} (median: ${s.median.toLocaleString()}), with standard deviation of ${s.std.toLocaleString()} spanning from ${s.min.toLocaleString()} to ${s.max.toLocaleString()}.`
  }));

  const qualityObs: string[] = [
    `Overall Data Quality Score: ${quality.data_quality_score}/100 with ${quality.completeness_percentage}% total cell completeness.`,
    quality.missing_cells > 0
      ? `Found ${quality.missing_cells} missing cells (${quality.missing_percentage}%).`
      : 'Zero missing values identified across the dataset.',
    quality.duplicate_rows > 0
      ? `Identified ${quality.duplicate_rows} duplicate row(s) (${quality.duplicate_percentage}%).`
      : 'No duplicate records present.'
  ];

  const correlationTexts = correlations.pairs.slice(0, 5).map(p =>
    `${p.col1} and ${p.col2} demonstrate a ${p.category.toLowerCase()} (Pearson r = ${p.correlation}).`
  );

  const outlierTexts = Object.entries(stats)
    .filter(([_, s]) => s.outlier_count > 0)
    .map(([col, s]) => `${col}: ${s.outlier_count} extreme outlier(s) detected (${s.outlier_percentage}% of records) beyond 1.5× IQR.`);

  const trends: string[] = [];
  if (numCols.length > 0 && data.length > 4) {
    const firstCol = numCols[0];
    trends.push(`${firstCol} shows sequential movement across sample rows with a standard deviation of ${stats[firstCol]?.std || 0}.`);
  }

  const catComparisons: string[] = [];
  if (catCols.length > 0 && data.length > 0) {
    const c = catCols[0];
    const map: Record<string, number> = {};
    data.forEach(r => {
      const v = String(r[c] || 'Unknown');
      map[v] = (map[v] || 0) + 1;
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      catComparisons.push(`Segment '${top[0]}' in '${c}' holds the majority share with ${top[1]} records (${((top[1] / data.length) * 100).toFixed(1)}%).`);
    }
  }

  let executiveSummary = `The dataset '${datasetName}' consists of ${data.length} records and ${numCols.length + catCols.length} features (${numCols.length} numerical, ${catCols.length} categorical). Data completeness is evaluated at ${quality.completeness_percentage}%, conferring a quality rating of ${quality.data_quality_score}/100. Key statistical indicators show distinct distributional properties across primary metrics.`;
  let recommendations: string[] = [
    'Perform targeted imputation or removal on incomplete columns to avoid bias in machine learning pipelines.',
    'Treat detected outliers through Tukey fence clipping to stabilize downstream regression and clustering models.',
    'Leverage strongly correlated feature pairs for predictive forecasting and dimensional reduction.'
  ];

  // Attempt server-side Gemini 3.8 Flash generation if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are a Senior Principal Data Scientist and Natural Language Generation (NLG) expert.
Write an executive summary and strategic data science recommendations for this dataset analysis:
- Dataset Name: ${datasetName}
- Total Records: ${data.length} rows, ${numCols.length + catCols.length} columns
- Numerical Features: ${numCols.join(', ')}
- Categorical Features: ${catCols.join(', ')}
- Data Quality Score: ${quality.data_quality_score}/100 (Missing Cells: ${quality.missing_cells}, Duplicates: ${quality.duplicate_rows})
- Key Statistics: ${JSON.stringify(statHighlights.slice(0, 4))}
- Top Correlations: ${JSON.stringify(correlations.pairs.slice(0, 4))}
- Outliers Detected: ${JSON.stringify(outlierTexts)}

Format your response in clear, professional English. Provide:
1. Executive Conclusion (2-3 concise, impactful paragraphs explaining key trends, distributional skewness, and core relationships).
2. Four (4) prioritized, actionable Data Science & Business Recommendations.

Do NOT output markdown headers like '# Executive Summary'. Just provide the text clearly formatted.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response && response.text) {
        const text = response.text.trim();
        const parts = text.split(/Recommendations?:/i);
        if (parts.length > 1) {
          executiveSummary = parts[0].trim();
          const recLines = parts[1]
            .split('\n')
            .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter(l => l.length > 10);
          if (recLines.length > 0) {
            recommendations = recLines.slice(0, 5);
          }
        } else {
          executiveSummary = text;
        }
      }
    } catch (err) {
      console.warn('Gemini AI synthesis fallback to rule-based engine:', err);
    }
  }

  return {
    title: `Comprehensive Data Science & Natural Language Report: ${datasetName}`,
    dataset_overview: {
      name: datasetName,
      total_rows: data.length,
      total_columns: numCols.length + catCols.length,
      numerical_columns: numCols,
      categorical_columns: catCols
    },
    data_quality: {
      score: quality.data_quality_score,
      completeness: quality.completeness_percentage,
      missing_cells: quality.missing_cells,
      duplicate_rows: quality.duplicate_rows,
      observations: qualityObs
    },
    statistical_summary: {
      highlights: statHighlights
    },
    important_patterns: {
      trends: trends.length > 0 ? trends : ['No chronological or sequential trend flags detected.'],
      correlations: correlationTexts.length > 0 ? correlationTexts : ['No strong linear correlations identified among numerical features.'],
      category_comparisons: catComparisons.length > 0 ? catComparisons : ['No primary categorical divisions present.'],
      outliers: outlierTexts.length > 0 ? outlierTexts : ['No extreme outliers detected beyond 1.5× IQR boundaries.']
    },
    ai_executive_conclusion: executiveSummary,
    strategic_recommendations: recommendations
  };
}
