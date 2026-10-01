export interface ColumnStats {
  count: number;
  mean: number;
  median: number;
  mode: number;
  std: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outlier_count: number;
  outlier_percentage: number;
}

export interface DataQuality {
  total_rows: number;
  total_columns: number;
  total_cells: number;
  missing_cells: number;
  missing_percentage: number;
  duplicate_rows: number;
  duplicate_percentage: number;
  completeness_percentage: number;
  data_quality_score: number;
  column_breakdown: Record<string, { count: number; percentage: number; dtype: string }>;
}

export interface CorrelationPair {
  col1: string;
  col2: string;
  correlation: number;
  category: 'Strong positive' | 'Moderate positive' | 'Weak correlation' | 'Moderate negative' | 'Strong negative';
}

export interface CorrelationResult {
  matrix: Record<string, Record<string, number>>;
  pairs: CorrelationPair[];
}

// Helper: Calculate percentile
function getPercentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computeDescriptiveStats(data: Record<string, any>[], numericCols: string[]): Record<string, ColumnStats> {
  const result: Record<string, ColumnStats> = {};

  for (const col of numericCols) {
    const rawValues = data
      .map(row => Number(row[col]))
      .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));

    if (rawValues.length === 0) continue;

    const n = rawValues.length;
    const sorted = [...rawValues].sort((a, b) => a - b);
    const sum = rawValues.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    const median = getPercentile(sorted, 50);
    const q1 = getPercentile(sorted, 25);
    const q3 = getPercentile(sorted, 75);
    const iqr = q3 - q1;

    // Mode
    const freqMap: Record<number, number> = {};
    let maxFreq = 0;
    let mode = median;
    for (const v of rawValues) {
      freqMap[v] = (freqMap[v] || 0) + 1;
      if (freqMap[v] > maxFreq) {
        maxFreq = freqMap[v];
        mode = v;
      }
    }

    // Variance & Std Dev (sample ddof=1)
    const variance = n > 1
      ? rawValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
      : 0;
    const std = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    // Skewness: Fisher-Pearson coefficient of skewness
    let skewness = 0;
    if (n > 2 && std > 0) {
      const m3 = rawValues.reduce((acc, v) => acc + Math.pow((v - mean) / std, 3), 0);
      const sk = (n / ((n - 1) * (n - 2))) * m3;
      if (!isNaN(sk) && isFinite(sk)) {
        skewness = Number(sk.toFixed(2));
      }
    }

    // Outliers using 1.5 * IQR
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = rawValues.filter(v => v < lowerFence || v > upperFence);

    result[col] = {
      count: n,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      mode: Number(mode.toFixed(2)),
      std: Number(std.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      range: Number(range.toFixed(2)),
      q1: Number(q1.toFixed(2)),
      q3: Number(q3.toFixed(2)),
      iqr: Number(iqr.toFixed(2)),
      skewness: Number(skewness.toFixed(2)),
      outlier_count: outliers.length,
      outlier_percentage: n > 0 ? Number(((outliers.length / n) * 100).toFixed(2)) : 0
    };
  }

  return result;
}

export function computeDataQuality(data: Record<string, any>[], columns: string[]): DataQuality {
  const total_rows = data.length;
  const total_columns = columns.length;
  const total_cells = total_rows * total_columns;

  let missing_cells = 0;
  const column_breakdown: Record<string, { count: number; percentage: number; dtype: string }> = {};

  for (const col of columns) {
    let colMissing = 0;
    let numericHits = 0;
    let totalSampled = 0;

    for (const row of data) {
      const val = row[col];
      if (val === undefined || val === null || val === '' || String(val).trim() === '') {
        colMissing++;
      } else {
        totalSampled++;
        if (!isNaN(Number(val))) {
          numericHits++;
        }
      }
    }

    missing_cells += colMissing;
    const isNum = totalSampled > 0 && (numericHits / totalSampled) > 0.8;
    column_breakdown[col] = {
      count: colMissing,
      percentage: total_rows > 0 ? Number(((colMissing / total_rows) * 100).toFixed(2)) : 0,
      dtype: isNum ? 'numeric' : 'categorical'
    };
  }

  // Duplicate rows check
  const rowStrings = new Set<string>();
  let duplicate_rows = 0;
  for (const row of data) {
    const serialized = JSON.stringify(row);
    if (rowStrings.has(serialized)) {
      duplicate_rows++;
    } else {
      rowStrings.add(serialized);
    }
  }

  const missing_percentage = total_cells > 0 ? Number(((missing_cells / total_cells) * 100).toFixed(2)) : 0;
  const duplicate_percentage = total_rows > 0 ? Number(((duplicate_rows / total_rows) * 100).toFixed(2)) : 0;
  const completeness_percentage = Number((100 - missing_percentage).toFixed(2));

  // Score from 0 to 100
  const score = Math.max(0, Math.min(100, 100 - (missing_percentage * 0.5) - (duplicate_percentage * 0.4)));

  return {
    total_rows,
    total_columns,
    total_cells,
    missing_cells,
    missing_percentage,
    duplicate_rows,
    duplicate_percentage,
    completeness_percentage,
    data_quality_score: Number(score.toFixed(1)),
    column_breakdown
  };
}

