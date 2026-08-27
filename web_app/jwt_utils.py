import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from web_app.models import User

def generate_token(user_id):
    """Generates a JWT token for the user."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id)
    }
    # Use SECRET_KEY from current app
    return jwt.encode(payload, current_app.config.get('SECRET_KEY', 'default_secret_key_change_in_prod'), algorithm='HS256')

def decode_token(token):
    """Decodes a JWT token."""
    payload = jwt.decode(token, current_app.config.get('SECRET_KEY', 'default_secret_key_change_in_prod'), algorithms=['HS256'])
    return payload['sub']

def jwt_required(f):
    """Decorator to require JWT authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'message': 'Missing Authorization Header. Token required.'}), 401
        
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            current_app.logger.error("JWT ERROR: Bearer token malformed")
            return jsonify({'success': False, 'message': 'Bearer token malformed.'}), 401
            
        try:
            result = decode_token(token)
        except jwt.ExpiredSignatureError:
            current_app.logger.error("JWT ERROR: Signature expired")
            return jsonify({'success': False, 'message': 'Signature expired. Please log in again.'}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.error(f"JWT ERROR: Invalid token - {str(e)}")
            return jsonify({'success': False, 'message': 'Invalid token. Please log in again.'}), 401
            
        user = User.query.get(result)
        if not user:
            current_app.logger.error(f"JWT Validation Failed: User {result} not found in DB")
            return jsonify({'success': False, 'message': 'User not found.'}), 401

            
        # Add user to kwargs so the route can use it
        kwargs['current_user'] = user
        return f(*args, **kwargs)
    return decorated_function
