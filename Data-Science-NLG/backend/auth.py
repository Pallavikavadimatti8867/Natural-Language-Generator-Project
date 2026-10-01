import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from flask_bcrypt import generate_password_hash, check_password_hash
from config import Config

def hash_password(password: str) -> str:
    return generate_password_hash(password).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)

def create_jwt_token(user_id: str, email: str, name: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'name': name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is missing'}), 401

        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired. Please log in again.'}), 401
        except Exception:
            return jsonify({'success': False, 'message': 'Invalid authentication token.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated
