"""
Flask REST API Backend for Natural Language Generator for Data Analysis
"""
import os
import uuid
import datetime
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database import Database
from auth import hash_password, verify_password, create_jwt_token, token_required
from analysis import compute_descriptive_stats, compute_data_quality, compute_correlations
from nlg_engine import NLGEngine
from data_cleaning import DataCleaner

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db = Database.get_db()
nlg = NLGEngine()

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# In-memory session cache for datasets
USER_DATASETS = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Natural Language Generator for Data Analysis API',
        'version': '1.0.0',
        'timestamp': datetime.datetime.utcnow().isoformat()
    }), 200

# ==================== AUTHENTICATION ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    existing_user = db['users'].find_one({'email': email})
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(password)
    now = datetime.datetime.utcnow()

    user_doc = {
        'user_id': user_id,
        'name': name,
        'email': email,
        'password_hash': hashed_pwd,
        'registration_date': now.isoformat(),
        'last_login': now.isoformat()
    }
    db['users'].insert_one(user_doc)
    token = create_jwt_token(user_id, email, name)

    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to NLG Data Science Studio.',
        'token': token,
        'user': {
            'user_id': user_id,
            'name': name,
            'email': email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = db['users'].find_one({'email': email})
    if not user or not verify_password(password, user['password_hash']):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    token = create_jwt_token(user['user_id'], user['email'], user['name'])

    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'token': token,
        'user': {
            'user_id': user['user_id'],
            'name': user['name'],
            'email': user['email']
        }
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Successfully logged out.'}), 200

# ==================== DATASET UPLOAD ====================

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_dataset(current_user):
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part in request.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file.'}), 400

    filename = file.filename
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in Config.ALLOWED_EXTENSIONS:
        return jsonify({'success': False, 'message': f'Unsupported file format. Supported: {", ".join(Config.ALLOWED_EXTENSIONS)}'}), 400

    try:
        if ext == 'csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        if df.empty:
            return jsonify({'success': False, 'message': 'Uploaded file is empty.'}), 400

        dataset_id = str(uuid.uuid4())
        user_id = current_user['user_id']

        num_cols = df.select_dtypes(include=['number']).columns.tolist()
        cat_cols = df.select_dtypes(exclude=['number']).columns.tolist()

        dataset_meta = {
            'id': dataset_id,
            'user_id': user_id,
            'name': filename,
            'total_rows': int(len(df)),
            'total_columns': int(len(df.columns)),
            'columns': df.columns.tolist(),
            'numerical_columns': num_cols,
            'categorical_columns': cat_cols,
            'missing_values': int(df.isnull().sum().sum()),
            'duplicate_records': int(df.duplicated().sum()),
            'uploaded_at': datetime.datetime.utcnow().isoformat()
        }

        USER_DATASETS[f"{user_id}:{dataset_id}"] = df
        USER_DATASETS[f"{user_id}:current"] = df
        USER_DATASETS[f"{user_id}:current_meta"] = dataset_meta

        # Save to DB history
        db['datasets'].insert_one(dataset_meta)

        return jsonify({
            'success': True,
            'message': f'Dataset "{filename}" uploaded and processed successfully.',
            'dataset': dataset_meta,
            'preview': df.head(10).to_dict(orient='records')
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error reading dataset: {str(e)}'}), 500

@app.route('/api/dataset', methods=['GET'])
@token_required
def get_current_dataset(current_user):
    user_id = current_user['user_id']
    meta = USER_DATASETS.get(f"{user_id}:current_meta")
    df = USER_DATASETS.get(f"{user_id}:current")

    if df is None:
        return jsonify({'success': False, 'message': 'No active dataset found. Please upload one.'}), 404

    return jsonify({
        'success': True,
        'dataset': meta,
        'preview': df.head(20).to_dict(orient='records')
    }), 200

# ==================== DATA CLEANING ====================

@app.route('/api/clean', methods=['POST'])
@token_required
def clean_dataset(current_user):
    user_id = current_user['user_id']
    df = USER_DATASETS.get(f"{user_id}:current")
    if df is None:
        return jsonify({'success': False, 'message': 'No active dataset found.'}), 404

    data = request.get_json() or {}
    action = data.get('action')

    try:
        cleaned_df = df.copy()
        msg = "Dataset cleaned successfully."

        if action == "remove_duplicates":
            cleaned_df, removed = DataCleaner.remove_duplicates(cleaned_df)
            msg = f"Removed {removed} duplicate rows."

        elif action == "handle_missing":
            strategy = data.get('strategy', 'drop')
            val = data.get('fill_value')
            cols = data.get('columns')
            cleaned_df = DataCleaner.handle_missing(cleaned_df, strategy, val, cols)
            msg = f"Handled missing values using '{strategy}' strategy."

        elif action == "rename_column":
            old_name = data.get('old_name')
            new_name = data.get('new_name')
            if old_name and new_name:
                cleaned_df = DataCleaner.rename_columns(cleaned_df, {old_name: new_name})
                msg = f"Renamed column '{old_name}' to '{new_name}'."

        elif action == "drop_column":
            col = data.get('column')
            if col:
                cleaned_df = DataCleaner.drop_columns(cleaned_df, [col])
                msg = f"Dropped column '{col}'."

        elif action == "handle_outliers":
            col = data.get('column')
            method = data.get('method', 'clip')
            if col:
                cleaned_df = DataCleaner.handle_outliers(cleaned_df, col, method)
                msg = f"Applied outlier {method} on '{col}'."

        elif action == "normalize":
            col = data.get('column')
            method = data.get('method', 'minmax')
            if col:
                cleaned_df = DataCleaner.normalize_column(cleaned_df, col, method)
                msg = f"Normalized '{col}' using {method} scaling."

        # Update current state
        USER_DATASETS[f"{user_id}:current"] = cleaned_df
        meta = USER_DATASETS.get(f"{user_id}:current_meta", {})
        meta['total_rows'] = len(cleaned_df)
        meta['total_columns'] = len(cleaned_df.columns)
        meta['missing_values'] = int(cleaned_df.isnull().sum().sum())
        meta['duplicate_records'] = int(cleaned_df.duplicated().sum())

        return jsonify({
            'success': True,
            'message': msg,
            'dataset': meta,
            'preview': cleaned_df.head(15).to_dict(orient='records')
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Data cleaning error: {str(e)}'}), 500

# ==================== ANALYSIS & STATISTICS ====================

@app.route('/api/analyze', methods=['POST'])
@app.route('/api/statistics', methods=['GET'])
@token_required
def analyze_dataset(current_user):
    user_id = current_user['user_id']
    df = USER_DATASETS.get(f"{user_id}:current")
    if df is None:
        return jsonify({'success': False, 'message': 'No dataset available for analysis.'}), 404

    try:
        stats = compute_descriptive_stats(df)
        quality = compute_data_quality(df)
        correlations = compute_correlations(df)

        return jsonify({
            'success': True,
            'statistics': stats,
            'data_quality': quality,
            'correlations': correlations
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Analysis error: {str(e)}'}), 500

# ==================== NATURAL LANGUAGE GENERATION ====================

@app.route('/api/generate-insights', methods=['POST'])
@token_required
def generate_insights(current_user):
    user_id = current_user['user_id']
    df = USER_DATASETS.get(f"{user_id}:current")
    if df is None:
        return jsonify({'success': False, 'message': 'No dataset available for NLG insights.'}), 404

    try:
        stats = compute_descriptive_stats(df)
        quality = compute_data_quality(df)
        corrs = compute_correlations(df)

        stat_insights = nlg.generate_statistical_insights(stats)
        corr_insights = nlg.generate_correlation_insights(corrs['pairs'])
        quality_insights = nlg.generate_quality_insights(quality)
        cat_insights = nlg.generate_category_insights(df)

        all_insights = {
            'statistical': stat_insights,
            'correlation': corr_insights,
            'quality': quality_insights,
            'category': cat_insights,
            'generated_at': datetime.datetime.utcnow().isoformat()
        }

        # Store in user history
        db['insights'].insert_one({
            'user_id': user_id,
            'dataset_id': USER_DATASETS.get(f"{user_id}:current_meta", {}).get('id', 'unknown'),
            'insights': all_insights,
            'created_at': datetime.datetime.utcnow().isoformat()
        })

        return jsonify({
            'success': True,
            'insights': all_insights
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'NLG Engine error: {str(e)}'}), 500

@app.route('/api/generate-report', methods=['POST'])
@token_required
def generate_report(current_user):
    user_id = current_user['user_id']
    df = USER_DATASETS.get(f"{user_id}:current")
    meta = USER_DATASETS.get(f"{user_id}:current_meta", {})

    if df is None:
        return jsonify({'success': False, 'message': 'No dataset loaded to generate report.'}), 404

    try:
        stats = compute_descriptive_stats(df)
        quality = compute_data_quality(df)
        corrs = compute_correlations(df)

        # Generate rule-based NLG narrative
        stat_insights = nlg.generate_statistical_insights(stats)
        corr_insights = nlg.generate_correlation_insights(corrs['pairs'])
        cat_insights = nlg.generate_category_insights(df)

        # AI Executive Conclusion
        executive_summary = (
            f"The dataset '{meta.get('name', 'Uploaded Dataset')}' comprises {len(df)} rows and {len(df.columns)} features. "
            f"Overall data completeness stands at {quality['completeness_percentage']}%, earning a Data Quality Score of {quality['data_quality_score']}/100. "
            f"Key metrics demonstrate significant structural variance across numerical indicators, with prominent correlations detected between principal metrics."
        )

        report_id = str(uuid.uuid4())
        report_data = {
            'report_id': report_id,
            'user_id': user_id,
            'title': f"Exploratory Data Analysis & Natural Language Report: {meta.get('name', 'Dataset')}",
            'dataset_meta': meta,
            'data_quality': quality,
            'statistics': stats,
            'correlations': corrs,
            'key_insights': {
                'statistical': stat_insights[:4],
                'correlation': corr_insights[:4],
                'category': cat_insights[:3]
            },
            'executive_summary': executive_summary,
            'created_at': datetime.datetime.utcnow().isoformat()
        }

        db['reports'].insert_one(report_data)

        return jsonify({
            'success': True,
            'report': report_data
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f'Report generation failed: {str(e)}'}), 500

# ==================== USER HISTORY ====================

@app.route('/api/history', methods=['GET'])
@token_required
def get_user_history(current_user):
    user_id = current_user['user_id']
    datasets = list(db['datasets'].find({'user_id': user_id}))
    reports = list(db['reports'].find({'user_id': user_id}))

    return jsonify({
        'success': True,
        'datasets': datasets,
        'reports': reports
    }), 200

@app.route('/api/history/<item_id>', methods=['DELETE'])
@token_required
def delete_history_item(current_user, item_id):
    user_id = current_user['user_id']
    res1 = db['datasets'].delete_one({'id': item_id, 'user_id': user_id})
    res2 = db['reports'].delete_one({'report_id': item_id, 'user_id': user_id})

    if res1.deleted_count > 0 or res2.deleted_count > 0:
        return jsonify({'success': True, 'message': 'History item removed.'}), 200
    return jsonify({'success': False, 'message': 'Item not found.'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
