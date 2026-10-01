export interface User {
  user_id: string;
  name: string;
  email: string;
  registration_date?: string;
  last_login?: string;
}

export interface DatasetMeta {
  id: string;
  user_id: string;
  name: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  numerical_columns: string[];
  categorical_columns: string[];
  missing_values: number;
  duplicate_records: number;
  uploaded_at: string;
}

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
  report_id?: string;
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
  created_at?: string;
}
