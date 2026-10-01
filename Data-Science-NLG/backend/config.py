import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'nlg-data-science-secure-key-2024')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/nlg_analytics_db')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max limit
    ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