export function computeCorrelations(data: Record<string, any>[], numericCols: string[]): CorrelationResult {
  const matrix: Record<string, Record<string, number>> = {};
  const pairs: CorrelationPair[] = [];

  for (const c of numericCols) {
    matrix[c] = {};
  }

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = 0; j < numericCols.length; j++) {
      const c1 = numericCols[i];
      const c2 = numericCols[j];

      if (i === j) {
        matrix[c1][c2] = 1.0;
        continue;
      }

      // Filter rows having both values
      const validPairs = data
        .map(row => ({ x: Number(row[c1]), y: Number(row[c2]) }))
        .filter(p => !isNaN(p.x) && isFinite(p.x) && !isNaN(p.y) && isFinite(p.y));

      const n = validPairs.length;
      if (n < 3) {
        matrix[c1][c2] = 0;
        continue;
      }

      const meanX = validPairs.reduce((s, p) => s + p.x, 0) / n;
      const meanY = validPairs.reduce((s, p) => s + p.y, 0) / n;

      let num = 0;
      let denX = 0;
      let denY = 0;

      for (const p of validPairs) {
        const dx = p.x - meanX;
        const dy = p.y - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }

      const denom = Math.sqrt(denX * denY);
      let r = 0;
      if (denom > 0) {
        const val = num / denom;
        if (!isNaN(val) && isFinite(val)) {
          r = Number(val.toFixed(3));
        }
      }
      matrix[c1][c2] = r;

      if (i < j) {
        let category: CorrelationPair['category'];
        if (r >= 0.7) category = 'Strong positive';
        else if (r >= 0.3) category = 'Moderate positive';
        else if (r > -0.3) category = 'Weak correlation';
        else if (r > -0.7) category = 'Moderate negative';
        else category = 'Strong negative';

        pairs.push({ col1: c1, col2: c2, correlation: r, category });
      }
    }
  }

  pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return { matrix, pairs };
}

