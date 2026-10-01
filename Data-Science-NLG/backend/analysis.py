import pandas as pd
import numpy as np
from scipy import stats

def compute_descriptive_stats(df: pd.DataFrame):
    """
    Computes complete statistical profile for numerical columns:
    Mean, Median, Mode, Min, Max, Std Dev, Variance, Quartiles (Q1, Q2, Q3, IQR), Range, Skewness
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    stats_dict = {}

    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue

        q1 = float(np.percentile(series, 25))
        median = float(np.percentile(series, 50))
        q3 = float(np.percentile(series, 75))
        iqr = q3 - q1

        # Mode calculation
        mode_vals = series.mode().tolist()
        mode_val = float(mode_vals[0]) if len(mode_vals) > 0 else median

        mean_val = float(series.mean())
        std_val = float(series.std(ddof=1)) if len(series) > 1 else 0.0
        var_val = float(series.var(ddof=1)) if len(series) > 1 else 0.0
        min_val = float(series.min())
        max_val = float(series.max())
        val_range = max_val - min_val
        skew_val = float(series.skew()) if len(series) > 2 else 0.0

        # Outlier counts using 1.5 * IQR rule
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = series[(series < lower_bound) | (series > upper_bound)]

        stats_dict[col] = {
            "count": int(len(series)),
            "mean": round(mean_val, 2),
            "median": round(median, 2),
            "mode": round(mode_val, 2),
            "std": round(std_val, 2),
            "variance": round(var_val, 2),
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "range": round(val_range, 2),
            "q1": round(q1, 2),
            "q3": round(q3, 2),
            "iqr": round(iqr, 2),
            "skewness": round(skew_val, 2),
            "outlier_count": int(len(outliers)),
            "outlier_percentage": round((len(outliers) / len(series)) * 100, 2)
        }

    return stats_dict

def compute_data_quality(df: pd.DataFrame):
    """
    Computes missing value percentage, duplicate percentage, completeness, and overall score
    """
    total_cells = df.size
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0

    total_rows = len(df)
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

    completeness_pct = round(100.0 - missing_pct, 2)

    # Data Quality Score calculation
    # Base 100 minus weighted penalties
    score = 100.0 - (missing_pct * 0.5) - (duplicate_pct * 0.4)
    data_quality_score = max(0.0, min(100.0, round(score, 1)))

    # Per-column missing breakdown
    col_missing = {}
    for col in df.columns:
        cnt = int(df[col].isnull().sum())
        col_missing[col] = {
            "count": cnt,
            "percentage": round((cnt / total_rows) * 100, 2) if total_rows > 0 else 0.0,
            "dtype": str(df[col].dtype)
        }

    return {
        "total_rows": total_rows,
        "total_columns": len(df.columns),
        "total_cells": total_cells,
        "missing_cells": missing_cells,
        "missing_percentage": missing_pct,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": duplicate_pct,
        "completeness_percentage": completeness_pct,
        "data_quality_score": data_quality_score,
        "column_breakdown": col_missing
    }

def compute_correlations(df: pd.DataFrame):
    """
    Computes Pearson correlation matrix and classifies correlations into:
    Strong positive (>= 0.7), Moderate positive (0.3 to 0.7),
    Weak (-0.3 to 0.3), Moderate negative (-0.7 to -0.3), Strong negative (<= -0.7)
    """
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return {"matrix": {}, "pairs": []}

    corr_matrix = numeric_df.corr(method="pearson").round(3)
    pairs = []

    cols = numeric_df.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            c1 = cols[i]
            c2 = cols[j]
            r = corr_matrix.loc[c1, c2]
            if pd.isna(r):
                continue

            r = float(r)
            if r >= 0.7:
                category = "Strong positive"
            elif r >= 0.3:
                category = "Moderate positive"
            elif r > -0.3:
                category = "Weak correlation"
            elif r > -0.7:
                category = "Moderate negative"
            else:
                category = "Strong negative"

            pairs.append({
                "col1": c1,
                "col2": c2,
                "correlation": r,
                "category": category
            })

    # Sort pairs by absolute correlation strength
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "matrix": corr_matrix.to_dict(),
        "pairs": pairs
    }
