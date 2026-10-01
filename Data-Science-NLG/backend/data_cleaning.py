"""
Data Cleaning Module for Data-Science-NLG
Provides operations for:
- Removing duplicates
- Imputing or dropping missing values
- Renaming columns
- Type casting
- Removing columns
- Outlier filtering & clipping via IQR
- MinMax normalization and Z-score standardization
"""
import pandas as pd
import numpy as np

class DataCleaner:
    @staticmethod
    def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
        initial_len = len(df)
        df_cleaned = df.drop_duplicates().copy()
        removed_count = initial_len - len(df_cleaned)
        return df_cleaned, removed_count

    @staticmethod
    def handle_missing(df: pd.DataFrame, strategy: str = "drop", fill_value = None, target_cols = None) -> pd.DataFrame:
        df_cleaned = df.copy()
        cols = target_cols if target_cols else df_cleaned.columns.tolist()

        if strategy == "drop":
            df_cleaned = df_cleaned.dropna(subset=cols)
        elif strategy == "mean":
            for col in cols:
                if pd.api.types.is_numeric_dtype(df_cleaned[col]):
                    m = df_cleaned[col].mean()
                    df_cleaned[col] = df_cleaned[col].fillna(m)
        elif strategy == "median":
            for col in cols:
                if pd.api.types.is_numeric_dtype(df_cleaned[col]):
                    med = df_cleaned[col].median()
                    df_cleaned[col] = df_cleaned[col].fillna(med)
        elif strategy == "mode":
            for col in cols:
                mode_vals = df_cleaned[col].mode()
                if len(mode_vals) > 0:
                    df_cleaned[col] = df_cleaned[col].fillna(mode_vals[0])
        elif strategy == "constant":
            val = fill_value if fill_value is not None else "Unknown"
            for col in cols:
                df_cleaned[col] = df_cleaned[col].fillna(val)

        return df_cleaned

    @staticmethod
    def rename_columns(df: pd.DataFrame, rename_map: dict) -> pd.DataFrame:
        return df.rename(columns=rename_map)

    @staticmethod
    def drop_columns(df: pd.DataFrame, columns_to_drop: list) -> pd.DataFrame:
        return df.drop(columns=[c for c in columns_to_drop if c in df.columns])

    @staticmethod
    def change_data_type(df: pd.DataFrame, col: str, target_type: str) -> pd.DataFrame:
        df_cleaned = df.copy()
        if col in df_cleaned.columns:
            if target_type == "int":
                df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce').fillna(0).astype(int)
            elif target_type == "float":
                df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce')
            elif target_type == "str":
                df_cleaned[col] = df_cleaned[col].astype(str)
            elif target_type == "datetime":
                df_cleaned[col] = pd.to_datetime(df_cleaned[col], errors='coerce')
        return df_cleaned

    @staticmethod
    def handle_outliers(df: pd.DataFrame, col: str, method: str = "clip") -> pd.DataFrame:
        df_cleaned = df.copy()
        if col in df_cleaned.columns and pd.api.types.is_numeric_dtype(df_cleaned[col]):
            q1 = df_cleaned[col].quantile(0.25)
            q3 = df_cleaned[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr

            if method == "clip":
                df_cleaned[col] = df_cleaned[col].clip(lower=lower, upper=upper)
            elif method == "remove":
                df_cleaned = df_cleaned[(df_cleaned[col] >= lower) & (df_cleaned[col] <= upper)]
        return df_cleaned

    @staticmethod
    def normalize_column(df: pd.DataFrame, col: str, method: str = "minmax") -> pd.DataFrame:
        df_cleaned = df.copy()
        if col in df_cleaned.columns and pd.api.types.is_numeric_dtype(df_cleaned[col]):
            series = df_cleaned[col]
            if method == "minmax":
                min_v = series.min()
                max_v = series.max()
                if max_v != min_v:
                    df_cleaned[col] = (series - min_v) / (max_v - min_v)
            elif method == "standardize":
                mean_v = series.mean()
                std_v = series.std()
                if std_v != 0:
                    df_cleaned[col] = (series - mean_v) / std_v
        return df_cleaned