// Data Cleaning Pipeline
export function executeDataCleaning(
  data: Record<string, any>[],
  columns: string[],
  action: string,
  params: Record<string, any>
): { cleaned: Record<string, any>[]; message: string; updatedCols: string[] } {
  let cleaned = data.map(row => ({ ...row }));
  let message = 'Cleaning operation completed successfully.';
  let updatedCols = [...columns];

  switch (action) {
    case 'remove_duplicates': {
      const seen = new Set<string>();
      const initialCount = cleaned.length;
      cleaned = cleaned.filter(row => {
        const s = JSON.stringify(row);
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
      const removed = initialCount - cleaned.length;
      message = `De-duplication completed: Removed ${removed} duplicate row(s).`;
      break;
    }

    case 'handle_missing': {
      const strategy = params.strategy || 'drop'; // drop, mean, median, mode, constant
      const targetCols = params.columns && params.columns.length > 0 ? params.columns : updatedCols;

      if (strategy === 'drop') {
        const initialCount = cleaned.length;
        cleaned = cleaned.filter(row => {
          return targetCols.every((col: string) => {
            const v = row[col];
            return v !== undefined && v !== null && v !== '' && String(v).trim() !== '';
          });
        });
        const removed = initialCount - cleaned.length;
        message = `Missing values handled: Dropped ${removed} row(s) with missing data in selected columns.`;
      } else if (strategy === 'mean' || strategy === 'median') {
        for (const col of targetCols) {
          const nums = cleaned
            .map(r => Number(r[col]))
            .filter(v => !isNaN(v) && isFinite(v));
          if (nums.length === 0) continue;
          let fillVal = 0;
          if (strategy === 'mean') {
            fillVal = Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
          } else {
            nums.sort((a, b) => a - b);
            fillVal = getPercentile(nums, 50);
          }
          cleaned.forEach(r => {
            const v = r[col];
            if (v === undefined || v === null || v === '' || String(v).trim() === '') {
              r[col] = fillVal;
            }
          });
        }
        message = `Missing values imputed using '${strategy}' across target columns.`;
      } else if (strategy === 'mode') {
        for (const col of targetCols) {
          const freq: Record<string, number> = {};
          let topVal = '';
          let maxCount = 0;
          cleaned.forEach(r => {
            const v = r[col];
            if (v !== undefined && v !== null && v !== '' && String(v).trim() !== '') {
              const s = String(v);
              freq[s] = (freq[s] || 0) + 1;
              if (freq[s] > maxCount) {
                maxCount = freq[s];
                topVal = s;
              }
            }
          });
          cleaned.forEach(r => {
            const v = r[col];
            if (v === undefined || v === null || v === '' || String(v).trim() === '') {
              r[col] = topVal;
            }
          });
        }
        message = `Missing values imputed using most frequent 'mode' category.`;
      } else if (strategy === 'constant') {
        const fillVal = params.fill_value ?? 'Unknown';
        cleaned.forEach(r => {
          targetCols.forEach((col: string) => {
            const v = r[col];
            if (v === undefined || v === null || v === '' || String(v).trim() === '') {
              r[col] = fillVal;
            }
          });
        });
        message = `Missing values replaced with constant '${fillVal}'.`;
      }
      break;
    }

    case 'rename_column': {
      const oldName = params.old_name;
      const newName = params.new_name;
      if (oldName && newName && oldName !== newName) {
        cleaned.forEach(r => {
          if (r[oldName] !== undefined) {
            r[newName] = r[oldName];
            delete r[oldName];
          }
        });
        updatedCols = updatedCols.map(c => c === oldName ? newName : c);
        message = `Column '${oldName}' successfully renamed to '${newName}'.`;
      }
      break;
    }

    case 'drop_column': {
      const colToDrop = params.column;
      if (colToDrop) {
        cleaned.forEach(r => {
          delete r[colToDrop];
        });
        updatedCols = updatedCols.filter(c => c !== colToDrop);
        message = `Column '${colToDrop}' successfully removed from dataset.`;
      }
      break;
    }

    case 'handle_outliers': {
      const col = params.column;
      const method = params.method || 'clip'; // clip or remove
      if (col) {
        const nums = cleaned
          .map(r => Number(r[col]))
          .filter(v => !isNaN(v) && isFinite(v));
        if (nums.length > 4) {
          nums.sort((a, b) => a - b);
          const q1 = getPercentile(nums, 25);
          const q3 = getPercentile(nums, 75);
          const iqr = q3 - q1;
          const lower = q1 - 1.5 * iqr;
          const upper = q3 + 1.5 * iqr;

          if (method === 'clip') {
            cleaned.forEach(r => {
              const val = Number(r[col]);
              if (!isNaN(val)) {
                if (val < lower) r[col] = Number(lower.toFixed(2));
                else if (val > upper) r[col] = Number(upper.toFixed(2));
              }
            });
            message = `Outliers in '${col}' clipped to Tukey bounds [${lower.toFixed(1)}, ${upper.toFixed(1)}].`;
          } else if (method === 'remove') {
            const initialCount = cleaned.length;
            cleaned = cleaned.filter(r => {
              const val = Number(r[col]);
              return isNaN(val) || (val >= lower && val <= upper);
            });
            message = `Removed ${initialCount - cleaned.length} outlier row(s) from '${col}'.`;
          }
        }
      }
      break;
    }

    case 'normalize': {
      const col = params.column;
      const method = params.method || 'minmax'; // minmax or standardize
      if (col) {
        const nums = cleaned
          .map(r => Number(r[col]))
          .filter(v => !isNaN(v) && isFinite(v));
        if (nums.length > 1) {
          if (method === 'minmax') {
            const min = Math.min(...nums);
            const max = Math.max(...nums);
            const diff = max - min;
            if (diff > 0) {
              cleaned.forEach(r => {
                const val = Number(r[col]);
                if (!isNaN(val)) {
                  r[col] = Number(((val - min) / diff).toFixed(4));
                }
              });
              message = `Normalized '${col}' using Min-Max scaling to [0, 1] interval.`;
            }
          } else {
            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
            const std = Math.sqrt(variance);
            if (std > 0) {
              cleaned.forEach(r => {
                const val = Number(r[col]);
                if (!isNaN(val)) {
                  r[col] = Number(((val - mean) / std).toFixed(4));
                }
              });
              message = `Standardized '${col}' using Z-score (μ=0, σ=1).`;
            }
          }
        }
      }
      break;
    }
  }

  return { cleaned, message, updatedCols };
}
