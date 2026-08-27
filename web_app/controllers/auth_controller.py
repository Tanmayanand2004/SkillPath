import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from web_app.models import db, User
from web_app.jwt_utils import generate_token, jwt_required

auth_bp = Blueprint('auth_api', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', '')
    username = data.get('username')
    
    if not email or not password or not username:
        return jsonify({'success': False, 'message': 'Email, username, and password are required.'}), 400
        
    # Email validation (basic)
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'success': False, 'message': 'Invalid email address.'}), 400
        
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered.'}), 409
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already taken.'}), 409
        
    try:
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            display_name=full_name or username
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        token = generate_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful.',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'full_name': user.full_name,
                'profile_pic_url': user.profile_pic_url
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401
        
    # Update streak (using login_count field for now) and last_seen
    from datetime import datetime
    now = datetime.utcnow()
    
    if user.last_seen:
        days_diff = (now.date() - user.last_seen.date()).days
        if days_diff == 1:
            # Consecutive day
            user.login_count += 1
        elif days_diff > 1:
            # Streak broken
            user.login_count = 1
        # If days_diff == 0, it's the same day, streak stays the same
    else:
        user.login_count = 1
        
    user.last_seen = now
    db.session.commit()
    
    token = generate_token(user.id)
    
    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'full_name': user.full_name,
            'profile_pic_url': user.profile_pic_url
        }
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_me(current_user):
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'username': current_user.username,
            'full_name': current_user.full_name,
            'display_name': current_user.display_name,
            'profile_pic_url': current_user.profile_pic_url,
            'bio': current_user.bio,
            'learning_goals': current_user.learning_goals
        }
    })

@auth_bp.route('/profile', methods=['POST'])
@jwt_required
def update_profile(current_user):
    data = request.get_json()
    
    if 'full_name' in data:
        current_user.full_name = data['full_name']
    if 'display_name' in data:
        current_user.display_name = data['display_name']
    if 'bio' in data:
        current_user.bio = data['bio']
    if 'profile_pic_url' in data:
        current_user.profile_pic_url = data['profile_pic_url']
    if 'learning_goals' in data:
        current_user.learning_goals = data['learning_goals']
        
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully.',
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'username': current_user.username,
                'full_name': current_user.full_name,
                'display_name': current_user.display_name,
                'profile_pic_url': current_user.profile_pic_url,
                'bio': current_user.bio,
                'learning_goals': current_user.learning_goals
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500
