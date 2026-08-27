import os
import json
import uuid
import datetime
import hashlib
from flask import Blueprint, request, jsonify
from web_app.jwt_utils import jwt_required, current_app

from src.learning_path import LearningPathGenerator
from web_app.models import db, UserLearningPath, LearningProgress

path_bp = Blueprint('path_api', __name__, url_prefix='/api/paths')


@path_bp.route('/generate', methods=['POST'])
@jwt_required
def generate_path(current_user):
    """Generate a new AI learning path for the authenticated user."""
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        expertise_level = data.get('expertise_level', '').strip()
        time_commitment = data.get('time_commitment', '').strip()
        duration_weeks = int(data.get('duration_weeks', 0))
        learning_style = data.get('learning_style', 'visual')

        if not topic or not expertise_level or not time_commitment:
            return jsonify({'success': False, 'error': 'Missing required fields: topic, expertise_level, time_commitment'}), 400

        generator = LearningPathGenerator()
        learning_path = generator.generate_path(
            topic=topic,
            expertise_level=expertise_level,
            time_commitment=time_commitment,
            learning_style=learning_style,
            duration_weeks=duration_weeks,
            user_id=current_user.id
        )

        path_dict = learning_path.model_dump()

        # --- Persist the path to the database ---
        db_path = UserLearningPath(
            id=path_dict.get('id', str(uuid.uuid4())),
            user_id=current_user.id,
            path_data_json=path_dict,
            title=path_dict.get('title', topic),
            topic=path_dict.get('topic', topic),
        )
        db.session.add(db_path)
        db.session.commit()

        return jsonify({'success': True, 'path': path_dict})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Generate Path API Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@path_bp.route('/', methods=['GET'])
@jwt_required
def get_user_paths(current_user):
    """Get all learning paths for the authenticated user."""
    try:
        paths = UserLearningPath.query.filter_by(
            user_id=current_user.id, is_archived=False
        ).order_by(UserLearningPath.created_at.desc()).all()

        # Calculate progress for each path
        path_list = []
        for p in paths:
            milestones = []
            if isinstance(p.path_data_json, dict):
                milestones = p.path_data_json.get('milestones', [])
            total = len(milestones)

            # Count completed milestones
            completed = LearningProgress.query.filter_by(
                user_learning_path_id=p.id,
                status='completed'
            ).count()

            progress_pct = round((completed / total) * 100) if total > 0 else 0

            path_list.append({
                'id': p.id,
                'title': p.title,
                'topic': p.topic,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'last_accessed_at': p.last_accessed_at.isoformat() if p.last_accessed_at else None,
                'total_milestones': total,
                'completed_milestones': completed,
                'progress_pct': progress_pct,
            })

        return jsonify({'success': True, 'paths': path_list})
    except Exception as e:
        current_app.logger.error(f"Get Paths Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@path_bp.route('/<path_id>', methods=['GET'])
@jwt_required
def get_path_details(current_user, path_id):
    """Get details for a specific learning path."""
    try:
        # Allow anyone with the path_id to view (useful for sharing)
        path = UserLearningPath.query.filter_by(id=path_id).first()
        if not path:
            return jsonify({'success': False, 'message': 'Path not found'}), 404

        # Update last accessed
        path.last_accessed_at = datetime.datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'path': path.path_data_json})
    except Exception as e:
        current_app.logger.error(f"Get Path Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@path_bp.route('/<path_id>/archive', methods=['POST'])
@jwt_required
def archive_path(current_user, path_id):
    """Archive a learning path."""
    try:
        path = UserLearningPath.query.filter_by(id=path_id, user_id=current_user.id).first()
        if not path:
            return jsonify({'success': False, 'message': 'Path not found'}), 404
        path.is_archived = True
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@path_bp.route('/<path_id>/delete', methods=['DELETE'])
@jwt_required
def delete_path(current_user, path_id):
    """Delete a learning path."""
    try:
        path = UserLearningPath.query.filter_by(id=path_id, user_id=current_user.id).first()
        if not path:
            return jsonify({'success': False, 'message': 'Path not found'}), 404
        db.session.delete(path)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@path_bp.route('/stats', methods=['GET'])
@jwt_required
def get_user_stats(current_user):
    """Get aggregate stats for the dashboard."""
    try:
        total_paths = UserLearningPath.query.filter_by(
            user_id=current_user.id, is_archived=False
        ).count()

        total_completed = LearningProgress.query.join(
            UserLearningPath,
            LearningProgress.user_learning_path_id == UserLearningPath.id
        ).filter(
            UserLearningPath.user_id == current_user.id,
            LearningProgress.status == 'completed'
        ).count()

        # Streak: count consecutive days with activity (simplified)
        streak = 0
        if current_user.login_count and current_user.login_count > 0:
            streak = min(current_user.login_count, 30)  # Cap at 30, show real login count

        return jsonify({
            'success': True,
            'stats': {
                'total_paths': total_paths,
                'total_completed_milestones': total_completed,
                'streak': streak,
                'member_since': current_user.created_at.strftime('%B %Y') if current_user.created_at else 'Recently'
            }
        })
    except Exception as e:
        current_app.logger.error(f"Stats Error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500
