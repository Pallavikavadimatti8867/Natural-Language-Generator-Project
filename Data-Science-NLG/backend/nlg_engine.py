"""
Natural Language Generation (NLG) Engine for Data Analysis
Converts structured statistical calculations, correlation patterns,
data quality metrics, and category aggregations into human-readable narratives.
"""
import pandas as pd
import numpy as np

class NLGEngine:
    def __init__(self):
        pass

    def generate_statistical_insights(self, stats_dict: dict) -> list:
        insights = []
        for col, stat in stats_dict.items():
            mean = stat['mean']
            median = stat['median']
            std = stat['std']
            skew = stat['skewness']

            # Basic descriptive statement
            insights.append({
                "type": "Descriptive",
                "column": col,
                "text": f"The column '{col}' has an average (mean) value of {mean:,.2f} with a median of {median:,.2f}. This indicates the typical magnitude observed across the analyzed records."
            })

            # Skewness & distribution insight
            if abs(mean - median) > (0.15 * std if std > 0 else 1):
                if mean > median:
                    insights.append({
                        "type": "Statistical Distribution",
                        "column": col,
                        "text": f"For '{col}', the average value ({mean:,.2f}) is higher than the median ({median:,.2f}), suggesting a right-skewed distribution where high-value observations pull the mean upward."
                    })
                else:
                    insights.append({
                        "type": "Statistical Distribution",
                        "column": col,
                        "text": f"For '{col}', the average value ({mean:,.2f}) is noticeably lower than the median ({median:,.2f}), indicating a left-skewed distribution where lower values exert strong influence."
                    })
            else:
                insights.append({
                    "type": "Statistical Distribution",
                    "column": col,
                    "text": f"The mean and median of '{col}' are closely aligned, signifying an approximately symmetric, balanced distribution across the dataset."
                })

            # Variability insight
            cv = (std / mean * 100) if mean != 0 else 0
            if cv > 50:
                insights.append({
                    "type": "Variability",
                    "column": col,
                    "text": f"'{col}' exhibits high variability (standard deviation of {std:,.2f}, coefficient of variation {cv:.1f}%), indicating diverse and dispersed data points."
                })

            # Outlier insight
            if stat.get('outlier_count', 0) > 0:
                cnt = stat['outlier_count']
                pct = stat['outlier_percentage']
                insights.append({
                    "type": "Outlier Detection",
                    "column": col,
                    "text": f"Detected {cnt} statistical outlier(s) ({pct}%) in '{col}' beyond 1.5× the Interquartile Range (IQR). These values represent unusually high or low observations compared to the general distribution."
                })

        return insights

    def generate_correlation_insights(self, pairs: list) -> list:
        insights = []
        for pair in pairs:
            c1 = pair['col1']
            c2 = pair['col2']
            r = pair['correlation']
            cat = pair['category']

            if cat == "Strong positive":
                text = f"'{c1}' and '{c2}' show a strong positive relationship (r = {r:.2f}). As {c1} increases, {c2} tends to increase significantly as well."
            elif cat == "Moderate positive":
                text = f"'{c1}' and '{c2}' demonstrate a moderate positive correlation (r = {r:.2f}), suggesting an upward trend between these two variables."
            elif cat == "Strong negative":
                text = f"'{c1}' and '{c2}' show a strong inverse/negative relationship (r = {r:.2f}). When {c1} rises, {c2} tends to decrease noticeably."
            elif cat == "Moderate negative":
                text = f"'{c1}' and '{c2}' show a moderate negative correlation (r = {r:.2f}), reflecting an opposing tendency."
            else:
                text = f"'{c1}' and '{c2}' have a weak or negligible linear correlation (r = {r:.2f}), indicating little to no linear dependence."

            insights.append({
                "type": "Correlation",
                "col1": c1,
                "col2": c2,
                "correlation": r,
                "category": cat,
                "text": text
            })
        return insights

    def generate_quality_insights(self, quality: dict) -> list:
        insights = []
        missing_pct = quality.get('missing_percentage', 0)
        dup_pct = quality.get('duplicate_percentage', 0)
        score = quality.get('data_quality_score', 100)

        insights.append({
            "type": "Data Health",
            "text": f"The overall Data Quality Score is calculated at {score}/100 with {quality['completeness_percentage']}% data completeness across {quality['total_rows']} records."
        })

        if missing_pct > 0:
            insights.append({
                "type": "Missing Data",
                "text": f"Approximately {missing_pct}% of total cells ({quality['missing_cells']} cells) are missing. Imputation or record removal is recommended prior to model training."
            })
            for col, bdown in quality.get('column_breakdown', {}).items():
                if bdown['percentage'] > 0:
                    insights.append({
                        "type": "Missing Data Column",
                        "column": col,
                        "text": f"Column '{col}' has {bdown['count']} missing entries ({bdown['percentage']}% of records)."
                    })
        else:
            insights.append({
                "type": "Missing Data",
                "text": "The dataset contains zero missing values, ensuring complete record integrity for statistical evaluation."
            })

        if dup_pct > 0:
            insights.append({
                "type": "Duplicates",
                "text": f"Detected {quality['duplicate_rows']} duplicate row(s) ({dup_pct}% of the dataset). De-duplication is suggested to avoid biased statistical weighting."
            })

        return insights

    def generate_category_insights(self, df: pd.DataFrame) -> list:
        insights = []
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        for ccol in cat_cols[:3]:
            val_counts = df[ccol].value_counts()
            if len(val_counts) == 0:
                continue
            top_cat = val_counts.index[0]
            top_count = val_counts.iloc[0]
            top_pct = round((top_count / len(df)) * 100, 1)

            insights.append({
                "type": "Category Distribution",
                "column": ccol,
                "text": f"In '{ccol}', '{top_cat}' is the most dominant category representing {top_count} entries ({top_pct}% of total records)."
            })

            # Cross aggregate if numerical column exists
            if len(num_cols) > 0:
                target_num = num_cols[0]
                grouped = df.groupby(ccol)[target_num].sum().sort_values(ascending=False)
                if len(grouped) > 0:
                    leader = grouped.index[0]
                    lead_val = grouped.iloc[0]
                    total_sum = grouped.sum()
                    lead_pct = round((lead_val / total_sum * 100), 1) if total_sum > 0 else 0
                    insights.append({
                        "type": "Category Aggregation",
                        "column": ccol,
                        "text": f"'{leader}' represents the highest contributor to total '{target_num}', accounting for {lead_val:,.2f} ({lead_pct}% of the cumulative sum)."
                    })

        return insights
